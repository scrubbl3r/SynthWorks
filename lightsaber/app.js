(() => {
  const regenBtn = document.getElementById("regenBtn");
  const playBtn = document.getElementById("playBtn");
  const playBtn2 = document.getElementById("playBtn2");
  const voiceGrid = document.getElementById("voiceGrid");
  const controls = document.getElementById("controls");
  const activeLabel = document.getElementById("activeLabel");
  const randomizeModesWrap = document.getElementById("randomizeModes");
  const texturePlayBtn = document.getElementById("texturePlayBtn");
  const bassPlayBtn = document.getElementById("bassPlayBtn");
  const noisePlayBtn = document.getElementById("noisePlayBtn");
  const textureEnvLine = document.getElementById("textureEnvLine");
  const bassEnvLine = document.getElementById("bassEnvLine");
  const noiseEnvLine = document.getElementById("noiseEnvLine");
  const startOverlay = document.getElementById("startOverlay");
  const startBtn = document.getElementById("startBtn");
  const LOCKED_ICON_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z"/></svg>';
  const UNLOCKED_ICON_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M17 2a5 5 0 0 0-5 5h2a3 3 0 1 1 6 0v3h-9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2V7a5 5 0 0 0-5-5Z"/></svg>';

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const clamp01 = (v) => clamp(v, 0, 1);
  const lerp = (a, b, t) => a + (b - a) * t;
  // 
  const PARAMS = [
    { key: "mode", label: "Mode" },
    { key: "textureBehavior", label: "Texture Behavior" },
    { key: "textureAms", label: "Texture A ms" },
    { key: "textureSms", label: "Texture S ms" },
    { key: "textureDms", label: "Texture D ms" },
    { key: "textureEnvelope", label: "Texture Envelope" },
    { key: "bassBehavior", label: "Bass Behavior" },
    { key: "bassAms", label: "Bass A ms" },
    { key: "bassSms", label: "Bass S ms" },
    { key: "bassDms", label: "Bass D ms" },
    { key: "bassEnvelope", label: "Bass Envelope" },
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
    { key: "bassVolume", label: "Bass Volume" },
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
    { key: "noisePeak", label: "Noise Env Peak" },
    { key: "noiseLPStart", label: "Noise LP Start" },
    { key: "noiseLPEnd", label: "Noise LP End" },
    { key: "noiseSweepTime", label: "Noise Sweep Time" },
    { key: "noiseHPF", label: "Noise HPF" },
    { key: "noiseRes", label: "Noise Resonance" },
    { key: "noiseBoomHz", label: "Noise Boom Hz" },
    { key: "noiseBoomAmt", label: "Noise Boom Amt" },
    { key: "noiseBoomDrop", label: "Noise Boom Drop" },
    { key: "noiseRingHz", label: "Noise Ring Hz" },
    { key: "noiseRingAmt", label: "Noise Ring Amt" },
    { key: "noiseRingDrop", label: "Noise Ring Drop" },
    { key: "noiseCrackleAmt", label: "Noise Crackle Amt" },
    { key: "noiseCrackleHPF", label: "Noise Crackle HPF" },
    { key: "noiseEdgeDrive", label: "Noise Edge Drive" },
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
  const ENV_TOTAL_MS = 5000;

  function makeEnvelopeEndpoints(aDur, sDur, dDur) {
    const a = clamp(Math.round(aDur), 0, ENV_TOTAL_MS);
    const s = clamp(Math.round(a + sDur), a, ENV_TOTAL_MS);
    const d = clamp(Math.round(s + dDur), s, ENV_TOTAL_MS);
    return { a, s, d };
  }

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

  const defaults = () => {
    const textureEp = makeEnvelopeEndpoints(
      RNG.range(100, 900),
      RNG.range(350, 2200),
      RNG.range(500, 2600)
    );
    const bassEp = makeEnvelopeEndpoints(
      RNG.range(120, 1000),
      RNG.range(600, 2600),
      RNG.range(700, 2600)
    );
    const noiseEp = makeEnvelopeEndpoints(
      RNG.range(80, 900),
      RNG.range(300, 1800),
      RNG.range(400, 1800)
    );
    return {
      mode: "texture",
      textureBehavior: RNG.next() < 0.25 ? "oneshot" : "sustain",
      textureAms: textureEp.a,
      textureSms: textureEp.s,
      textureDms: textureEp.d,
      bassBehavior: RNG.next() < 0.25 ? "oneshot" : "sustain",
      bassAms: bassEp.a,
      bassSms: bassEp.s,
      bassDms: bassEp.d,
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
      bassVolume: +RNG.range(3.0, 8.0).toFixed(1),
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
      noiseAms: noiseEp.a,
      noiseSms: noiseEp.s,
      noiseDms: noiseEp.d,
      noisePeak: +RNG.range(0.35, 1.0).toFixed(2),
      noiseLPStart: Math.round(RNG.range(1200, 9000)),
      noiseLPEnd: Math.round(RNG.range(80, 900)),
      noiseSweepTime: +RNG.range(0.15, 1.4).toFixed(2),
      noiseHPF: Math.round(RNG.range(20, 1200)),
      noiseRes: +RNG.range(0.4, 5.0).toFixed(1),
      noiseBoomHz: Math.round(RNG.range(28, 90)),
      noiseBoomAmt: +RNG.range(0.1, 0.95).toFixed(2),
      noiseBoomDrop: +RNG.range(0.2, 0.9).toFixed(2),
      noiseRingHz: Math.round(RNG.range(90, 520)),
      noiseRingAmt: +RNG.range(0.0, 0.55).toFixed(2),
      noiseRingDrop: +RNG.range(0.2, 0.9).toFixed(2),
      noiseCrackleAmt: +RNG.range(0.0, 0.45).toFixed(2),
      noiseCrackleHPF: Math.round(RNG.range(900, 3200)),
      noiseEdgeDrive: +RNG.range(0.15, 0.85).toFixed(2),
      stereoWidth: 0.5,
      spatialize: 0.5,
      gain: 0.5
    };
  };

  function getRandomizeConfig() {
    const fallback = {
      modePool: ["texture", "bass", "noise"],
      behaviorByMode: {
        texture: ["sustain", "oneshot"],
        bass: ["sustain", "oneshot"],
        noise: ["sustain", "oneshot"],
      },
    };
    if (!randomizeModesWrap) return fallback;

    const modeBoxes = randomizeModesWrap.querySelectorAll("input[data-randomize-mode]");
    const behaviorBoxes = randomizeModesWrap.querySelectorAll("input[data-randomize-behavior]");
    const checkedModes = new Set();
    modeBoxes.forEach((b) => {
      if (b.checked) checkedModes.add(b.dataset.randomizeMode);
    });

    const behaviorByMode = {
      texture: [],
      bass: [],
      noise: [],
    };
    behaviorBoxes.forEach((b) => {
      if (!b.checked) return;
      const raw = String(b.dataset.randomizeBehavior || "");
      const [mode, behavior] = raw.split(":");
      if (!behaviorByMode[mode]) return;
      if (behavior === "sustain" || behavior === "oneshot") {
        behaviorByMode[mode].push(behavior);
      }
    });

    const modePool = [];
    checkedModes.forEach((mode) => {
      if (behaviorByMode[mode] && behaviorByMode[mode].length) modePool.push(mode);
    });

    if (!modePool.length) return fallback;
    return { modePool, behaviorByMode };
  }

  function randomizeVoice(p, randomizeConfig) {
    const rand = RNG.next.bind(RNG);
    const modePool = randomizeConfig && Array.isArray(randomizeConfig.modePool)
      ? randomizeConfig.modePool
      : ["texture", "bass", "noise"];
    const behaviorByMode = randomizeConfig && randomizeConfig.behaviorByMode
      ? randomizeConfig.behaviorByMode
      : {
          texture: ["sustain", "oneshot"],
          bass: ["sustain", "oneshot"],
          noise: ["sustain", "oneshot"],
        };
    const mode = RNG.pick(modePool.length ? modePool : ["texture", "bass", "noise"]);
    p.mode = mode;
    const pickBehavior = (modeName) => RNG.pick(
      behaviorByMode[modeName] && behaviorByMode[modeName].length
        ? behaviorByMode[modeName]
        : ["sustain", "oneshot"]
    );
    p.textureBehavior = pickBehavior("texture");
    p.bassBehavior = pickBehavior("bass");
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
    p.bassVolume = +RNG.range(2.0, 12.0).toFixed(1);
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
    p.noiseBehavior = pickBehavior("noise");
    const textureEp = makeEnvelopeEndpoints(
      RNG.range(40, 1400),
      RNG.range(150, 2600),
      RNG.range(200, 2800)
    );
    p.textureAms = textureEp.a;
    p.textureSms = textureEp.s;
    p.textureDms = textureEp.d;

    const bassEp = makeEnvelopeEndpoints(
      RNG.range(60, 1600),
      RNG.range(250, 2800),
      RNG.range(300, 2800)
    );
    p.bassAms = bassEp.a;
    p.bassSms = bassEp.s;
    p.bassDms = bassEp.d;

    const ep = makeEnvelopeEndpoints(
      RNG.range(40, 1200),
      RNG.range(150, 2200),
      RNG.range(200, 2200)
    );
    p.noiseAms = ep.a;
    p.noiseSms = ep.s;
    p.noiseDms = ep.d;
    p.noisePeak = +RNG.range(0.2, 1.0).toFixed(2);
    p.noiseLPStart = Math.round(RNG.range(600, 12000));
    p.noiseLPEnd = Math.round(RNG.range(40, 1800));
    p.noiseSweepTime = +RNG.range(0.08, 3.5).toFixed(2);
    p.noiseHPF = Math.round(RNG.range(20, 2500));
    p.noiseRes = +RNG.range(0.2, 8.5).toFixed(1);
    p.noiseBoomHz = Math.round(RNG.range(12, 160));
    p.noiseBoomAmt = +RNG.range(0.05, 1.0).toFixed(2);
    p.noiseBoomDrop = +RNG.range(0.1, 1.0).toFixed(2);
    p.noiseRingHz = Math.round(RNG.range(30, 1600));
    p.noiseRingAmt = +RNG.range(0.0, 1.0).toFixed(2);
    p.noiseRingDrop = +RNG.range(0.1, 1.0).toFixed(2);
    p.noiseCrackleAmt = +RNG.range(0.0, 1.0).toFixed(2);
    p.noiseCrackleHPF = Math.round(RNG.range(500, 8000));
    p.noiseEdgeDrive = +RNG.range(0, 1).toFixed(2);

    // Enforce active mode behavior from the current randomize filter.
    if (mode === "texture") p.textureBehavior = pickBehavior("texture");
    if (mode === "bass") p.bassBehavior = pickBehavior("bass");
    if (mode === "noise") p.noiseBehavior = pickBehavior("noise");

    normalizeTextureEnvelope(p);
    normalizeBassEnvelope(p);
    normalizeNoiseEnvelope(p);
  }

  function normalizeTextureEnvelope(p) {
    p.textureAms = clamp(Math.round(p.textureAms ?? 0), 0, ENV_TOTAL_MS);
    p.textureSms = clamp(Math.round(p.textureSms ?? 0), 0, ENV_TOTAL_MS);
    p.textureDms = clamp(Math.round(p.textureDms ?? ENV_TOTAL_MS), 0, ENV_TOTAL_MS);
  }

  function normalizeBassEnvelope(p) {
    p.bassAms = clamp(Math.round(p.bassAms ?? 0), 0, ENV_TOTAL_MS);
    p.bassSms = clamp(Math.round(p.bassSms ?? 0), 0, ENV_TOTAL_MS);
    p.bassDms = clamp(Math.round(p.bassDms ?? ENV_TOTAL_MS), 0, ENV_TOTAL_MS);
  }

  function normalizeNoiseEnvelope(p) {
    let a = clamp(Math.round(p.noiseAms ?? 0), 0, ENV_TOTAL_MS);
    let s = clamp(Math.round(p.noiseSms ?? 0), 0, ENV_TOTAL_MS);
    let d = clamp(Math.round(p.noiseDms ?? ENV_TOTAL_MS), 0, ENV_TOTAL_MS);
    p.noiseAms = a;
    p.noiseSms = s;
    p.noiseDms = d;
  }

  function rebalanceTextureEnvelope(p, changedKey, rawValue) {
    if (changedKey === "textureAms" || changedKey === "textureSms" || changedKey === "textureDms") {
      p[changedKey] = clamp(Math.round(rawValue), 0, ENV_TOTAL_MS);
    }
    normalizeTextureEnvelope(p);
  }

  function rebalanceBassEnvelope(p, changedKey, rawValue) {
    if (changedKey === "bassAms" || changedKey === "bassSms" || changedKey === "bassDms") {
      p[changedKey] = clamp(Math.round(rawValue), 0, ENV_TOTAL_MS);
    }
    normalizeBassEnvelope(p);
  }

  function rebalanceNoiseEnvelope(p, changedKey, rawValue) {
    if (changedKey === "noiseAms" || changedKey === "noiseSms" || changedKey === "noiseDms") {
      p[changedKey] = clamp(Math.round(rawValue), 0, ENV_TOTAL_MS);
    }
    normalizeNoiseEnvelope(p);
  }

  function effectiveTextureEndpoints(p) {
    const a = clamp(Math.round(p.textureAms || 0), 0, ENV_TOTAL_MS);
    const sRaw = clamp(Math.round(p.textureSms || 0), 0, ENV_TOTAL_MS);
    const dRaw = clamp(Math.round(p.textureDms || 0), 0, ENV_TOTAL_MS);
    const s = Math.max(a, sRaw);
    const d = Math.max(s, dRaw);
    return { a, s, d };
  }

  function effectiveBassEndpoints(p) {
    const a = clamp(Math.round(p.bassAms || 0), 0, ENV_TOTAL_MS);
    const sRaw = clamp(Math.round(p.bassSms || 0), 0, ENV_TOTAL_MS);
    const dRaw = clamp(Math.round(p.bassDms || 0), 0, ENV_TOTAL_MS);
    const s = Math.max(a, sRaw);
    const d = Math.max(s, dRaw);
    return { a, s, d };
  }

  function effectiveNoiseEndpoints(p) {
    const a = clamp(Math.round(p.noiseAms || 0), 0, ENV_TOTAL_MS);
    const sRaw = clamp(Math.round(p.noiseSms || 0), 0, ENV_TOTAL_MS);
    const dRaw = clamp(Math.round(p.noiseDms || 0), 0, ENV_TOTAL_MS);
    const s = Math.max(a, sRaw);
    const d = Math.max(s, dRaw);
    return { a, s, d };
  }

  function updateTextureEnvelopeViz(p) {
    if (!textureEnvLine || !p) return;
    const ep = effectiveTextureEndpoints(p);
    const ax = (ep.a / ENV_TOTAL_MS) * 100;
    const sx = (ep.s / ENV_TOTAL_MS) * 100;
    const dx = (ep.d / ENV_TOTAL_MS) * 100;
    textureEnvLine.setAttribute("points", `0,98 ${ax.toFixed(2)},12 ${sx.toFixed(2)},12 ${dx.toFixed(2)},98`);
  }

  function updateBassEnvelopeViz(p) {
    if (!bassEnvLine || !p) return;
    const ep = effectiveBassEndpoints(p);
    const ax = (ep.a / ENV_TOTAL_MS) * 100;
    const sx = (ep.s / ENV_TOTAL_MS) * 100;
    const dx = (ep.d / ENV_TOTAL_MS) * 100;
    bassEnvLine.setAttribute("points", `0,98 ${ax.toFixed(2)},12 ${sx.toFixed(2)},12 ${dx.toFixed(2)},98`);
  }

  function updateNoiseEnvelopeViz(p) {
    if (!noiseEnvLine || !p) return;
    const ep = effectiveNoiseEndpoints(p);
    const ax = (ep.a / ENV_TOTAL_MS) * 100;
    const sx = (ep.s / ENV_TOTAL_MS) * 100;
    const dx = (ep.d / ENV_TOTAL_MS) * 100;
    noiseEnvLine.setAttribute("points", `0,98 ${ax.toFixed(2)},12 ${sx.toFixed(2)},12 ${dx.toFixed(2)},98`);
  }

  const state = {
    ctx: null,
    master: null,
    limiter: null,
    voices: [],
    voiceParams: [],
    paramLocks: [],
    frozen: [false, false, false, false, false],
    muted: [false, true, true, true, true],
    activeTracks: [true, false, false, false, false],
    active: 0,
    ready: false,
    playing: true,
    soloIndex: null
  };

  function ensureParamLocks(index) {
    if (!state.paramLocks[index]) state.paramLocks[index] = {};
    return state.paramLocks[index];
  }

  function ensureAudio() {
    if (state.ctx) return state.ctx;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain();
    const limiter = ctx.createDynamicsCompressor();
    master.gain.value = 0.85;
    limiter.threshold.value = -3;
    limiter.knee.value = 12;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.12;
    master.connect(limiter);
    limiter.connect(ctx.destination);

    state.ctx = ctx;
    state.master = master;
    state.limiter = limiter;
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

    const noiseModeEdge = makeDrive(ctx);
    const noiseModeGain = ctx.createGain();
    noiseModeGain.gain.value = 0.0;

    const noiseCrackleHP = ctx.createBiquadFilter();
    noiseCrackleHP.type = "highpass";
    noiseCrackleHP.frequency.value = 1400;
    const noiseCrackleGain = ctx.createGain();
    noiseCrackleGain.gain.value = 0.0;

    const noiseBoomOsc = ctx.createOscillator();
    noiseBoomOsc.type = "sine";
    noiseBoomOsc.frequency.value = 50;
    const noiseBoomGain = ctx.createGain();
    noiseBoomGain.gain.value = 0.0;

    const noiseRingOsc = ctx.createOscillator();
    noiseRingOsc.type = "square";
    noiseRingOsc.frequency.value = 220;
    const noiseRingEdge = makeDrive(ctx);
    const noiseRingGain = ctx.createGain();
    noiseRingGain.gain.value = 0.0;

    noise.connect(noiseModeHP);
    noiseModeHP.connect(noiseModeLP);
    noiseModeLP.connect(noiseModeEdge.input);
    noiseModeEdge.output.connect(noiseModeGain);

    noise.connect(noiseCrackleHP);
    noiseCrackleHP.connect(noiseCrackleGain);
    noiseBoomOsc.connect(noiseBoomGain);
    noiseRingOsc.connect(noiseRingEdge.input);
    noiseRingEdge.output.connect(noiseRingGain);

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
    const voiceOut = ctx.createGain();
    voiceOut.gain.value = 0;
    noiseModeGain.connect(panner);
    noiseCrackleGain.connect(panner);
    noiseBoomGain.connect(panner);
    noiseRingGain.connect(panner);

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
      pan.connect(voiceOut);
      spatialBands.push({ bp, g, pan, fc, panTarget: 0, gainTarget: 0 });
    });

    mainGain.connect(filter);
    filter.connect(drive.input);
    drive.output.connect(gain);

    mainGain.connect(edgeBP);
    edgeBP.connect(edgeGain);
    edgeGain.connect(drive.input);

    gain.connect(panner);
    panner.connect(voiceOut);
    voiceOut.connect(master);

    const bassDrive = makeDrive(ctx);
    const bassLP = ctx.createBiquadFilter();
    bassLP.type = "lowpass";
    bassLP.frequency.value = 140;
    bassLP.Q.value = 0.7;
    const bassPostGain = ctx.createGain();
    bassPostGain.gain.value = 1.0;

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
    bassLP.connect(bassPostGain);
    bassPostGain.connect(panner);

    bassLfoPitch.start();
    bassLfoLPF.start();
    bassLfoRes.start();
    bassLfoDrive.start();
    noiseBoomOsc.start();
    noiseRingOsc.start();

    oscA.start();
    oscB.start();
    oscSub.start();
    bassOsc.start();
    noise.start();

    let textureOneShotCooldownUntil = 0;
    let bassOneShotCooldownUntil = 0;
    let textureGateUntil = 0;
    let bassGateUntil = 0;
    let noiseGateOn = false;
    let oneShotCooldownUntil = 0;

    function noiseTypeProfile(noiseType) {
      if (noiseType === "pink") return { hpMul: 0.55, lpMul: 0.85, resMul: 0.8, edgeAdd: -0.08 };
      if (noiseType === "bit") return { hpMul: 1.4, lpMul: 0.7, resMul: 1.3, edgeAdd: 0.25 };
      if (noiseType === "metallic") return { hpMul: 1.15, lpMul: 1.1, resMul: 1.7, edgeAdd: 0.18 };
      return { hpMul: 1.0, lpMul: 1.0, resMul: 1.0, edgeAdd: 0.0 };
    }

    function applyOneShotEnv(node, t, a, s, d, peak) {
      node.gain.cancelScheduledValues(t);
      node.gain.setValueAtTime(0, t);
      node.gain.linearRampToValueAtTime(peak, t + a);
      node.gain.setValueAtTime(peak, t + a + s);
      node.gain.linearRampToValueAtTime(0, t + a + s + d);
    }

    function triggerTextureOneShot(p, t) {
      const ep = effectiveTextureEndpoints(p);
      const a = ep.a / 1000;
      const s = clamp(ep.s - ep.a, 0, ENV_TOTAL_MS) / 1000;
      const d = clamp(ep.d - ep.s, 0, ENV_TOTAL_MS) / 1000;
      applyOneShotEnv(voiceOut, t, a, s, d, 1);
      textureGateUntil = t + a + s + d;
      textureOneShotCooldownUntil = t + (ep.d / 1000) * 0.8 + 0.04;
    }

    function triggerBassOneShot(p, t) {
      const ep = effectiveBassEndpoints(p);
      const a = ep.a / 1000;
      const s = clamp(ep.s - ep.a, 0, ENV_TOTAL_MS) / 1000;
      const d = clamp(ep.d - ep.s, 0, ENV_TOTAL_MS) / 1000;
      applyOneShotEnv(voiceOut, t, a, s, d, 1);
      bassGateUntil = t + a + s + d;
      bassOneShotCooldownUntil = t + (ep.d / 1000) * 0.8 + 0.04;
    }

    function triggerNoiseOneShot(p, t, level) {
      const profile = noiseTypeProfile(p.noiseType);
      const ep = effectiveNoiseEndpoints(p);
      const aMs = ep.a;
      const sMs = clamp(ep.s - ep.a, 0, ENV_TOTAL_MS);
      const dMs = clamp(ep.d - ep.s, 0, ENV_TOTAL_MS);
      const a = aMs / 1000;
      const s = sMs / 1000;
      const d = dMs / 1000;
      const peak = level * clamp01(p.noisePeak);

      const lp0 = clamp(p.noiseLPStart * profile.lpMul, 100, 12000);
      const lp1 = clamp(p.noiseLPEnd * profile.lpMul, 40, 4000);
      const sweepT = Math.min(clamp(p.noiseSweepTime, 0.05, 4), Math.max(0.05, ep.d / 1000));
      noiseModeLP.frequency.cancelScheduledValues(t);
      noiseModeLP.frequency.setValueAtTime(lp0, t);
      noiseModeLP.frequency.exponentialRampToValueAtTime(Math.max(30, lp1), t + sweepT);

      const boomStart = clamp(p.noiseBoomHz, 10, 220);
      const boomEnd = clamp(lerp(boomStart, boomStart * 0.25, clamp01(p.noiseBoomDrop)), 8, 220);
      noiseBoomOsc.frequency.cancelScheduledValues(t);
      noiseBoomOsc.frequency.setValueAtTime(boomStart, t);
      noiseBoomOsc.frequency.exponentialRampToValueAtTime(boomEnd, t + Math.max(0.06, d * 0.9));

      const ringStart = clamp(p.noiseRingHz, 20, 2400);
      const ringEnd = clamp(lerp(ringStart, ringStart * 0.35, clamp01(p.noiseRingDrop)), 10, 2400);
      noiseRingOsc.frequency.cancelScheduledValues(t);
      noiseRingOsc.frequency.setValueAtTime(ringStart, t);
      noiseRingOsc.frequency.exponentialRampToValueAtTime(ringEnd, t + Math.max(0.05, d * 0.75));

      applyOneShotEnv(noiseModeGain, t, a, s, d, peak);
      applyOneShotEnv(noiseBoomGain, t, Math.max(0.002, a * 0.35), s, d, peak * clamp01(p.noiseBoomAmt));
      applyOneShotEnv(noiseRingGain, t, Math.max(0.002, a * 0.4), s, d, peak * clamp01(p.noiseRingAmt));
      applyOneShotEnv(noiseCrackleGain, t, 0.001, Math.max(0, s * 0.3), Math.max(0.02, d * 0.55), peak * clamp01(p.noiseCrackleAmt));
    }

    function apply(p, muted, width, basePan, opts = {}) {
      const forceNoiseTrigger = !!opts.forceNoiseTrigger;
      const forceTextureTrigger = !!opts.forceTextureTrigger;
      const forceBassTrigger = !!opts.forceBassTrigger;
      const forceReplay = !!opts.forceReplay;
      const t = ctx.currentTime;
      const isBass = p.mode === "bass";
      const isNoise = p.mode === "noise";
      const isTexture = !isBass && !isNoise;
      const textureGain = clamp(p.gain, 0, 0.8);
      const bassVolume = clamp(Number(p.bassVolume) || 4.0, 0.0, 12.0);
      const bassGainValue = 1.0;
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
      gain.gain.setTargetAtTime(textureGain, t, 0.04);
      panner.pan.setTargetAtTime(clamp(basePan * width, -1, 1), t, 0.06);

      const mainTarget = isBass || isNoise ? 0 : 1;
      mainGain.gain.setTargetAtTime(mainTarget, t, 0.05);

      if (isBass) {
        const bassTarget = bassGainValue;
        bassGain.gain.setTargetAtTime(bassTarget, t, 0.08);

        bassOsc.frequency.setTargetAtTime(clamp(p.bassHz, 30, 160), t, 0.08);
        bassLP.frequency.setTargetAtTime(clamp(p.bassLP, 60, 800), t, 0.08);
        bassLP.Q.setTargetAtTime(clamp(p.bassRes, 0.2, 8), t, 0.08);
        bassDrive.setAmount(clamp01(p.bassDrive));
        bassPostGain.gain.setTargetAtTime(bassVolume, t, 0.08);

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
        bassPostGain.gain.setTargetAtTime(1.0, t, 0.05);
        bassLfoPitchGain.gain.setTargetAtTime(0, t, 0.05);
        bassLfoLPFGain.gain.setTargetAtTime(0, t, 0.05);
        bassLfoResGain.gain.setTargetAtTime(0, t, 0.05);
        bassLfoDriveGain.gain.setTargetAtTime(0, t, 0.05);
        bassOneShotCooldownUntil = 0;
      }

      if (isTexture) {
        bassOneShotCooldownUntil = 0;
        if (p.textureBehavior === "oneshot") {
          if (forceReplay) {
            voiceOut.gain.cancelScheduledValues(t);
            voiceOut.gain.setValueAtTime(0, t);
            textureOneShotCooldownUntil = 0;
            textureGateUntil = 0;
          }
          if (muted) {
            voiceOut.gain.cancelScheduledValues(t);
            voiceOut.gain.setTargetAtTime(0, t, 0.02);
          } else if (forceTextureTrigger || forceReplay) {
            triggerTextureOneShot(p, t);
          } else if (t >= textureGateUntil) {
            voiceOut.gain.cancelScheduledValues(t);
            voiceOut.gain.setTargetAtTime(0, t, 0.01);
          }
        } else {
          textureOneShotCooldownUntil = 0;
          textureGateUntil = 0;
          if (forceReplay && !muted) {
            voiceOut.gain.cancelScheduledValues(t);
            voiceOut.gain.setValueAtTime(0, t);
          }
          voiceOut.gain.setTargetAtTime(muted ? 0 : 1, t, 0.04);
        }
      } else if (isBass) {
        textureOneShotCooldownUntil = 0;
        if (p.bassBehavior === "oneshot") {
          if (forceReplay) {
            voiceOut.gain.cancelScheduledValues(t);
            voiceOut.gain.setValueAtTime(0, t);
            bassOneShotCooldownUntil = 0;
            bassGateUntil = 0;
          }
          if (muted) {
            voiceOut.gain.cancelScheduledValues(t);
            voiceOut.gain.setTargetAtTime(0, t, 0.02);
          } else if (forceBassTrigger || forceReplay) {
            triggerBassOneShot(p, t);
          } else if (t >= bassGateUntil) {
            voiceOut.gain.cancelScheduledValues(t);
            voiceOut.gain.setTargetAtTime(0, t, 0.01);
          }
        } else {
          bassOneShotCooldownUntil = 0;
          bassGateUntil = 0;
          if (forceReplay && !muted) {
            voiceOut.gain.cancelScheduledValues(t);
            voiceOut.gain.setValueAtTime(0, t);
          }
          voiceOut.gain.setTargetAtTime(muted ? 0 : 1, t, 0.04);
        }
      }

      if (isNoise) {
        textureOneShotCooldownUntil = 0;
        bassOneShotCooldownUntil = 0;
        textureGateUntil = 0;
        bassGateUntil = 0;
        voiceOut.gain.setTargetAtTime(muted ? 0 : 1, t, 0.03);
        if (forceReplay) {
          noiseGateOn = false;
          oneShotCooldownUntil = 0;
          noiseModeGain.gain.cancelScheduledValues(t);
          noiseBoomGain.gain.cancelScheduledValues(t);
          noiseRingGain.gain.cancelScheduledValues(t);
          noiseCrackleGain.gain.cancelScheduledValues(t);
          noiseModeGain.gain.setValueAtTime(0, t);
          noiseBoomGain.gain.setValueAtTime(0, t);
          noiseRingGain.gain.setValueAtTime(0, t);
          noiseCrackleGain.gain.setValueAtTime(0, t);
        }
        const profile = noiseTypeProfile(p.noiseType);
        noiseModeHP.frequency.setTargetAtTime(clamp(p.noiseHPF * profile.hpMul, 20, 4000), t, 0.03);
        noiseModeLP.frequency.setTargetAtTime(clamp(p.noiseLPStart * profile.lpMul, 100, 12000), t, 0.03);
        noiseModeLP.Q.setTargetAtTime(clamp(p.noiseRes * profile.resMul, 0.2, 12), t, 0.04);
        noiseModeEdge.setAmount(clamp01(p.noiseEdgeDrive + profile.edgeAdd));
        noiseCrackleHP.frequency.setTargetAtTime(clamp(p.noiseCrackleHPF, 500, 8000), t, 0.03);
        noiseRingEdge.setAmount(clamp01(0.4 + p.noiseEdgeDrive * 0.6));
        noiseBoomOsc.frequency.setTargetAtTime(clamp(p.noiseBoomHz, 10, 220), t, 0.04);
        noiseRingOsc.frequency.setTargetAtTime(clamp(p.noiseRingHz, 20, 2400), t, 0.04);

        if (p.noiseBehavior === "oneshot") {
          if (noiseGateOn) {
            noiseModeGain.gain.cancelScheduledValues(t);
            noiseModeGain.gain.setTargetAtTime(0, t, 0.03);
            noiseBoomGain.gain.setTargetAtTime(0, t, 0.03);
            noiseRingGain.gain.setTargetAtTime(0, t, 0.03);
            noiseCrackleGain.gain.setTargetAtTime(0, t, 0.02);
            noiseGateOn = false;
          }
          if (muted) {
            noiseModeGain.gain.cancelScheduledValues(t);
            noiseModeGain.gain.setTargetAtTime(0, t, 0.02);
            noiseBoomGain.gain.setTargetAtTime(0, t, 0.02);
            noiseRingGain.gain.setTargetAtTime(0, t, 0.02);
            noiseCrackleGain.gain.setTargetAtTime(0, t, 0.02);
          } else if (forceNoiseTrigger || forceReplay) {
            triggerNoiseOneShot(p, t, noiseGainValue);
            const ep = effectiveNoiseEndpoints(p);
            oneShotCooldownUntil = t + (ep.d / 1000) * 0.8 + 0.04;
          }
        } else {
          oneShotCooldownUntil = 0;
          const sustainLevel = noiseGainValue * clamp01(p.noisePeak);

          if (!muted) {
            if (!noiseGateOn) {
              noiseModeGain.gain.cancelScheduledValues(t);
              noiseModeGain.gain.setValueAtTime(0, t);
              noiseModeGain.gain.linearRampToValueAtTime(noiseGainValue, t + 0.02);
              noiseBoomGain.gain.setTargetAtTime(sustainLevel * clamp01(p.noiseBoomAmt), t + 0.02, 0.04);
              noiseRingGain.gain.setTargetAtTime(sustainLevel * clamp01(p.noiseRingAmt), t + 0.02, 0.04);
              noiseCrackleGain.gain.setTargetAtTime(sustainLevel * clamp01(p.noiseCrackleAmt), t + 0.02, 0.03);
              noiseGateOn = true;
            } else {
              noiseModeGain.gain.setTargetAtTime(sustainLevel, t, 0.08);
              noiseBoomGain.gain.setTargetAtTime(sustainLevel * clamp01(p.noiseBoomAmt), t, 0.08);
              noiseRingGain.gain.setTargetAtTime(sustainLevel * clamp01(p.noiseRingAmt), t, 0.08);
              noiseCrackleGain.gain.setTargetAtTime(sustainLevel * clamp01(p.noiseCrackleAmt), t, 0.06);
            }
          } else if (noiseGateOn) {
            noiseModeGain.gain.cancelScheduledValues(t);
            noiseModeGain.gain.setTargetAtTime(0, t, 0.03);
            noiseBoomGain.gain.setTargetAtTime(0, t, 0.03);
            noiseRingGain.gain.setTargetAtTime(0, t, 0.03);
            noiseCrackleGain.gain.setTargetAtTime(0, t, 0.03);
            noiseGateOn = false;
          } else {
            noiseModeGain.gain.setTargetAtTime(0, t, 0.05);
            noiseBoomGain.gain.setTargetAtTime(0, t, 0.05);
            noiseRingGain.gain.setTargetAtTime(0, t, 0.05);
            noiseCrackleGain.gain.setTargetAtTime(0, t, 0.05);
          }
        }
      } else {
        if (noiseGateOn) noiseGateOn = false;
        noiseModeGain.gain.setTargetAtTime(0, t, 0.05);
        noiseBoomGain.gain.setTargetAtTime(0, t, 0.05);
        noiseRingGain.gain.setTargetAtTime(0, t, 0.05);
        noiseCrackleGain.gain.setTargetAtTime(0, t, 0.05);
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
      ensureParamLocks(i);
      if (p.gain == null) p.gain = 0.5;
      if (p.stereoWidth == null) p.stereoWidth = 0.5;
      if (p.spatialize == null) p.spatialize = 0.5;
      if (p.textureBehavior == null) p.textureBehavior = "sustain";
      if (p.textureAms == null) p.textureAms = 240;
      if (p.textureSms == null) p.textureSms = 1900;
      if (p.textureDms == null) p.textureDms = 4300;
      if (p.bassBehavior == null) p.bassBehavior = "sustain";
      if (p.bassAms == null) p.bassAms = 260;
      if (p.bassSms == null) p.bassSms = 2100;
      if (p.bassDms == null) p.bassDms = 4600;
      if (p.bassVolume == null && p.bassBoost != null) p.bassVolume = p.bassBoost;
      if (p.bassVolume == null) p.bassVolume = 4.0;
      if (p.noiseAms == null) p.noiseAms = 400;
      if (p.noiseSms == null) p.noiseSms = 1400;
      if (p.noiseDms == null) p.noiseDms = 3200;
      if (p.noisePeak == null) p.noisePeak = 0.8;
      if (p.noiseLPStart == null) p.noiseLPStart = 4200;
      if (p.noiseLPEnd == null) p.noiseLPEnd = 280;
      if (p.noiseSweepTime == null) p.noiseSweepTime = 0.7;
      if (p.noiseHPF == null) p.noiseHPF = 120;
      if (p.noiseRes == null) p.noiseRes = 0.8;
      if (p.noiseBoomHz == null) p.noiseBoomHz = 56;
      if (p.noiseBoomAmt == null) p.noiseBoomAmt = 0.55;
      if (p.noiseBoomDrop == null) p.noiseBoomDrop = 0.6;
      if (p.noiseRingHz == null) p.noiseRingHz = 220;
      if (p.noiseRingAmt == null) p.noiseRingAmt = 0.25;
      if (p.noiseRingDrop == null) p.noiseRingDrop = 0.6;
      if (p.noiseCrackleAmt == null) p.noiseCrackleAmt = 0.2;
      if (p.noiseCrackleHPF == null) p.noiseCrackleHPF = 1600;
      if (p.noiseEdgeDrive == null) p.noiseEdgeDrive = 0.45;
      normalizeTextureEnvelope(p);
      normalizeBassEnvelope(p);
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
    normalizeTextureEnvelope(p);
    normalizeBassEnvelope(p);
    normalizeNoiseEnvelope(p);
    return p;
  }

  function compactTracksLeft() {
    const n = state.activeTracks.length;
    const oldActiveTracks = state.activeTracks.slice();
    const oldVoiceParams = state.voiceParams.slice();
    const oldParamLocks = state.paramLocks.slice();
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
        state.paramLocks[i] = Object.assign({}, oldParamLocks[oldIdx] || {});
        state.muted[i] = !!oldMuted[oldIdx];
        state.frozen[i] = !!oldFrozen[oldIdx];
      } else {
        state.activeTracks[i] = false;
        state.voiceParams[i] = makeDefaultVoice();
        state.paramLocks[i] = {};
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
          normalizeTextureEnvelope(p);
          normalizeBassEnvelope(p);
          normalizeNoiseEnvelope(p);
          state.voiceParams[i] = p;
          state.paramLocks[i] = {};
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
        state.paramLocks[i] = {};
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
        state.paramLocks[target] = JSON.parse(JSON.stringify(state.paramLocks[i] || {}));
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
      if (
        key === "textureAms" || key === "textureSms" || key === "textureDms" ||
        key === "bassAms" || key === "bassSms" || key === "bassDms" ||
        key === "noiseAms" || key === "noiseSms" || key === "noiseDms"
      ) {
        input.min = 0;
        input.max = ENV_TOTAL_MS;
      }
      input.disabled = state.active == null || effectiveMuted(state.active);
      const out = controls.querySelector(`[data-out='${key}']`);
      if (out) out.textContent = formatValue(key, p[key]);
    });
    const textureEnvOut = controls.querySelector("[data-out='textureEnvelope']");
    if (textureEnvOut && p) {
      const ep = effectiveTextureEndpoints(p);
      textureEnvOut.textContent = `${Math.round(ep.d)} ms`;
    }
    const bassEnvOut = controls.querySelector("[data-out='bassEnvelope']");
    if (bassEnvOut && p) {
      const ep = effectiveBassEndpoints(p);
      bassEnvOut.textContent = `${Math.round(ep.d)} ms`;
    }
    const envOut = controls.querySelector("[data-out='noiseEnvelope']");
    if (envOut && p) {
      const ep = effectiveNoiseEndpoints(p);
      envOut.textContent = `${Math.round(ep.d)} ms`;
    }
    updateTextureEnvelopeViz(p);
    updateBassEnvelopeViz(p);
    updateNoiseEnvelopeViz(p);
    const lockBtns = controls.querySelectorAll("button[data-lock-param]");
    lockBtns.forEach((btn) => {
      const key = btn.dataset.lockParam;
      const locked = !!(state.activeTracks[activeIndex] && state.paramLocks[activeIndex] && state.paramLocks[activeIndex][key]);
      btn.innerHTML = locked ? LOCKED_ICON_SVG : UNLOCKED_ICON_SVG;
      btn.classList.toggle("locked", locked);
      btn.classList.toggle("unlocked", !locked);
      btn.setAttribute("aria-label", locked ? `Randomize lock on for ${key}` : `Randomize lock off for ${key}`);
      btn.title = locked ? "Locked: protected from randomize" : "Unlocked: randomizable";
      btn.disabled = !hasActive || !p;
    });
    if (texturePlayBtn) {
      const showTexturePlay = hasActive && p && p.mode === "texture" && p.textureBehavior === "oneshot";
      texturePlayBtn.style.display = showTexturePlay ? "inline-flex" : "none";
      texturePlayBtn.disabled = !showTexturePlay || effectiveMuted(activeIndex);
    }
    if (bassPlayBtn) {
      const showBassPlay = hasActive && p && p.mode === "bass" && p.bassBehavior === "oneshot";
      bassPlayBtn.style.display = showBassPlay ? "inline-flex" : "none";
      bassPlayBtn.disabled = !showBassPlay || effectiveMuted(activeIndex);
    }
    if (noisePlayBtn) {
      const showPlay = hasActive && p && p.mode === "noise" && p.noiseBehavior === "oneshot";
      noisePlayBtn.style.display = showPlay ? "inline-flex" : "none";
      noisePlayBtn.disabled = !showPlay || effectiveMuted(activeIndex);
    }
    applyModeVisibility(p && p.mode ? p.mode : "texture");
  }

  function formatValue(key, value) {
    if (key === "mode") return value;
    if (key === "textureBehavior") return value === "oneshot" ? "One-shot" : "Sustain";
    if (key === "textureAms") return `${Math.round(value)} ms`;
    if (key === "textureSms") return `${Math.round(value)} ms`;
    if (key === "textureDms") return `${Math.round(value)} ms`;
    if (key === "textureEnvelope") return `${Math.round(value || 0)} ms`;
    if (key === "bassBehavior") return value === "oneshot" ? "One-shot" : "Sustain";
    if (key === "bassAms") return `${Math.round(value)} ms`;
    if (key === "bassSms") return `${Math.round(value)} ms`;
    if (key === "bassDms") return `${Math.round(value)} ms`;
    if (key === "bassEnvelope") return `${Math.round(value || 0)} ms`;
    if (key === "noiseType") return value;
    if (key === "noiseBehavior") return value === "oneshot" ? "One-shot" : "Sustain";
    if (key === "noiseAms") return `${Math.round(value)} ms`;
    if (key === "noiseSms") return `${Math.round(value)} ms`;
    if (key === "noiseDms") return `${Math.round(value)} ms`;
    if (key === "noiseEnvelope") return `${Math.round(value || 0)} ms`;
    if (key === "noisePeak") return value.toFixed(2);
    if (key === "noiseLPStart") return `${Math.round(value)} Hz`;
    if (key === "noiseLPEnd") return `${Math.round(value)} Hz`;
    if (key === "noiseSweepTime") return `${value.toFixed(2)} s`;
    if (key === "noiseHPF") return `${Math.round(value)} Hz`;
    if (key === "noiseRes") return value.toFixed(1);
    if (key === "noiseBoomHz") return `${Math.round(value)} Hz`;
    if (key === "noiseBoomAmt") return value.toFixed(2);
    if (key === "noiseBoomDrop") return value.toFixed(2);
    if (key === "noiseRingHz") return `${Math.round(value)} Hz`;
    if (key === "noiseRingAmt") return value.toFixed(2);
    if (key === "noiseRingDrop") return value.toFixed(2);
    if (key === "noiseCrackleAmt") return value.toFixed(2);
    if (key === "noiseCrackleHPF") return `${Math.round(value)} Hz`;
    if (key === "noiseEdgeDrive") return value.toFixed(2);
    if (key === "baseHz") return `${Math.round(value)} Hz`;
    if (key === "bassHz") return `${Math.round(value)} Hz`;
    if (key === "bassLP") return `${Math.round(value)} Hz`;
    if (key === "bassRes") return value.toFixed(1);
    if (key === "bassDrive") return value.toFixed(2);
    if (key === "bassVolume") return `${value.toFixed(1)}x`;
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

      if (key === "textureAms" || key === "textureSms" || key === "textureDms") {
        rebalanceTextureEnvelope(p, key, p[key]);
        const aIn = controls.querySelector("[data-param='textureAms']");
        const sIn = controls.querySelector("[data-param='textureSms']");
        const dIn = controls.querySelector("[data-param='textureDms']");
        if (aIn) aIn.value = p.textureAms;
        if (sIn) sIn.value = p.textureSms;
        if (dIn) dIn.value = p.textureDms;
        const envOut = controls.querySelector("[data-out='textureEnvelope']");
        if (envOut) {
          const ep = effectiveTextureEndpoints(p);
          envOut.textContent = `${Math.round(ep.d)} ms`;
        }
        updateTextureEnvelopeViz(p);
      }

      if (key === "bassAms" || key === "bassSms" || key === "bassDms") {
        rebalanceBassEnvelope(p, key, p[key]);
        const aIn = controls.querySelector("[data-param='bassAms']");
        const sIn = controls.querySelector("[data-param='bassSms']");
        const dIn = controls.querySelector("[data-param='bassDms']");
        if (aIn) aIn.value = p.bassAms;
        if (sIn) sIn.value = p.bassSms;
        if (dIn) dIn.value = p.bassDms;
        const envOut = controls.querySelector("[data-out='bassEnvelope']");
        if (envOut) {
          const ep = effectiveBassEndpoints(p);
          envOut.textContent = `${Math.round(ep.d)} ms`;
        }
        updateBassEnvelopeViz(p);
      }

      if (key === "noiseAms" || key === "noiseSms" || key === "noiseDms") {
        rebalanceNoiseEnvelope(p, key, p[key]);
        const aIn = controls.querySelector("[data-param='noiseAms']");
        const sIn = controls.querySelector("[data-param='noiseSms']");
        const dIn = controls.querySelector("[data-param='noiseDms']");
        if (aIn) aIn.value = p.noiseAms;
        if (sIn) sIn.value = p.noiseSms;
        if (dIn) dIn.value = p.noiseDms;
        const envOut = controls.querySelector("[data-out='noiseEnvelope']");
        if (envOut) {
          const ep = effectiveNoiseEndpoints(p);
          envOut.textContent = `${Math.round(ep.d)} ms`;
        }
        updateNoiseEnvelopeViz(p);
      }

      const out = controls.querySelector(`[data-out='${key}']`);
      if (out) out.textContent = formatValue(key, p[key]);

      applyVoice(state.active);
      if (
        key === "mode" ||
        key === "textureBehavior" ||
        key === "bassBehavior" ||
        key === "noiseBehavior"
      ) {
        applyModeVisibility(p.mode);
        syncControls();
      }
    };

    controls.addEventListener("input", onControlChange);
    controls.addEventListener("change", onControlChange);
    controls.addEventListener("click", (e) => {
      const btn = e.target && e.target.closest ? e.target.closest("button[data-lock-param]") : null;
      if (!btn) return;
      const i = state.active;
      if (i == null || !state.activeTracks[i]) return;
      const key = String(btn.dataset.lockParam || "");
      if (!key) return;
      const locks = ensureParamLocks(i);
      locks[key] = !locks[key];
      syncControls();
    });

    if (texturePlayBtn) {
      texturePlayBtn.addEventListener("click", async () => {
        const i = state.active;
        if (!state.activeTracks[i]) return;
        const p = state.voiceParams[i];
        if (!p || p.mode !== "texture" || p.textureBehavior !== "oneshot") return;
        await startAudio();
        applyVoice(i, { forceTextureTrigger: true });
      });
    }

    if (bassPlayBtn) {
      bassPlayBtn.addEventListener("click", async () => {
        const i = state.active;
        if (!state.activeTracks[i]) return;
        const p = state.voiceParams[i];
        if (!p || p.mode !== "bass" || p.bassBehavior !== "oneshot") return;
        await startAudio();
        applyVoice(i, { forceBassTrigger: true });
      });
    }

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
      const showByMode = m === "all" || m === mode;
      const hideInNoise = row.dataset.hideNoise === "1" && mode === "noise";
      const show = showByMode && !hideInNoise;
      row.style.display = show ? "" : "none";
    });
    const p = state.voiceParams[state.active] || {};
    const textureOneShotRows = controls.querySelectorAll("[data-texture-oneshot]");
    textureOneShotRows.forEach((row) => {
      if (mode !== "texture") return;
      row.style.display = p.textureBehavior === "oneshot" ? "" : "none";
    });
    const bassOneShotRows = controls.querySelectorAll("[data-bass-oneshot]");
    bassOneShotRows.forEach((row) => {
      if (mode !== "bass") return;
      row.style.display = p.bassBehavior === "oneshot" ? "" : "none";
    });
    const oneShotRows = controls.querySelectorAll("[data-noise-oneshot]");
    oneShotRows.forEach((row) => {
      if (mode !== "noise") return;
      row.style.display = p.noiseBehavior === "oneshot" ? "" : "none";
    });
    if (texturePlayBtn && mode !== "texture") texturePlayBtn.style.display = "none";
    if (bassPlayBtn && mode !== "bass") bassPlayBtn.style.display = "none";
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

  function ensureRandomizeLockUI() {
    const rows = controls.querySelectorAll(".row");
    rows.forEach((row) => {
      if (row.dataset.hasRandomizeLock === "1") return;
      const input = row.querySelector("[data-param]");
      if (!input || !input.dataset || !input.dataset.param) return;
      const key = String(input.dataset.param);
      const output = row.querySelector(`output[data-out='${key}']`) || row.querySelector("output");
      const meta = document.createElement("div");
      meta.className = "rowMeta";

      if (output && output.parentElement) {
        output.classList.add("paramOut");
        output.parentElement.removeChild(output);
        meta.appendChild(output);
      }

      const lockBtn = document.createElement("button");
      lockBtn.type = "button";
      lockBtn.className = "paramLockBtn";
      lockBtn.dataset.lockParam = key;
      lockBtn.innerHTML = UNLOCKED_ICON_SVG;
      lockBtn.setAttribute("aria-label", `Randomize lock off for ${key}`);
      lockBtn.title = "Unlocked: randomizable";
      meta.appendChild(lockBtn);

      row.appendChild(meta);
      row.dataset.hasRandomizeLock = "1";
    });
  }

  async function regenerate() {
    await startAudio();
    const randomizeConfig = getRandomizeConfig();
    for (let i = 0; i < state.voiceParams.length; i++) {
      if (!state.activeTracks[i]) continue;
      if (state.frozen[i]) continue;
      const p = state.voiceParams[i] || defaults();
      const prev = Object.assign({}, p);
      const keep = {
        gain: p.gain ?? 0.5,
        stereoWidth: p.stereoWidth ?? 0.5,
        spatialize: p.spatialize ?? 0.5
      };
      randomizeVoice(p, randomizeConfig);
      const locks = state.paramLocks[i] || {};
      Object.keys(locks).forEach((key) => {
        if (!locks[key]) return;
        if (Object.prototype.hasOwnProperty.call(prev, key)) p[key] = prev[key];
      });
      p.gain = keep.gain;
      p.stereoWidth = keep.stereoWidth;
      p.spatialize = keep.spatialize;
      state.voiceParams[i] = p;
    }
    renderVoices();
    syncControls();
    await replayAllVoices();
  }

  async function replayAllVoices() {
    await startAudio();
    if (!state.ctx) return;
    for (let i = 0; i < state.voices.length; i++) {
      if (!state.activeTracks[i]) continue;
      applyVoice(i, { forceNoiseTrigger: true, forceReplay: true });
    }
  }

  function init() {
    if (!state.voiceParams.length) {
      for (let i = 0; i < 5; i++) {
        const p = defaults();
        p.gain = 0.5;
        p.stereoWidth = 0.5;
        p.spatialize = 0.5;
        normalizeTextureEnvelope(p);
        normalizeBassEnvelope(p);
        normalizeNoiseEnvelope(p);
        state.voiceParams[i] = p;
        ensureParamLocks(i);
      }
    }
    renderVoices();
    ensureRandomizeLockUI();
    attachControlHandlers();
    syncControls();
  }

  regenBtn.addEventListener("click", regenerate);
  const syncMuteButtons = (label) => {
    if (playBtn) playBtn.textContent = label;
  };

  const onToggleMute = async () => {
      await startAudio();
      if (!state.ctx) return;
      if (state.ctx.state === "running") {
        state.playing = false;
        state.master.gain.setTargetAtTime(0, state.ctx.currentTime, 0.02);
        await state.ctx.suspend();
        syncMuteButtons("Unmute");
      } else {
        await state.ctx.resume();
        state.playing = true;
        state.master.gain.setTargetAtTime(0.85, state.ctx.currentTime, 0.02);
        syncMuteButtons("Mute");
        if (startOverlay) startOverlay.style.display = "none";
      }
  };
  if (playBtn) playBtn.addEventListener("click", onToggleMute);
  if (playBtn2) playBtn2.addEventListener("click", replayAllVoices);
  if (startOverlay && startBtn) {
    startOverlay.addEventListener("click", startAudio);
    startBtn.addEventListener("click", startAudio);
  }

  init();
})();
