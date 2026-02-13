(() => {
  const regenBtn = document.getElementById("regenBtn");

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const clamp01 = (v) => clamp(v, 0, 1);
  const lerp = (a, b, t) => a + (b - a) * t;
  const nowMs = () => performance.now();

  let ctx = null;
  let engine = null;
  let audioReady = false;
  let pendingPatch = null;
  let motionActive = false;

  const motion = {
    t: 0,
    omega: 0,
    omegaRaw: 0,
    roll: 0,
    pitch: 0,
    yaw: 0,
    accLin: 0,
    jerk: 0,
    swing: 0,
    smooth: 1,
    energy: 0,
    strikeReadyAt: 0,
    lastLin: 0,
    gLP: { x: 0, y: 0, z: 0, has: false },
    lastOri: null,
    lastOriT: 0
  };

  const SETTINGS = {
    omegaMax: 620,
    omegaSlew: 0.08,
    swingAtk: 0.12,
    swingRel: 0.04,
    energyAtk: 0.06,
    energyRel: 0.02,
    smoothAtk: 0.12,
    smoothRel: 0.04,
    jerkMax: 24,
    strikeThr: 11,
    strikeJerk: 18,
    strikeCooldownMs: 200
  };

  const RNG = {
    seed: Math.floor(Math.random() * 1e9),
    next() {
      let t = (RNG.seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    range(min, max) {
      return lerp(min, max, RNG.next());
    }
  };

  function ensureAudio() {
    if (ctx) return ctx;
    ctx = new (window.AudioContext || window.webkitAudioContext)();

    engine = createEngine(ctx);
    audioReady = true;
    return ctx;
  }

  function makePatch() {
    RNG.seed = Math.floor(Math.random() * 1e9);
    const patch = {
      baseHz: RNG.range(70, 140),
      detune: RNG.range(4, 26),
      subMix: RNG.range(0.18, 0.55),
      noiseMix: RNG.range(0.04, 0.22),
      humLP: RNG.range(800, 2600),
      whooshLP: RNG.range(420, 1800),
      drive: RNG.range(0.2, 0.85),
      resQ: RNG.range(8, 24),
      resGain: RNG.range(0.12, 0.34),
      clash: {
        bite: RNG.range(0.4, 1.0),
        noise: RNG.range(0.6, 1.0),
        ring: RNG.range(160, 520),
        ringQ: RNG.range(10, 28)
      }
    };

    patch.resFreqs = Array.from({ length: 5 }).map((_, i) => {
      const mult = 2 + i * 0.8 + RNG.range(-0.15, 0.25);
      return patch.baseHz * mult + RNG.range(-30, 50);
    });

    return patch;
  }

  function createEngine(ctx) {
    const master = ctx.createGain();
    master.gain.value = 0.85;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value = 18;
    comp.ratio.value = 6;
    comp.attack.value = 0.003;
    comp.release.value = 0.12;

    const limiter = ctx.createGain();
    limiter.gain.value = 0.9;

    master.connect(comp);
    comp.connect(limiter);
    limiter.connect(ctx.destination);

    const stereo = buildStereoBands(ctx, master);

    const noiseBuf = makeNoiseBuffer(ctx);

    const bus = ctx.createGain();
    bus.gain.value = 1.0;
    bus.connect(stereo.entry);

    const hum = createHum(ctx, bus, noiseBuf);

    const drive = makeDrive(ctx);
    hum.mix.connect(drive.input);
    drive.output.connect(bus);

    return {
      ctx,
      master,
      bus,
      stereo,
      hum,
      drive,
      patch: null,
      applyPatch,
      update,
      randomize
    };

    function applyPatch(patch) {
      if (!patch) return;
      this.patch = patch;
      hum.setPatch(patch);
      drive.setAmount(patch.drive);
      randomizeStereoByFreq(stereo, RNG.next.bind(RNG));
    }

    function randomize() {
      const patch = makePatch();
      this.applyPatch(patch);
      return patch;
    }

    function update(state) {
      if (!this.patch) return;
      hum.update(state, this.patch);
      const panShift = clamp(state.roll / 45, -1, 1) * 0.4;
      stereo.bands.forEach((b) => {
        const target = clamp(b.basePan + panShift, -1, 1);
        b.pan.pan.setTargetAtTime(target, ctx.currentTime, 0.04);
      });

      if (state.strike) {
        triggerClash(ctx, stereo.entry, noiseBuf, this.patch, state.strike);
      }
    }
  }

  function makeDrive(ctx) {
    const input = ctx.createGain();
    const shaper = ctx.createWaveShaper();
    const output = ctx.createGain();
    input.connect(shaper);
    shaper.connect(output);

    function setAmount(amount) {
      const k = clamp(amount, 0, 1) * 80 + 10;
      const curve = new Float32Array(44100);
      for (let i = 0; i < curve.length; i++) {
        const x = (i / (curve.length - 1)) * 2 - 1;
        curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
      }
      shaper.curve = curve;
      shaper.oversample = "2x";
    }

    return { input, output, setAmount };
  }

  function createHum(ctx, bus, noiseBuf) {
    const mix = ctx.createGain();
    mix.gain.value = 0.9;

    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    oscA.type = "sawtooth";
    oscB.type = "square";
    oscSub.type = "triangle";

    const oscGainA = ctx.createGain();
    const oscGainB = ctx.createGain();
    const oscGainSub = ctx.createGain();

    oscGainA.gain.value = 0.6;
    oscGainB.gain.value = 0.45;
    oscGainSub.gain.value = 0.4;

    oscA.connect(oscGainA);
    oscB.connect(oscGainB);
    oscSub.connect(oscGainSub);

    oscGainA.connect(mix);
    oscGainB.connect(mix);
    oscGainSub.connect(mix);

    const humLP = ctx.createBiquadFilter();
    humLP.type = "lowpass";
    humLP.Q.value = 0.8;

    const humGain = ctx.createGain();
    humGain.gain.value = 0.0;

    mix.connect(humLP);
    humLP.connect(humGain);

    const whoosh = ctx.createBiquadFilter();
    whoosh.type = "bandpass";
    whoosh.Q.value = 2.2;

    const whooshGain = ctx.createGain();
    whooshGain.gain.value = 0.0;

    humLP.connect(whoosh);
    whoosh.connect(whooshGain);

    const resSend = ctx.createGain();
    resSend.gain.value = 0.6;
    humLP.connect(resSend);

    const resonators = Array.from({ length: 5 }).map(() => {
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.Q.value = 14;

      const g = ctx.createGain();
      g.gain.value = 0.0;

      const pan = ctx.createStereoPanner();
      pan.pan.value = 0;

      resSend.connect(bp);
      bp.connect(g);
      g.connect(pan);
      pan.connect(bus);

      return { bp, g, pan };
    });

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;

    const noiseHP = ctx.createBiquadFilter();
    noiseHP.type = "highpass";
    noiseHP.frequency.value = 300;
    noiseHP.Q.value = 0.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.0;

    noise.connect(noiseHP);
    noiseHP.connect(noiseGain);

    const sum = ctx.createGain();
    sum.gain.value = 0.9;
    humGain.connect(sum);
    whooshGain.connect(sum);
    noiseGain.connect(sum);
    sum.connect(bus);

    oscA.start();
    oscB.start();
    oscSub.start();
    noise.start();

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.8;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 20;
    lfo.connect(lfoGain);
    lfoGain.connect(oscB.detune);
    lfo.start();

    function setPatch(patch) {
      const t = ctx.currentTime;
      oscA.frequency.setTargetAtTime(patch.baseHz, t, 0.05);
      oscB.frequency.setTargetAtTime(patch.baseHz * 1.01, t, 0.05);
      oscSub.frequency.setTargetAtTime(patch.baseHz * 0.5, t, 0.05);
      oscB.detune.setTargetAtTime(patch.detune * 2, t, 0.05);
      oscGainSub.gain.setTargetAtTime(patch.subMix, t, 0.05);
      humLP.frequency.setTargetAtTime(patch.humLP, t, 0.08);
      whoosh.frequency.setTargetAtTime(patch.whooshLP, t, 0.08);
      noiseGain.gain.setTargetAtTime(patch.noiseMix, t, 0.08);

      resonators.forEach((r, i) => {
        r.bp.frequency.setTargetAtTime(patch.resFreqs[i], t, 0.08);
        r.bp.Q.setTargetAtTime(patch.resQ, t, 0.08);
      });
    }

    function update(state, patch) {
      const t = ctx.currentTime;
      const swing = clamp01(state.swing);
      const smooth = clamp01(state.smooth);
      const energy = clamp01(state.energy);

      const pitch = patch.baseHz * (1 + swing * 0.55 + energy * 0.45);
      oscA.frequency.setTargetAtTime(pitch, t, 0.02);
      oscB.frequency.setTargetAtTime(pitch * 1.01, t, 0.02);
      oscSub.frequency.setTargetAtTime(pitch * 0.5, t, 0.02);

      const humCut = patch.humLP + 2400 * swing + 1200 * energy;
      humLP.frequency.setTargetAtTime(humCut, t, 0.03);

      const whooshCut = patch.whooshLP + 1200 * swing;
      whoosh.frequency.setTargetAtTime(whooshCut, t, 0.04);

      const humAmp = 0.12 + 0.6 * energy + 0.4 * swing;
      humGain.gain.setTargetAtTime(humAmp, t, 0.05);

      const whooshAmp = 0.04 + 0.5 * swing * smooth;
      whooshGain.gain.setTargetAtTime(whooshAmp, t, 0.06);

      const noiseAmt = patch.noiseMix * (0.6 + 0.8 * swing);
      noiseGain.gain.setTargetAtTime(noiseAmt, t, 0.06);

      resonators.forEach((r, i) => {
        const wob = Math.sin(t * 2.0 + i) * 0.06 * swing;
        r.g.gain.setTargetAtTime(patch.resGain * (0.3 + 1.4 * energy) * (1 + wob), t, 0.06);
      });
    }

    return { mix, update, setPatch };
  }

  function buildStereoBands(ctx, master) {
    const entry = ctx.createGain();
    entry.gain.value = 1.0;

    const bands = [];
    const centers = [90, 140, 210, 320, 480, 720, 1100, 1600, 2500, 4000, 6200, 9000];
    const Qs = [1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8, 3.0, 3.2, 3.4];

    centers.forEach((fc, i) => {
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = fc;
      bp.Q.value = Qs[i % Qs.length];

      const g = ctx.createGain();
      g.gain.value = 0.18;

      const pan = ctx.createStereoPanner();
      pan.pan.value = 0;

      entry.connect(bp);
      bp.connect(g);
      g.connect(pan);
      pan.connect(master);

      bands.push({ bp, gain: g, pan, fc, basePan: 0 });
    });

    const dry = ctx.createGain();
    dry.gain.value = 0.5;
    entry.connect(dry);
    dry.connect(master);

    return { entry, bands, dry };
  }

  function randomizeStereoByFreq(stereo, rng) {
    if (!stereo || !stereo.bands.length) return;
    const t = stereo.entry.context.currentTime;
    stereo.bands.forEach((b) => {
      const fNorm = (Math.log(b.fc) - Math.log(90)) / (Math.log(9000) - Math.log(90));
      const maxPan = lerp(0.25, 1.0, clamp01(fNorm));
      const pan = (rng() * 2 - 1) * maxPan;
      const g = lerp(0.1, 0.26, rng());
      b.gain.gain.setTargetAtTime(g, t, 0.01);
      b.pan.pan.setTargetAtTime(pan, t, 0.01);
      b.basePan = pan;
    });
  }

  function makeNoiseBuffer(ctx) {
    const len = Math.floor(ctx.sampleRate * 2.0);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let lfsr = 0xACE1;
    for (let i = 0; i < len; i++) {
      const bit = ((lfsr >> 0) ^ (lfsr >> 2) ^ (lfsr >> 3) ^ (lfsr >> 5)) & 1;
      lfsr = (lfsr >> 1) | (bit << 15);
      d[i] = (lfsr & 1 ? 1 : -1) * 0.9;
    }
    return buf;
  }

  function triggerClash(ctx, destination, noiseBuf, patch, intensity = 1) {
    const t0 = ctx.currentTime;
    const dur = 0.18 + 0.22 * intensity;

    const g = ctx.createGain();
    g.gain.value = 0.0;

    const n = ctx.createBufferSource();
    n.buffer = noiseBuf;
    n.loop = true;

    const nBP = ctx.createBiquadFilter();
    nBP.type = "bandpass";
    nBP.frequency.value = patch.clash.ring * 2.4;
    nBP.Q.value = patch.clash.ringQ * 0.6;

    const nHP = ctx.createBiquadFilter();
    nHP.type = "highpass";
    nHP.frequency.value = 600;

    const nG = ctx.createGain();
    nG.gain.value = patch.clash.noise;

    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = patch.clash.ring + 120;

    const oscG = ctx.createGain();
    oscG.gain.value = 0.0;

    const ring = ctx.createBiquadFilter();
    ring.type = "bandpass";
    ring.frequency.value = patch.clash.ring;
    ring.Q.value = patch.clash.ringQ;

    n.connect(nBP);
    nBP.connect(nHP);
    nHP.connect(nG);
    nG.connect(g);

    osc.connect(ring);
    ring.connect(oscG);
    oscG.connect(g);

    g.connect(destination);

    const peak = clamp01(intensity) * 1.4 + 0.3;
    g.gain.setValueAtTime(0.0, t0);
    g.gain.linearRampToValueAtTime(peak, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    oscG.gain.setValueAtTime(patch.clash.bite * 0.6, t0);
    oscG.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.7);

    n.start(t0);
    osc.start(t0);
    n.stop(t0 + dur + 0.05);
    osc.stop(t0 + dur + 0.05);
  }

  function startMotion() {
    if (motionActive) return;
    motionActive = true;
    window.addEventListener("devicemotion", onDeviceMotion, { passive: true });
    window.addEventListener("deviceorientation", onDeviceOrientation, { passive: true });
  }

  function onDeviceMotion(e) {
    const t = nowMs();
    const dt = Math.max(0.008, (t - (motion.t || t)) / 1000);
    motion.t = t;

    const rot = e.rotationRate || { alpha: 0, beta: 0, gamma: 0 };
    const omega = Math.hypot(rot.alpha || 0, rot.beta || 0, rot.gamma || 0);
    motion.omegaRaw = omega;
    motion.omega = lerp(motion.omega, omega, SETTINGS.omegaSlew);

    const acc = e.acceleration;
    const accG = e.accelerationIncludingGravity;
    let linMag = 0;

    if (acc && isFinite(acc.x)) {
      linMag = Math.hypot(acc.x || 0, acc.y || 0, acc.z || 0);
    } else if (accG && isFinite(accG.x)) {
      const g = motion.gLP;
      const alpha = dt / (0.4 + dt);
      if (!g.has) {
        g.x = accG.x || 0;
        g.y = accG.y || 0;
        g.z = accG.z || 0;
        g.has = true;
      }
      g.x = lerp(g.x, accG.x || 0, alpha);
      g.y = lerp(g.y, accG.y || 0, alpha);
      g.z = lerp(g.z, accG.z || 0, alpha);
      const lx = (accG.x || 0) - g.x;
      const ly = (accG.y || 0) - g.y;
      const lz = (accG.z || 0) - g.z;
      linMag = Math.hypot(lx, ly, lz);
    }

    const jerk = (linMag - motion.lastLin) / dt;
    motion.lastLin = linMag;

    motion.accLin = linMag;
    motion.jerk = lerp(motion.jerk, Math.abs(jerk), 0.2);

    updateMotionState(dt);
  }

  function onDeviceOrientation(e) {
    if (motion.omegaRaw > 0.1) return;
    const t = nowMs();
    if (motion.lastOri == null) {
      motion.lastOri = { a: e.alpha || 0, b: e.beta || 0, g: e.gamma || 0 };
      motion.lastOriT = t;
      return;
    }

    const dt = Math.max(0.008, (t - motion.lastOriT) / 1000);
    const da = (e.alpha || 0) - motion.lastOri.a;
    const db = (e.beta || 0) - motion.lastOri.b;
    const dg = (e.gamma || 0) - motion.lastOri.g;

    motion.omega = lerp(motion.omega, Math.hypot(da, db, dg) / dt, 0.08);
    motion.lastOri = { a: e.alpha || 0, b: e.beta || 0, g: e.gamma || 0 };
    motion.lastOriT = t;

    motion.roll = e.gamma || 0;
    motion.pitch = e.beta || 0;
    motion.yaw = e.alpha || 0;
  }

  function updateMotionState(dt) {
    const omega01 = clamp(motion.omega / SETTINGS.omegaMax, 0, 1.2);

    const swingTarget = clamp01(omega01);
    const swingAtk = swingTarget > motion.swing ? SETTINGS.swingAtk : SETTINGS.swingRel;
    motion.swing = lerp(motion.swing, swingTarget, swingAtk);

    const jerkNorm = clamp01(motion.jerk / SETTINGS.jerkMax);
    const smoothTarget = clamp01(1 - jerkNorm);
    const smoothAtk = smoothTarget > motion.smooth ? SETTINGS.smoothAtk : SETTINGS.smoothRel;
    motion.smooth = lerp(motion.smooth, smoothTarget, smoothAtk);

    const energyTarget = clamp01(motion.swing * (0.4 + 0.6 * motion.smooth));
    const eAtk = energyTarget > motion.energy ? SETTINGS.energyAtk : SETTINGS.energyRel;
    motion.energy = lerp(motion.energy, energyTarget, eAtk);

    let strike = 0;
    const strikeAllowed = nowMs() > motion.strikeReadyAt;
    if (strikeAllowed && motion.accLin > SETTINGS.strikeThr && motion.jerk > SETTINGS.strikeJerk) {
      strike = clamp01((motion.accLin - SETTINGS.strikeThr) / 6 + motion.swing * 0.6);
      motion.strikeReadyAt = nowMs() + SETTINGS.strikeCooldownMs;
    }

    if (engine && audioReady) {
      engine.update({
        swing: motion.swing,
        smooth: motion.smooth,
        energy: motion.energy,
        roll: motion.roll,
        strike
      });
    }
  }

  async function requestMotionPermissions() {
    const needsPerm = typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function";

    if (!needsPerm) return true;

    try {
      const motionPerm = await DeviceMotionEvent.requestPermission();
      const orientPerm = typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
        ? await DeviceOrientationEvent.requestPermission()
        : "granted";
      return motionPerm === "granted" && orientPerm === "granted";
    } catch (_) {
      return false;
    }
  }

  function startLoop() {
    function tick() {
      if (engine && audioReady) {
        engine.update({
          swing: motion.swing,
          smooth: motion.smooth,
          energy: motion.energy,
          roll: motion.roll,
          strike: 0
        });
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  async function handleRegen() {
    ensureAudio();
    if (ctx.state !== "running") await ctx.resume();

    const allowed = await requestMotionPermissions();
    if (allowed) startMotion();

    if (engine) {
      if (pendingPatch) {
        engine.applyPatch(pendingPatch);
        pendingPatch = null;
      } else {
        engine.randomize();
      }
    }
  }

  regenBtn.addEventListener("click", handleRegen);

  pendingPatch = makePatch();
  startLoop();
})();
