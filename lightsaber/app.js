(() => {
  const regenBtn = document.getElementById("regenBtn");
  const playBtn = document.getElementById("playBtn");
  const voiceGrid = document.getElementById("voiceGrid");
  const controls = document.getElementById("controls");
  const activeLabel = document.getElementById("activeLabel");
  const startOverlay = document.getElementById("startOverlay");
  const startBtn = document.getElementById("startBtn");

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const clamp01 = (v) => clamp(v, 0, 1);
  const lerp = (a, b, t) => a + (b - a) * t;

  const PARAMS = [
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

  const defaults = () => ({
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
    stereoWidth: +RNG.range(0.4, 1.0).toFixed(2),
    spatialize: +RNG.range(0.0, 0.8).toFixed(2),
    gain: +RNG.range(0.25, 0.7).toFixed(2)
  });

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
    soloIndex: null,
    preSoloMuted: [false, true, true, true, true]
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

    const gA = ctx.createGain();
    const gB = ctx.createGain();
    const gSub = ctx.createGain();

    gA.gain.value = 0.5;
    gB.gain.value = 0.45;
    gSub.gain.value = 0.4;

    oscA.connect(gA);
    oscB.connect(gB);
    oscSub.connect(gSub);

    const mix = ctx.createGain();
    gA.connect(mix);
    gB.connect(mix);
    gSub.connect(mix);

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

    mix.connect(filter);
    filter.connect(drive.input);
    drive.output.connect(gain);

    mix.connect(edgeBP);
    edgeBP.connect(edgeGain);
    edgeGain.connect(drive.input);

    gain.connect(panner);
    panner.connect(master);

    oscA.start();
    oscB.start();
    oscSub.start();
    noise.start();

    function apply(p, muted, width, basePan) {
      const t = ctx.currentTime;
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
      gain.gain.setTargetAtTime(muted ? 0 : p.gain, t, 0.04);
      panner.pan.setTargetAtTime(clamp(basePan * width, -1, 1), t, 0.06);

      applySpatialization(p.spatialize, muted);
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
      state.voiceParams[i] = defaults();
      if (!state.activeTracks[i]) state.muted[i] = true;
      state.voices[i].apply(state.voiceParams[i], state.muted[i], state.voiceParams[i].stereoWidth, basePanFor(i));
    }
  }

  function basePanFor(index) {
    return lerp(-0.8, 0.8, index / 4);
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
          state.voiceParams[i] = defaults();
          state.voices[i].apply(state.voiceParams[i], state.muted[i], state.voiceParams[i].stereoWidth, basePanFor(i));
          state.active = i;
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
          state.muted[i] = false;
          for (let t = 0; t < state.muted.length; t++) {
            state.muted[t] = t === i ? false : true;
            state.voices[t].apply(state.voiceParams[t], state.muted[t], state.voiceParams[t].stereoWidth, basePanFor(t));
          }
        }
        renderVoices();
        syncControls();
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "deleteBtn linkBtn";
      deleteBtn.type = "button";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        state.activeTracks[i] = false;
        state.muted[i] = true;
        state.frozen[i] = false;
        state.voiceParams[i] = defaults();
        state.voices[i].apply(state.voiceParams[i], true, state.voiceParams[i].stereoWidth, basePanFor(i));
        if (state.active === i) {
          state.active = state.activeTracks.findIndex((v) => v);
          if (state.active === -1) state.active = 0;
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
        state.voices[target].apply(state.voiceParams[target], state.muted[target], state.voiceParams[target].stereoWidth, basePanFor(target));
        state.active = target;
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
        if (state.soloIndex === i && state.muted[i]) {
          state.soloIndex = null;
          state.muted = state.preSoloMuted.slice();
        }
        state.voices[i].apply(state.voiceParams[i], state.muted[i], state.voiceParams[i].stereoWidth, basePanFor(i));
        renderVoices();
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
          state.muted[i] = false;
          state.preSoloMuted = state.muted.slice();
          for (let t = 0; t < state.muted.length; t++) {
            state.muted[t] = t === i ? false : true;
            state.voices[t].apply(state.voiceParams[t], state.muted[t], state.voiceParams[t].stereoWidth, basePanFor(t));
          }
        } else {
          state.soloIndex = null;
          state.muted = state.preSoloMuted.slice();
          for (let t = 0; t < state.muted.length; t++) {
            state.voices[t].apply(state.voiceParams[t], state.muted[t], state.voiceParams[t].stereoWidth, basePanFor(t));
          }
        }
        renderVoices();
        syncControls();
      });
      soloLabel.appendChild(soloBox);
      soloLabel.appendChild(document.createTextNode("Solo"));

      if (!isActive) {
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
      if (input.tagName === "SELECT") {
        input.value = p[key];
      } else if (input.type === "checkbox") {
        input.checked = !!p[key];
      } else {
        input.value = p[key];
      }
      input.disabled = state.active == null || state.muted[state.active];
      const out = controls.querySelector(`[data-out='${key}']`);
      if (out) out.textContent = formatValue(key, p[key]);
    });
  }

  function formatValue(key, value) {
    if (key === "baseHz") return `${Math.round(value)} Hz`;
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

      const out = controls.querySelector(`[data-out='${key}']`);
      if (out) out.textContent = formatValue(key, p[key]);

      state.voices[state.active].apply(p, state.muted[state.active], p.stereoWidth, basePanFor(state.active));
    };

    controls.addEventListener("input", onControlChange);
    controls.addEventListener("change", onControlChange);
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
      state.voiceParams[i] = defaults();
      state.voices[i].apply(state.voiceParams[i], state.muted[i], state.voiceParams[i].stereoWidth, basePanFor(i));
    }
    renderVoices();
    syncControls();
  }

  function init() {
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
