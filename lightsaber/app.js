(() => {
  const regenBtn = document.getElementById("regenBtn");
  const playBtn = document.getElementById("playBtn");
  const voiceGrid = document.getElementById("voiceGrid");
  const controls = document.getElementById("controls");
  const activeLabel = document.getElementById("activeLabel");
  const noisePlayBtn = document.getElementById("noisePlayBtn");
  const noiseEnvLine = document.getElementById("noiseEnvLine");
  const startOverlay = document.getElementById("startOverlay");
  const startBtn = document.getElementById("startBtn");

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const clamp01 = (v) => clamp(v, 0, 1);
  const lerp = (a, b, t) => a + (b - a) * t;
  //
  const PARAMS = [
    { key: "mode", label: "Mode" },
    { key: "oscType", label: "Oscillator" },
    { key: "singleOsc", label: "Single Osc" },
    { key: "unisonSpread", label: "Unison Spread" },
    { key: "pwmOn", label: "PWM On" },
    { key: "pwm", label: "PWM" },
    { key: "oscRate", label: "Osc Rate" },
    { key: "baseHz", label: "Base Pitch" },
    { key: "detune", label: "Detune" },
    { key: "subMix", label: "Sub Mix" },
    { key: "noiseMix", label: "Noise Mix" },
    { key: "filterCutoff", label: "Filter Cutoff" },
    { key: "filterQ", label: "Filter Resonance" },
    { key: "edge", label: "Bandpass Edge" },
    { key: "drive", label: "Drive" },
    { key: "bassHz", label: "Bass Pitch" },
    { key: "bassLP", label: "Bass LPF" },
    { key: "bassRes", label: "Bass Resonance" },
    { key: "bassDrive", label: "Bass Drive" },
    { key: "bassLfoPitch", label: "Bass Pitch LFO" },
    { key: "bassLfoPitchRate", label: "Bass Pitch LFO Rate" },
    { key: "bassLfoLPF", label: "Bass LPF LFO" },
    { key: "bassLfoLPFRate", label: "Bass LPF LFO Rate" },
    { key: "bassLfoRes", label: "Bass Res LFO" },
    { key: "bassLfoResRate", label: "Bass Res LFO Rate" },
    { key: "bassLfoDrive", label: "Bass Drive LFO" },
    { key: "bassLfoDriveRate", label: "Bass Drive LFO Rate" },
    { key: "bassDrift", label: "Bass Drift" },
    { key: "noiseType", label: "Noise Type" },
    { key: "noiseBehavior", label: "Noise Behavior" },
    { key: "noiseAms", label: "Noise A ms" },
    { key: "noiseSms", label: "Noise S ms" },
    { key: "noiseDms", label: "Noise D ms" },
    { key: "noiseEnvelope", label: "Noise Envelope" },
    { key: "noiseLPF", label: "Noise LPF" },
    { key: "noiseRes", label: "Noise Resonance" },
    { key: "noiseHPF", label: "Noise HPF" },
    { key: "noiseBPF", label: "Noise BPF" },
    { key: "noiseBPWidth", label: "Noise BP Width" },
    { key: "noiseSweepAmt", label: "Noise Sweep Amount" },
    { key: "noiseSweepTime", label: "Noise Sweep Time" },
    { key: "noiseDrive", label: "Noise Drive" },
    { key: "noiseFlutterAmt", label: "Noise Flutter Amount" },
    { key: "noiseFlutterRate", label: "Noise Flutter Rate" },
    { key: "stereoWidth", label: "Stereo Width" },
    { key: "spatialize", label: "Freq Spatialize" },
    { key: "gain", label: "Voice Gain" }
  ];

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
    },
    pick(arr) {
      return arr[Math.floor(RNG.next() * arr.length)];
    }
  };
  const NOISE_ENV_TOTAL_MS = 5000;

  function skewLow(rngFn, power = 4) {
    return Math.pow(clamp01(rngFn()), power);
  }

  function skewLowWithSpikes(rngFn, power = 4, spikeChance = 0.12) {
    const v = skewLow(rngFn, power);
    if (rngFn() < spikeChance) {
      return 1 - Math.pow(clamp01(rngFn()), 1.2);
    }
    return v;
  }

  const defaults = () => ({
    mode: "texture",
    oscType: RNG.pick(["sawtooth", "square", "triangle", "sine"]),
    singleOsc: false,
    unisonSpread: +RNG.range(0.0, 0.012).toFixed(4),
    pwmOn: true,
    pwm: +RNG.range(0.08, 0.92).toFixed(2),
    oscRate: +RNG.range(0.7, 1.6).toFixed(2),
    baseHz: Math.round(RNG.range(70, 190)),
    detune: Math.round(RNG.range(0, 24)),
    subMix: +RNG.range(0.12, 0.55).toFixed(2),
    noiseMix: 0,
    filterCutoff: Math.round(RNG.range(400, 2800)),
    filterQ: +RNG.range(0.5, 8.0).toFixed(1),
    edge: +RNG.range(0.0, 0.7).toFixed(2),
    drive: +RNG.range(0.1, 0.8).toFixed(2),
    bassHz: Math.round(RNG.range(40, 120)),
    bassLP: Math.round(RNG.range(90, 300)),
    bassRes: +RNG.range(0.4, 3.0).toFixed(1),
    bassDrive: +RNG.range(0.0, 0.6).toFixed(2),
    bassLfoPitch: +RNG.range(0.0, 0.6).toFixed(2),
    bassLfoPitchRate: +RNG.range(0.0, 0.6).toFixed(2),
    bassLfoLPF: +RNG.range(0.0, 0.6).toFixed(2),
    bassLfoLPFRate: +RNG.range(0.0, 0.6).toFixed(2),
    bassLfoRes: +RNG.range(0.0, 0.6).toFixed(2),
    bassLfoResRate: +RNG.range(0.0, 0.6).toFixed(2),
    bassLfoDrive: +RNG.range(0.0, 0.6).toFixed(2),
    bassLfoDriveRate: +RNG.range(0.0, 0.6).toFixed(2),
    bassDrift: +RNG.range(0.0, 0.3).toFixed(2),
    noiseType: RNG.pick(["white", "pink", "bit", "metallic"]),
    noiseBehavior: RNG.next() < 0.3 ? "oneshot" : "sustain",
    noiseAms: Math.round(RNG.range(80, 900)),
    noiseSms: Math.round(RNG.range(300, 1800)),
    noiseDms: Math.round(RNG.range(400, 2800)),
    noiseLPF: Math.round(RNG.range(350, 9000)),
    noiseRes: +RNG.range(0.4, 5.0).toFixed(1),
    noiseHPF: Math.round(RNG.range(20, 1200)),
    noiseBPF: Math.round(RNG.range(130, 3200)),
    noiseBPWidth: +RNG.range(0.2, 0.85).toFixed(2),
    noiseSweepAmt: +RNG.range(-0.9, 0.9).toFixed(2),
    noiseSweepTime: +RNG.range(0.03, 0.9).toFixed(2),
    noiseDrive: +RNG.range(0.0, 0.9).toFixed(2),
    noiseFlutterAmt: +RNG.range(0.0, 0.45).toFixed(2),
    noiseFlutterRate: +RNG.range(0.0, 10.0).toFixed(1),
    stereoWidth: 0.5,
    spatialize: 0.5,
    gain: 0.5
  });

  function randomizeVoice(p) {
    const rand = RNG.next.bind(RNG);
    const mode = RNG.pick(["texture", "bass", "noise"]);
    p.mode = mode;
    p.oscType = RNG.pick(["sawtooth", "square", "triangle", "sine"]);
    p.singleOsc = false;

    const uni = skewLowWithSpikes(rand, 4.5, 0.12);
    p.unisonSpread = +Math.max(0.0001, lerp(0.0, 0.02, uni)).toFixed(4);

    const det = skewLowWithSpikes(rand, 4.0, 0.12);
    p.detune = Math.max(1, Math.round(lerp(0, 60, det)));

    p.pwmOn = RNG.next() > 0.2;
    p.pwm = +RNG.range(0.08, 0.92).toFixed(2);
    p.oscRate = +RNG.range(0.7, 1.6).toFixed(2);
    p.baseHz = Math.round(RNG.range(70, 190));
    p.subMix = +RNG.range(0.08, 0.55).toFixed(2);
    const noiseOn = Math.floor(rand() * 12) === 0;
    p.noiseMix = noiseOn ? +RNG.range(0.02, 0.4).toFixed(2) : 0;
    p.filterCutoff = Math.round(RNG.range(400, 2800));
    p.filterQ = +RNG.range(0.5, 8.0).toFixed(1);
    p.edge = +RNG.range(0.0, 0.7).toFixed(2);
    p.drive = +RNG.range(0.1, 0.8).toFixed(2);

    p.bassHz = Math.round(RNG.range(40, 120));
    p.bassLP = Math.round(RNG.range(90, 300));
    p.bassRes = +RNG.range(0.4, 3.0).toFixed(1);
    p.bassDrive = +RNG.range(0.0, 0.6).toFixed(2);
    p.bassLfoPitch = +RNG.range(0.0, 0.6).toFixed(2);
    p.bassLfoPitchRate = +RNG.range(0.0, 0.6).toFixed(2);
    p.bassLfoLPF = +RNG.range(0.0, 0.6).toFixed(2);
    p.bassLfoLPFRate = +RNG.range(0.0, 0.6).toFixed(2);
    p.bassLfoRes = +RNG.range(0.0, 0.6).toFixed(2);
    p.bassLfoResRate = +RNG.range(0.0, 0.6).toFixed(2);
    p.bassLfoDrive = +RNG.range(0.0, 0.6).toFixed(2);
    p.bassLfoDriveRate = +RNG.range(0.0, 0.6).toFixed(2);
    p.bassDrift = +RNG.range(0.0, 0.3).toFixed(2);

    p.noiseType = RNG.pick(["white", "pink", "bit", "metallic"]);
    p.noiseBehavior = RNG.next() < 0.35 ? "oneshot" : "sustain";
    p.noiseAms = Math.round(RNG.range(40, 1200));
    p.noiseSms = Math.round(RNG.range(150, 2500));
    p.noiseDms = Math.round(RNG.range(200, 3000));
    p.noiseLPF = Math.round(RNG.range(200, 12000));
    p.noiseRes = +RNG.range(0.2, 8.5).toFixed(1);
    p.noiseHPF = Math.round(RNG.range(20, 2500));
    p.noiseBPF = Math.round(RNG.range(100, 7000));
    p.noiseBPWidth = +RNG.range(0.1, 1.0).toFixed(2);
    p.noiseSweepAmt = +RNG.range(-1, 1).toFixed(2);
    p.noiseSweepTime = +RNG.range(0.01, 1.8).toFixed(2);
    p.noiseDrive = +RNG.range(0, 1).toFixed(2);
    p.noiseFlutterAmt = +RNG.range(0, 0.9).toFixed(2);
    p.noiseFlutterRate = +RNG.range(0, 20).toFixed(1);
    normalizeNoiseEnvelope(p);
  }

  function normalizeNoiseEnvelope(p, changedKey = null) {
    let a = Math.max(0, Math.round(p.noiseAms ?? 0));
    let s = Math.max(0, Math.round(p.noiseSms ?? 0));
    let d = Math.max(0, Math.round(p.noiseDms ?? 0));

    if (changedKey === "noiseAms") {
      a = clamp(a, 0, NOISE_ENV_TOTAL_MS - s - d);
    } else if (changedKey === "noiseSms") {
      s = clamp(s, 0, NOISE_ENV_TOTAL_MS - a - d);
    } else if (changedKey === "noiseDms") {
      d = clamp(d, 0, NOISE_ENV_TOTAL_MS - a - s);
    }

    const total = a + s + d;
    if (total !== NOISE_ENV_TOTAL_MS) {
      if (changedKey === "noiseAms") {
        a = clamp(a + (NOISE_ENV_TOTAL_MS - total), 0, NOISE_ENV_TOTAL_MS);
      } else if (changedKey === "noiseSms") {
        s = clamp(s + (NOISE_ENV_TOTAL_MS - total), 0, NOISE_ENV_TOTAL_MS);
      } else if (changedKey === "noiseDms") {
        d = clamp(d + (NOISE_ENV_TOTAL_MS - total), 0, NOISE_ENV_TOTAL_MS);
      } else {
        const scale = total > 0 ? NOISE_ENV_TOTAL_MS / total : 1;
        a = Math.round(a * scale);
        s = Math.round(s * scale);
        d = NOISE_ENV_TOTAL_MS - a - s;
      }
    }

    if (a + s + d !== NOISE_ENV_TOTAL_MS) {
      d = Math.max(0, NOISE_ENV_TOTAL_MS - a - s);
    }

    p.noiseAms = a;
    p.noiseSms = s;
    p.noiseDms = d;
  }

  function rebalanceNoiseEnvelope(p, changedKey, rawValue) {
    const keys = ["noiseAms", "noiseSms", "noiseDms"];
    if (!keys.includes(changedKey)) return;
    const next = {
      noiseAms: Math.max(0, Math.round(p.noiseAms || 0)),
      noiseSms: Math.max(0, Math.round(p.noiseSms || 0)),
      noiseDms: Math.max(0, Math.round(p.noiseDms || 0))
    };
    const order = {
      noiseAms: ["noiseSms", "noiseDms"],
      noiseSms: ["noiseDms", "noiseAms"],
      noiseDms: ["noiseSms", "noiseAms"]
    };

    let value = clamp(Math.round(rawValue), 0, NOISE_ENV_TOTAL_MS);
    const old = next[changedKey];
    const delta = value - old;
    next[changedKey] = value;

    if (delta > 0) {
      let need = delta;
      for (const k of order[changedKey]) {
        if (need <= 0) break;
        const take = Math.min(next[k], need);
        next[k] -= take;
        need -= take;
      }
      if (need > 0) {
        next[changedKey] = Math.max(0, next[changedKey] - need);
      }
    } else if (delta < 0) {
      let free = -delta;
      for (const k of order[changedKey]) {
        if (free <= 0) break;
        const room = NOISE_ENV_TOTAL_MS - next[k];
        const add = Math.min(room, free);
        next[k] += add;
        free -= add;
      }
    }

    p.noiseAms = next.noiseAms;
    p.noiseSms = next.noiseSms;
    p.noiseDms = next.noiseDms;
    normalizeNoiseEnvelope(p);
  }

  function updateNoiseEnvelopeViz(p) {
    if (!noiseEnvLine || !p) return;
    const total = Math.max(1, p.noiseAms + p.noiseSms + p.noiseDms);
    const ax = (p.noiseAms / total) * 100;
    const sx = ((p.noiseAms + p.noiseSms) / total) * 100;
    noiseEnvLine.setAttribute("points", `0,98 ${ax.toFixed(2)},12 ${sx.toFixed(2)},12 100,98`);
  }

  const state = {
    ctx: null,
    master: null,
    voices: [],
    voiceParams: [],
    frozen: [false, false, false, false, false],
    muted: [false, true, true, true, true],
    activeTracks: [true, false, false, false, false],
    active: 0,
    ready: false,
    playing: true,
    soloIndex: null
  };

  function ensureAudio() {
    if (state.ctx) return state.ctx;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    master.gain.value = 0.85;
    master.connect(ctx.destination);

    state.ctx = ctx;
    state.master = master;
    state.ready = true;
    initVoices();
    return ctx;
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

  function makeDrive(ctx) {
    const input = ctx.createGain();
    const shaper = ctx.createWaveShaper();
    const output = ctx.createGain();
    input.connect(shaper);
    shaper.connect(output);

    function setAmount(amount) {
      const k = clamp(amount, 0, 1) * 90 + 10;
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

  function createVoice(ctx, master, noiseBuf) {
    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    const bassOsc = ctx.createOscillator();

    const gA = ctx.createGain();
    const gB = ctx.createGain();
    const gSub = ctx.createGain();
    const bassGain = ctx.createGain();

    gA.gain.value = 0.5;
    gB.gain.value = 0.45;
    gSub.gain.value = 0.4;
    bassGain.gain.value = 0.0;

    oscA.connect(gA);
    oscB.connect(gB);
    oscSub.connect(gSub);
    bassOsc.connect(bassGain);

    const mix = ctx.createGain();
    gA.connect(mix);
    gB.connect(mix);
    gSub.connect(mix);

    const mainGain = ctx.createGain();
    mainGain.gain.value = 1.0;
    mix.connect(mainGain);

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;

    const noiseHP = ctx.createBiquadFilter();
    noiseHP.type = "highpass";
    noiseHP.frequency.value = 0;

    const noiseG = ctx.createGain();
    noiseG.gain.value = 0.0;

    noise.connect(noiseHP);
    noiseHP.connect(noiseG);
    noiseG.connect(mix);

    const noiseModeHP = ctx.createBiquadFilter();
    noiseModeHP.type = "highpass";
    noiseModeHP.frequency.value = 40;

    const noiseModeLP = ctx.createBiquadFilter();
    noiseModeLP.type = "lowpass";
    noiseModeLP.frequency.value = 4000;

    const noiseModeBP = ctx.createBiquadFilter();
    noiseModeBP.type = "bandpass";
    noiseModeBP.frequency.value = 900;
    noiseModeBP.Q.value = 2.0;

    const noiseModeDrive = makeDrive(ctx);
    const noiseModeGain = ctx.createGain();
    noiseModeGain.gain.value = 0.0;

    const noiseFlutterOsc = ctx.createOscillator();
    noiseFlutterOsc.type = "sine";
    noiseFlutterOsc.frequency.value = 0;
    const noiseFlutterGain = ctx.createGain();
    noiseFlutterGain.gain.value = 0;
    noiseFlutterOsc.connect(noiseFlutterGain);
    noiseFlutterGain.connect(noiseModeBP.frequency);

    noise.connect(noiseModeHP);
    noiseModeHP.connect(noiseModeLP);
    noiseModeLP.connect(noiseModeBP);
    noiseModeBP.connect(noiseModeDrive.input);
    noiseModeDrive.output.connect(noiseModeGain);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.8;

    const edgeBP = ctx.createBiquadFilter();
    edgeBP.type = "bandpass";
    edgeBP.frequency.value = 1400;
    edgeBP.Q.value = 1.2;

    const edgeGain = ctx.createGain();
    edgeGain.gain.value = 0.0;

    const drive = makeDrive(ctx);

    const gain = ctx.createGain();
    gain.gain.value = 0.5;

    const panner = ctx.createStereoPanner();
    panner.pan.value = 0;
    noiseModeGain.connect(panner);

    const spatialBands = [];
    const centers = [120, 220, 380, 620, 980, 1600, 2600, 4200];
    centers.forEach((fc) => {
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = fc;
      bp.Q.value = 2.2;
      const g = ctx.createGain();
      g.gain.value = 0.0;
      const pan = ctx.createStereoPanner();
      pan.pan.value = 0;
      filter.connect(bp);
      bp.connect(g);
      g.connect(pan);
      pan.connect(master);
      spatialBands.push({ bp, g, pan, fc, panTarget: 0, gainTarget: 0 });
    });

    mainGain.connect(filter);
    filter.connect(drive.input);
    drive.output.connect(gain);

    mainGain.connect(edgeBP);
    edgeBP.connect(edgeGain);
    edgeGain.connect(drive.input);

    gain.connect(panner);
    panner.connect(master);

    const bassDrive = makeDrive(ctx);
    const bassLP = ctx.createBiquadFilter();
    bassLP.type = "lowpass";
    bassLP.frequency.value = 140;
    bassLP.Q.value = 0.7;

    const bassLfoPitch = ctx.createOscillator();
    bassLfoPitch.type = "sine";
    bassLfoPitch.frequency.value = 0.2;
    const bassLfoPitchGain = ctx.createGain();
    bassLfoPitchGain.gain.value = 0;
    bassLfoPitch.connect(bassLfoPitchGain);
    bassLfoPitchGain.connect(bassOsc.frequency);

    const bassLfoLPF = ctx.createOscillator();
    bassLfoLPF.type = "sine";
    bassLfoLPF.frequency.value = 0.2;
    const bassLfoLPFGain = ctx.createGain();
    bassLfoLPFGain.gain.value = 0;
    bassLfoLPF.connect(bassLfoLPFGain);
    bassLfoLPFGain.connect(bassLP.frequency);

    const bassLfoRes = ctx.createOscillator();
    bassLfoRes.type = "sine";
    bassLfoRes.frequency.value = 0.2;
    const bassLfoResGain = ctx.createGain();
    bassLfoResGain.gain.value = 0;
    bassLfoRes.connect(bassLfoResGain);
    bassLfoResGain.connect(bassLP.Q);

    const bassLfoDrive = ctx.createOscillator();
    bassLfoDrive.type = "sine";
    bassLfoDrive.frequency.value = 0.2;
    const bassLfoDriveGain = ctx.createGain();
    bassLfoDriveGain.gain.value = 0;
    bassLfoDrive.connect(bassLfoDriveGain);
    bassLfoDriveGain.connect(bassDrive.input.gain);

    bassOsc.type = "sine";
    bassGain.connect(bassDrive.input);
    bassDrive.output.connect(bassLP);
    bassLP.connect(panner);

    bassLfoPitch.start();
    bassLfoLPF.start();
    bassLfoRes.start();
    bassLfoDrive.start();
    noiseFlutterOsc.start();

    oscA.start();
    oscB.start();
    oscSub.start();
    bassOsc.start();
    noise.start();

    let noiseGateOn = false;
    let oneShotCooldownUntil = 0;
    let lastNoiseType = "";

    function noiseTypeProfile(noiseType) {
      if (noiseType === "pink") return { hpMul: 0.5, lpMul: 0.8, resMul: 0.8, driveAdd: -0.08, flutterMul: 0.8 };
      if (noiseType === "bit") return { hpMul: 1.4, lpMul: 0.7, resMul: 1.4, driveAdd: 0.35, flutterMul: 1.6 };
      if (noiseType === "metallic") return { hpMul: 1.1, lpMul: 1.2, resMul: 1.8, driveAdd: 0.2, flutterMul: 1.3 };
      return { hpMul: 1.0, lpMul: 1.0, resMul: 1.0, driveAdd: 0.0, flutterMul: 1.0 };
    }

    function triggerNoiseOneShot(p, t, level) {
      const a = clamp((p.noiseAms || 0) / 1000, 0, 5);
      const s = clamp((p.noiseSms || 0) / 1000, 0, 5);
      const d = clamp((p.noiseDms || 0) / 1000, 0, 5);
      const peak = level;

      noiseModeGain.gain.cancelScheduledValues(t);
      noiseModeGain.gain.setValueAtTime(0, t);
      noiseModeGain.gain.linearRampToValueAtTime(peak, t + a);
      noiseModeGain.gain.setValueAtTime(peak, t + a + s);
      noiseModeGain.gain.linearRampToValueAtTime(0, t + a + s + d);
    }

    function applyNoiseSweep(p, t, profile) {
      const base = clamp(p.noiseBPF, 80, 8000);
      const sweepAmt = clamp(p.noiseSweepAmt, -1, 1);
      const sweepTime = clamp(p.noiseSweepTime, 0.01, 2);
      const target = clamp(base * Math.pow(2, sweepAmt * 2), 60, 12000);
      const start = sweepAmt >= 0 ? base : target;
      const end = sweepAmt >= 0 ? target : base;
      noiseModeBP.frequency.cancelScheduledValues(t);
      noiseModeBP.frequency.setValueAtTime(start, t);
      noiseModeBP.frequency.linearRampToValueAtTime(end, t + sweepTime);
      noiseModeBP.Q.setTargetAtTime(clamp(lerp(11, 0.8, clamp01(p.noiseBPWidth)) * profile.resMul, 0.2, 18), t, 0.04);
    }

    function apply(p, muted, width, basePan, opts = {}) {
      const forceNoiseTrigger = !!opts.forceNoiseTrigger;
      const t = ctx.currentTime;
      const isBass = p.mode === "bass";
      const isNoise = p.mode === "noise";
      const textureGain = clamp(p.gain, 0, 0.8);
      const bassGainBoost = 2.0;
      const bassGainValue = clamp(p.gain * bassGainBoost, 0, 1.6);
      const noiseGainValue = clamp(p.gain * 2.0, 0, 1.6);
      const rate = clamp(p.oscRate, 0.5, 2.5);
      const base = p.baseHz * rate;
      const isSingle = !!p.singleOsc;
      if (p.oscType === "square" && p.pwmOn) {
        const wave = makePWMWave(ctx, clamp(p.pwm, 0.05, 0.95));
        oscA.setPeriodicWave(wave);
        oscB.setPeriodicWave(wave);
      } else {
        oscA.type = p.oscType;
        oscB.type = p.oscType;
      }
      oscSub.type = "triangle";

      const spread = isSingle ? 0 : clamp(p.unisonSpread, 0, 0.02);
      const baseA = base * (1 - spread * 0.5);
      const baseB = base * (1 + spread * 0.5);
      oscA.frequency.setTargetAtTime(baseA, t, 0.03);
      oscB.frequency.setTargetAtTime(baseB, t, 0.03);
      oscSub.frequency.setTargetAtTime(base * 0.5, t, 0.03);

      oscB.detune.setTargetAtTime(isSingle ? 0 : p.detune * 2, t, 0.04);
      gB.gain.setTargetAtTime(isSingle ? 0 : 0.45, t, 0.04);

      gSub.gain.setTargetAtTime(isSingle ? 0 : p.subMix, t, 0.03);
      noiseG.gain.setTargetAtTime(p.noiseMix, t, 0.03);

      filter.frequency.setTargetAtTime(p.filterCutoff, t, 0.04);
      filter.Q.setTargetAtTime(p.filterQ, t, 0.04);

      edgeBP.frequency.setTargetAtTime(p.filterCutoff * 1.4, t, 0.04);
      edgeBP.Q.setTargetAtTime(p.filterQ * 1.3, t, 0.04);
      edgeGain.gain.setTargetAtTime(p.edge, t, 0.04);

      drive.setAmount(p.drive);
      gain.gain.setTargetAtTime(muted ? 0 : textureGain, t, 0.04);
      panner.pan.setTargetAtTime(clamp(basePan * width, -1, 1), t, 0.06);

      const mainTarget = isBass || isNoise ? 0 : 1;
      mainGain.gain.setTargetAtTime(mainTarget, t, 0.05);

      if (isBass) {
        const bassTarget = muted ? 0 : bassGainValue;
        bassGain.gain.setTargetAtTime(bassTarget, t, 0.08);

        bassOsc.frequency.setTargetAtTime(clamp(p.bassHz, 30, 160), t, 0.08);
        bassLP.frequency.setTargetAtTime(clamp(p.bassLP, 60, 800), t, 0.08);
        bassLP.Q.setTargetAtTime(clamp(p.bassRes, 0.2, 8), t, 0.08);
        bassDrive.setAmount(clamp01(p.bassDrive));

        const drift = clamp01(p.bassDrift);
        const ratePitch = lerp(0.02, 6.0, clamp01(p.bassLfoPitchRate));
        const rateLPF = lerp(0.02, 6.0, clamp01(p.bassLfoLPFRate));
        const rateRes = lerp(0.02, 6.0, clamp01(p.bassLfoResRate));
        const rateDrive = lerp(0.02, 6.0, clamp01(p.bassLfoDriveRate));

        bassLfoPitch.frequency.setTargetAtTime(ratePitch, t, 0.2);
        bassLfoLPF.frequency.setTargetAtTime(rateLPF, t, 0.2);
        bassLfoRes.frequency.setTargetAtTime(rateRes, t, 0.2);
        bassLfoDrive.frequency.setTargetAtTime(rateDrive, t, 0.2);

        bassLfoPitchGain.gain.setTargetAtTime(lerp(0, 6, clamp01(p.bassLfoPitch)) * (0.5 + drift * 0.5), t, 0.2);
        bassLfoLPFGain.gain.setTargetAtTime(lerp(0, 220, clamp01(p.bassLfoLPF)) * (0.5 + drift * 0.5), t, 0.2);
        bassLfoResGain.gain.setTargetAtTime(lerp(0, 1.6, clamp01(p.bassLfoRes)) * (0.5 + drift * 0.5), t, 0.2);
        bassLfoDriveGain.gain.setTargetAtTime(lerp(0, 0.6, clamp01(p.bassLfoDrive)) * (0.5 + drift * 0.5), t, 0.2);
      } else {
        bassGain.gain.setTargetAtTime(0, t, 0.05);
        bassDrive.setAmount(0);
        bassLfoPitchGain.gain.setTargetAtTime(0, t, 0.05);
        bassLfoLPFGain.gain.setTargetAtTime(0, t, 0.05);
        bassLfoResGain.gain.setTargetAtTime(0, t, 0.05);
        bassLfoDriveGain.gain.setTargetAtTime(0, t, 0.05);
      }

      if (isNoise) {
        const profile = noiseTypeProfile(p.noiseType);
        if (p.noiseType !== lastNoiseType) {
          lastNoiseType = p.noiseType;
        }

        noiseModeHP.frequency.setTargetAtTime(clamp(p.noiseHPF * profile.hpMul, 20, 4000), t, 0.04);
        noiseModeLP.frequency.setTargetAtTime(clamp(p.noiseLPF * profile.lpMul, 100, 12000), t, 0.04);
        noiseModeLP.Q.setTargetAtTime(clamp(p.noiseRes * profile.resMul, 0.2, 12), t, 0.04);
        noiseModeDrive.setAmount(clamp01(p.noiseDrive + profile.driveAdd));

        const flutterRate = clamp(p.noiseFlutterRate, 0, 20);
        const flutterDepth = clamp01(p.noiseFlutterAmt) * profile.flutterMul;
        noiseFlutterOsc.frequency.setTargetAtTime(flutterRate, t, 0.08);
        noiseFlutterGain.gain.setTargetAtTime(clamp(p.noiseBPF * 0.2 * flutterDepth, 0, 2500), t, 0.08);
        applyNoiseSweep(p, t, profile);

        if (p.noiseBehavior === "oneshot") {
          if (noiseGateOn) {
            noiseModeGain.gain.cancelScheduledValues(t);
            noiseModeGain.gain.setTargetAtTime(0, t, 0.03);
            noiseGateOn = false;
          }
          if (muted) {
            noiseModeGain.gain.cancelScheduledValues(t);
            noiseModeGain.gain.setTargetAtTime(0, t, 0.02);
          } else if (forceNoiseTrigger || t >= oneShotCooldownUntil) {
            triggerNoiseOneShot(p, t, noiseGainValue);
            oneShotCooldownUntil = t + ((p.noiseAms + p.noiseSms + p.noiseDms) / 1000) * 0.8 + 0.04;
          }
        } else {
          oneShotCooldownUntil = 0;
          const sustainLevel = noiseGainValue;

          if (!muted) {
            if (!noiseGateOn) {
              noiseModeGain.gain.cancelScheduledValues(t);
              noiseModeGain.gain.setValueAtTime(0, t);
              noiseModeGain.gain.linearRampToValueAtTime(noiseGainValue, t + 0.02);
              noiseGateOn = true;
            } else {
              noiseModeGain.gain.setTargetAtTime(sustainLevel, t, 0.08);
            }
          } else if (noiseGateOn) {
            noiseModeGain.gain.cancelScheduledValues(t);
            noiseModeGain.gain.setTargetAtTime(0, t, 0.03);
            noiseGateOn = false;
          } else {
            noiseModeGain.gain.setTargetAtTime(0, t, 0.05);
          }
        }
      } else {
        if (noiseGateOn) noiseGateOn = false;
        noiseModeGain.gain.setTargetAtTime(0, t, 0.05);
        noiseFlutterGain.gain.setTargetAtTime(0, t, 0.05);
        oneShotCooldownUntil = 0;
      }

      applySpatialization(isBass ? p.spatialize : p.spatialize, muted);
    }

    let lastSpatialize = -1;
    function applySpatialization(amount, muted) {
      const t = ctx.currentTime;
      const amt = clamp01(amount);
      if (muted || amt <= 0) {
        spatialBands.forEach((b) => b.g.gain.setTargetAtTime(0, t, 0.06));
        lastSpatialize = amt;
        return;
      }

      if (Math.abs(amt - lastSpatialize) > 0.02) {
        spatialBands.forEach((b) => {
          const pan = (Math.random() * 2 - 1) * lerp(0.2, 1.0, amt);
          const g = lerp(0.02, 0.22, amt) * (0.4 + Math.random() * 0.9);
          b.panTarget = pan;
          b.gainTarget = g;
        });
        lastSpatialize = amt;
      }

      spatialBands.forEach((b) => {
        b.g.gain.setTargetAtTime(b.gainTarget, t, 0.08);
        b.pan.pan.setTargetAtTime(b.panTarget, t, 0.08);
      });
    }

    return { apply };
  }

  function initVoices() {
    const noiseBuf = makeNoiseBuffer(state.ctx);
    state.voices = [];
    for (let i = 0; i < 5; i++) {
      state.voices.push(createVoice(state.ctx, state.master, noiseBuf));
      const p = state.voiceParams[i] || defaults();
      if (p.gain == null) p.gain = 0.5;
      if (p.stereoWidth == null) p.stereoWidth = 0.5;
      if (p.spatialize == null) p.spatialize = 0.5;
      if (p.noiseAms == null) p.noiseAms = 400;
      if (p.noiseSms == null) p.noiseSms = 1400;
      if (p.noiseDms == null) p.noiseDms = 3200;
      normalizeNoiseEnvelope(p);
      state.voiceParams[i] = p;
      if (!state.activeTracks[i]) state.muted[i] = true;
      applyVoice(i);
    }
  }

  function makeDefaultVoice() {
    const p = defaults();
    p.gain = 0.5;
    p.stereoWidth = 0.5;
    p.spatialize = 0.5;
    normalizeNoiseEnvelope(p);
    return p;
  }

  function compactTracksLeft() {
    const n = state.activeTracks.length;
    const oldActiveTracks = state.activeTracks.slice();
    const oldVoiceParams = state.voiceParams.slice();
    const oldMuted = state.muted.slice();
    const oldFrozen = state.frozen.slice();
    const oldActive = state.active;
    const oldSolo = state.soloIndex;

    const enabledOld = [];
    for (let i = 0; i < n; i++) {
      if (oldActiveTracks[i]) enabledOld.push(i);
    }

    const oldToNew = new Map();
    enabledOld.forEach((oldIdx, newIdx) => oldToNew.set(oldIdx, newIdx));

    for (let i = 0; i < n; i++) {
      if (i < enabledOld.length) {
        const oldIdx = enabledOld[i];
        state.activeTracks[i] = true;
        state.voiceParams[i] = oldVoiceParams[oldIdx] || makeDefaultVoice();
        state.muted[i] = !!oldMuted[oldIdx];
        state.frozen[i] = !!oldFrozen[oldIdx];
      } else {
        state.activeTracks[i] = false;
        state.voiceParams[i] = makeDefaultVoice();
        state.muted[i] = true;
        state.frozen[i] = false;
      }
    }

    if (oldToNew.has(oldActive)) {
      state.active = oldToNew.get(oldActive);
    } else {
      state.active = enabledOld.length ? 0 : 0;
    }

    if (oldSolo != null && oldToNew.has(oldSolo)) {
      state.soloIndex = oldToNew.get(oldSolo);
    } else if (oldSolo != null) {
      state.soloIndex = null;
    }

    applyAllVoices();
  }

  function basePanFor(index) {
    return lerp(-0.8, 0.8, index / 4);
  }

  function effectiveMuted(index) {
    if (!state.activeTracks[index]) return true;
    if (state.soloIndex != null) return state.soloIndex !== index;
    return !!state.muted[index];
  }

  function applyVoice(index, opts = {}) {
    const p = state.voiceParams[index];
    if (!p || !state.voices[index]) return;
    state.voices[index].apply(p, effectiveMuted(index), p.stereoWidth, basePanFor(index), opts);
  }

  function applyAllVoices() {
    for (let i = 0; i < state.voices.length; i++) applyVoice(i);
  }

  function makePWMWave(ctx, duty) {
    const n = 64;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    for (let k = 1; k < n; k++) {
      const phase = k * Math.PI * duty;
      imag[k] = (2 / (k * Math.PI)) * Math.sin(phase);
      real[k] = (2 / (k * Math.PI)) * (1 - Math.cos(phase));
    }
    return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  }

  function renderVoices() {
    voiceGrid.innerHTML = "";
    for (let i = 0; i < 5; i++) {
      const card = document.createElement("div");
      const isActive = state.active === i;
      const isEnabled = state.activeTracks[i];
      card.className = "voiceCard" + (isActive ? " active" : "") + (state.frozen[i] ? " frozen" : "") + (isEnabled ? "" : " empty");
      card.dataset.index = String(i);

      const title = document.createElement("div");
      title.className = "voiceTitle";
      title.textContent = `Voice ${i + 1}`;

      if (!isEnabled) {
        const addBtn = document.createElement("button");
        addBtn.className = "addBtn";
        addBtn.type = "button";
        addBtn.textContent = "+";
        addBtn.addEventListener("click", () => {
          state.activeTracks[i] = true;
          state.muted[i] = false;
          state.frozen[i] = false;
          const p = defaults();
          p.gain = 0.5;
          p.stereoWidth = 0.5;
          p.spatialize = 0.5;
          normalizeNoiseEnvelope(p);
          state.voiceParams[i] = p;
          state.active = i;
          if (state.soloIndex != null) {
            state.soloIndex = i;
          }
          applyAllVoices();
          renderVoices();
          syncControls();
        });
        card.appendChild(title);
        card.appendChild(addBtn);
        voiceGrid.appendChild(card);
        continue;
      }

      const toggles = document.createElement("div");
      toggles.className = "voiceToggles";

      card.classList.add("isClickable");
      card.addEventListener("click", (e) => {
        if (e.target && (e.target.tagName === "BUTTON" || e.target.tagName === "INPUT" || e.target.closest("label"))) {
          return;
        }
        state.active = i;
        if (state.soloIndex != null) {
          state.soloIndex = i;
          applyAllVoices();
        }
        renderVoices();
        syncControls();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "deleteBtn linkBtn";
      deleteBtn.type = "button";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        const deletingSoloTarget = state.soloIndex === i;
        state.activeTracks[i] = false;
        state.muted[i] = true;
        state.frozen[i] = false;
        state.voiceParams[i] = makeDefaultVoice();
        applyVoice(i);
        compactTracksLeft();
        if (deletingSoloTarget) {
          const next = state.activeTracks[state.active]
            ? state.active
            : state.activeTracks.findIndex((v) => v);
          if (next !== -1) {
            state.soloIndex = next;
            applyAllVoices();
            state.active = next;
          } else {
            state.soloIndex = null;
          }
        }
        renderVoices();
        syncControls();
      });

      const dupBtn = document.createElement("button");
      dupBtn.className = "dupBtn linkBtn";
      dupBtn.type = "button";
      dupBtn.textContent = "Duplicate";
      dupBtn.addEventListener("click", () => {
        const target = (() => {
          const n = state.activeTracks.length;
          for (let t = i + 1; t < n; t++) {
            if (!state.activeTracks[t]) return t;
          }
          for (let t = 0; t < i; t++) {
            if (!state.activeTracks[t]) return t;
          }
          return -1;
        })();
        if (target === -1) return;
        state.activeTracks[target] = true;
        state.muted[target] = false;
        state.frozen[target] = false;
        state.voiceParams[target] = JSON.parse(JSON.stringify(state.voiceParams[i]));
        state.active = target;
        if (state.soloIndex != null) state.soloIndex = target;
        applyAllVoices();
        renderVoices();
        syncControls();
      });

      const freezeLabel = document.createElement("label");
      const freezeBox = document.createElement("input");
      freezeBox.type = "checkbox";
      freezeBox.checked = state.frozen[i];
      freezeBox.addEventListener("change", () => {
        state.frozen[i] = freezeBox.checked;
        renderVoices();
      });
      freezeLabel.appendChild(freezeBox);
      freezeLabel.appendChild(document.createTextNode("Freeze"));

      const muteLabel = document.createElement("label");
      const muteBox = document.createElement("input");
      muteBox.type = "checkbox";
      muteBox.checked = state.muted[i];
      muteBox.addEventListener("change", () => {
        state.muted[i] = muteBox.checked;
        applyAllVoices();
        renderVoices();
        syncControls();
      });
      muteLabel.appendChild(muteBox);
      muteLabel.appendChild(document.createTextNode("Mute"));

      const soloLabel = document.createElement("label");
      const soloBox = document.createElement("input");
      soloBox.type = "checkbox";
      soloBox.checked = state.soloIndex != null;
      soloBox.addEventListener("change", () => {
        if (soloBox.checked) {
          state.soloIndex = i;
          applyAllVoices();
        } else {
          state.soloIndex = null;
          applyAllVoices();
        }
        renderVoices();
        syncControls();
      });
      soloLabel.appendChild(soloBox);
      soloLabel.appendChild(document.createTextNode("Solo"));

      if (!isActive) {
        card.appendChild(title);
        const editTag = document.createElement("div");
        editTag.className = "editTag";
        editTag.textContent = "Edit";
        card.appendChild(editTag);
        voiceGrid.appendChild(card);
        continue;
      }

      toggles.appendChild(deleteBtn);
      toggles.appendChild(dupBtn);
      toggles.appendChild(freezeLabel);
      toggles.appendChild(muteLabel);
      toggles.appendChild(soloLabel);

      card.appendChild(title);
      card.appendChild(toggles);
      voiceGrid.appendChild(card);
    }
  }

  function syncControls() {
    const activeIndex = state.active;
    const hasActive = state.activeTracks[activeIndex];
    const p = state.voiceParams[activeIndex];
    activeLabel.textContent = hasActive ? `Editing: Voice ${activeIndex + 1}` : "Editing: —";
    const inputs = controls.querySelectorAll("[data-param]");
    inputs.forEach((input) => {
      const key = input.dataset.param;
      if (!hasActive) {
        input.disabled = true;
        const out = controls.querySelector(`[data-out='${key}']`);
        if (out) out.textContent = "";
        return;
      }
      if (!p) {
        input.disabled = true;
        const out = controls.querySelector(`[data-out='${key}']`);
        if (out) out.textContent = "";
        return;
      }
      if (input.tagName === "SELECT") {
        input.value = p[key];
      } else if (input.type === "checkbox") {
        input.checked = !!p[key];
      } else {
        input.value = p[key];
      }
      input.disabled = state.active == null || effectiveMuted(state.active);
      const out = controls.querySelector(`[data-out='${key}']`);
      if (out) out.textContent = formatValue(key, p[key]);
    });
    const envOut = controls.querySelector("[data-out='noiseEnvelope']");
    if (envOut && p) envOut.textContent = `${NOISE_ENV_TOTAL_MS} ms`;
    updateNoiseEnvelopeViz(p);
    if (noisePlayBtn) {
      const showPlay = hasActive && p && p.mode === "noise" && p.noiseBehavior === "oneshot";
      noisePlayBtn.style.display = showPlay ? "inline-flex" : "none";
      noisePlayBtn.disabled = !showPlay || effectiveMuted(activeIndex);
    }
    applyModeVisibility(p && p.mode ? p.mode : "texture");
  }

  function formatValue(key, value) {
    if (key === "mode") return value;
    if (key === "noiseType") return value;
    if (key === "noiseBehavior") return value === "oneshot" ? "One-shot" : "Sustain";
    if (key === "noiseAms") return `${Math.round(value)} ms`;
    if (key === "noiseSms") return `${Math.round(value)} ms`;
    if (key === "noiseDms") return `${Math.round(value)} ms`;
    if (key === "noiseEnvelope") return `${NOISE_ENV_TOTAL_MS} ms`;
    if (key === "noiseLPF") return `${Math.round(value)} Hz`;
    if (key === "noiseHPF") return `${Math.round(value)} Hz`;
    if (key === "noiseRes") return value.toFixed(1);
    if (key === "noiseBPF") return `${Math.round(value)} Hz`;
    if (key === "noiseBPWidth") return value.toFixed(2);
    if (key === "noiseSweepAmt") return value.toFixed(2);
    if (key === "noiseSweepTime") return `${value.toFixed(2)} s`;
    if (key === "noiseDrive") return value.toFixed(2);
    if (key === "noiseFlutterAmt") return value.toFixed(2);
    if (key === "noiseFlutterRate") return `${value.toFixed(1)} Hz`;
    if (key === "baseHz") return `${Math.round(value)} Hz`;
    if (key === "bassHz") return `${Math.round(value)} Hz`;
    if (key === "bassLP") return `${Math.round(value)} Hz`;
    if (key === "bassRes") return value.toFixed(1);
    if (key === "bassDrive") return value.toFixed(2);
    if (key === "bassLfoPitch") return value.toFixed(2);
    if (key === "bassLfoPitchRate") return value.toFixed(2);
    if (key === "bassLfoLPF") return value.toFixed(2);
    if (key === "bassLfoLPFRate") return value.toFixed(2);
    if (key === "bassLfoRes") return value.toFixed(2);
    if (key === "bassLfoResRate") return value.toFixed(2);
    if (key === "bassLfoDrive") return value.toFixed(2);
    if (key === "bassLfoDriveRate") return value.toFixed(2);
    if (key === "bassDrift") return value.toFixed(2);
    if (key === "filterCutoff") return `${Math.round(value)} Hz`;
    if (key === "detune") return `${Math.round(value)} ct`;
    if (key === "filterQ") return value.toFixed(1);
    if (key === "pwm") return value.toFixed(2);
    if (key === "pwmOn") return value ? "On" : "Off";
    if (key === "oscRate") return value.toFixed(2) + "x";
    if (key === "singleOsc") return value ? "On" : "Off";
    if (key === "unisonSpread") return value.toFixed(4);
    if (key === "edge") return value.toFixed(2);
    if (key === "stereoWidth") return value.toFixed(2);
    if (key === "spatialize") return value.toFixed(2);
    if (key === "oscType") return value;
    return Number(value).toFixed(2);
  }

  function attachControlHandlers() {
    const onControlChange = (e) => {
      const target = e.target;
      if (!target || !target.dataset || !target.dataset.param) return;
      startAudio();
      const key = target.dataset.param;
      const p = state.voiceParams[state.active];

      if (target.tagName === "SELECT") {
        p[key] = target.value;
      } else if (target.type === "checkbox") {
        p[key] = target.checked;
      } else {
        p[key] = parseFloat(target.value);
      }

      if (key === "noiseAms" || key === "noiseSms" || key === "noiseDms") {
        rebalanceNoiseEnvelope(p, key, p[key]);
        const aIn = controls.querySelector("[data-param='noiseAms']");
        const sIn = controls.querySelector("[data-param='noiseSms']");
        const dIn = controls.querySelector("[data-param='noiseDms']");
        if (aIn) aIn.value = p.noiseAms;
        if (sIn) sIn.value = p.noiseSms;
        if (dIn) dIn.value = p.noiseDms;
        const aOut = controls.querySelector("[data-out='noiseAms']");
        const sOut = controls.querySelector("[data-out='noiseSms']");
        const dOut = controls.querySelector("[data-out='noiseDms']");
        if (aOut) aOut.textContent = formatValue("noiseAms", p.noiseAms);
        if (sOut) sOut.textContent = formatValue("noiseSms", p.noiseSms);
        if (dOut) dOut.textContent = formatValue("noiseDms", p.noiseDms);
        const envOut = controls.querySelector("[data-out='noiseEnvelope']");
        if (envOut) envOut.textContent = `${NOISE_ENV_TOTAL_MS} ms`;
        updateNoiseEnvelopeViz(p);
      }

      const out = controls.querySelector(`[data-out='${key}']`);
      if (out) out.textContent = formatValue(key, p[key]);

      applyVoice(state.active);
      if (key === "mode" || key === "noiseBehavior") applyModeVisibility(p.mode);
    };

    controls.addEventListener("input", onControlChange);
    controls.addEventListener("change", onControlChange);

    if (noisePlayBtn) {
      noisePlayBtn.addEventListener("click", async () => {
        const i = state.active;
        if (!state.activeTracks[i]) return;
        const p = state.voiceParams[i];
        if (!p || p.mode !== "noise" || p.noiseBehavior !== "oneshot") return;
        await startAudio();
        applyVoice(i, { forceNoiseTrigger: true });
      });
    }
  }

  function applyModeVisibility(mode) {
    const rows = controls.querySelectorAll("[data-mode]");
    rows.forEach((row) => {
      const m = row.dataset.mode;
      const show = m === "all" || m === mode;
      row.style.display = show ? "" : "none";
    });
    const p = state.voiceParams[state.active] || {};
    const oneShotRows = controls.querySelectorAll("[data-noise-oneshot]");
    oneShotRows.forEach((row) => {
      if (mode !== "noise") return;
      row.style.display = p.noiseBehavior === "oneshot" ? "" : "none";
    });
    if (noisePlayBtn && mode !== "noise") noisePlayBtn.style.display = "none";
  }

  async function startAudio() {
    ensureAudio();
    if (!state.playing) return;
    if (state.ctx.state !== "running") {
      try { await state.ctx.resume(); } catch (_) {}
    }
    if (startOverlay) startOverlay.style.display = "none";
  }

  function regenerate() {
    startAudio();
    for (let i = 0; i < state.voiceParams.length; i++) {
      if (!state.activeTracks[i]) continue;
      if (state.frozen[i]) continue;
      const p = state.voiceParams[i] || defaults();
      const keep = {
        gain: p.gain ?? 0.5,
        stereoWidth: p.stereoWidth ?? 0.5,
        spatialize: p.spatialize ?? 0.5
      };
      randomizeVoice(p);
      p.gain = keep.gain;
      p.stereoWidth = keep.stereoWidth;
      p.spatialize = keep.spatialize;
      state.voiceParams[i] = p;
      if (state.voices[i]) {
        applyVoice(i);
      }
    }
    renderVoices();
    syncControls();
  }

  function init() {
    if (!state.voiceParams.length) {
      for (let i = 0; i < 5; i++) {
        const p = defaults();
        p.gain = 0.5;
        p.stereoWidth = 0.5;
        p.spatialize = 0.5;
        normalizeNoiseEnvelope(p);
        state.voiceParams[i] = p;
      }
    }
    renderVoices();
    attachControlHandlers();
    syncControls();
  }

  regenBtn.addEventListener("click", regenerate);
  if (playBtn) {
    playBtn.addEventListener("click", async () => {
      await startAudio();
      if (!state.ctx) return;
      if (state.ctx.state === "running") {
        state.playing = false;
        state.master.gain.setTargetAtTime(0, state.ctx.currentTime, 0.02);
        await state.ctx.suspend();
        playBtn.textContent = "Play";
      } else {
        await state.ctx.resume();
        state.playing = true;
        state.master.gain.setTargetAtTime(0.85, state.ctx.currentTime, 0.02);
        playBtn.textContent = "Pause";
        if (startOverlay) startOverlay.style.display = "none";
      }
    });
  }
  if (startOverlay && startBtn) {
    startOverlay.addEventListener("click", startAudio);
    startBtn.addEventListener("click", startAudio);
  }

  init();
})();
