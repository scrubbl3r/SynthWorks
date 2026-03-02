(() => {
  const regenBtn = document.getElementById("regenBtn");
  const playBtn = document.getElementById("playBtn");
  const playBtn2 = document.getElementById("playBtn2");
  const voiceGrid = document.getElementById("voiceGrid");
  const controls = document.getElementById("controls");
  const activeLabel = document.getElementById("activeLabel");
  const randomizeModeSelect = document.getElementById("randomizeModeSelect");
  const presetFamilySelect = document.getElementById("presetFamilySelect");
  const auditionCommandSelect = document.getElementById("auditionCommandSelect");
  const auditionCommandHex = document.getElementById("auditionCommandHex");
  const auditionPlayBtn = document.getElementById("auditionPlayBtn");
  const randomizeModesWrap = document.getElementById("randomizeModes");
  const randomizePresetsWrap = document.getElementById("randomizePresets");
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
  const parseHexOrDec = (s, fallback = 0) => {
    const raw = String(s == null ? "" : s).trim().toLowerCase();
    if (!raw) return fallback;
    const v = raw.startsWith("0x") ? parseInt(raw, 16) : parseInt(raw, 10);
    return Number.isFinite(v) ? v : fallback;
  };
  // 
  const PARAMS = [
    { key: "mode", label: "Mode" },
    { key: "presetStartupVariant", label: "Startup Variant" },
    { key: "engineEnabled", label: "Engine" },
    { key: "clockRate", label: "Clock Rate" },
    { key: "gateDepth", label: "Gate Depth" },
    { key: "stepAmount", label: "Step Amount" },
    { key: "delayMix", label: "Delay Mix" },
    { key: "delayTime", label: "Delay Time" },
    { key: "feedback", label: "Feedback" },
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
    { key: "noiseVolume", label: "Noise Volume" },
    { key: "bassVolume", label: "Bass Volume" },
    { key: "stereoWidth", label: "Stereo Width" },
    { key: "textureVolume", label: "Texture Volume" },
    { key: "gain", label: "Voice Gain" }
  ];

  const SPATIAL_CENTERS = [80, 120, 180, 260, 380, 560, 820, 1200, 2000, 3800, 6500, 9000];
  const SPATIAL_MIN = 80;
  const SPATIAL_MAX = 9000;

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
  // Defender sound ROM "START DISTORTO SOUND" (STDSND) period contour.
  const DEFENDER_STARTUP_DISTORTO = [
    1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 8, 10, 12, 16,
    20, 24, 32, 48, 64, 80, 64, 48, 32, 16, 12, 10, 8, 7, 6, 5,
    4, 3, 2, 2, 1, 1, 1
  ];
  // Defender GWVTAB GS72 waveform bytes (length byte omitted) from vsndrm1.src.
  const DEFENDER_GS72 = [
    138,149,160,171,181,191,200,209,218,225,232,238,243,247,251,253,254,255,
    254,253,251,247,243,238,232,225,218,209,200,191,181,171,160,149,138,127,
    117,106,95,84,74,64,55,46,37,30,23,17,12,8,4,2,1,0,1,2,4,8,12,17,23,30,
    37,46,55,64,74,84,95,106,117,127
  ];
  const DEFENDER_RADSND = [0x8c,0x5b,0xb6,0x40,0xbf,0x49,0xa4,0x73,0x73,0xa4,0x49,0xbf,0x40,0xb6,0x5b,0x8c];
  const DEFENDER_WAVES = {
    GS2: [127,217,255,217,127,36,0,36],
    GSSQ2: [0,64,128,0,255,0,128,64],
    GS1: [127,176,217,245,255,245,217,176,127,78,36,9,0,9,36,78],
    GS12: [127,197,236,231,191,141,109,106,127,148,146,113,64,23,18,57],
    GSQ22: [255,255,255,255,0,0,0,0,255,255,255,255,0,0,0,0],
    GS72: DEFENDER_GS72.slice(),
    GS1_7: [89,123,152,172,179,172,152,123,89,55,25,6,0,6,25,55],
  };
  const DEFENDER_PATTERNS = {
    BONSND: [0xa0,0x98,0x90,0x88,0x80,0x78,0x70,0x68,0x60,0x58,0x50,0x44,0x40],
    HBDSND: [1,1,2,2,4,4,8,8,0x10,0x20,0x28,0x30,0x38,0x40,0x48,0x50,0x60,0x70,0x80,0xa0,0xb0,0xc0],
    STDSND: [1,1,1,1,2,2,3,3,4,4,5,6,8,0x0a,0x0c,0x10,0x14,0x18,0x20,0x30,0x40,0x50,0x40,0x30,0x20,0x10,0x0c,0x0a,8,7,6,5,4,3,2,2,1,1,1],
    SWPAT: [8,64,8,64,8,64,8,64,8,64,8,64,8,64,8,64,8,64,8,64],
    SPNSND: [1,1,2,2,3,4,5,6,7,8,9,0x0a,0x0c],
    BBSND: [8,64,8,64,8,64,8,64,8,64,8,64,8,64,8,64,8,64,8,64],
    HBESND: [1,2,4,8,9,0x0a,0x0b,0x0c,0x0e,0x0f,0x10,0x12,0x14,0x16],
    SPNR: [0x40],
    COOLDN: [0x10,8,1],
    ED10FP: [7,8,9,0x0a,0x0c,8],
    ED13FP: [0x17,0x18,0x19,0x1a,0x1b,0x1c],
    TRBPAT: [0x80,0x7c,0x78,0x74,0x70,0x74,0x78,0x7c,0x80],
  };
  const DEFENDER_GWAVE_VECTORS = {
    HBDV: { b0: 0x81, b1: 0x24, predecay: 0x00, gdfinc: 0x00, gdcnt: 0x00, pattern: "HBDSND", wave: "GSQ22" },
    STDV: { b0: 0x12, b1: 0x05, predecay: 0x1a, gdfinc: 0xff, gdcnt: 0x00, pattern: "STDSND", wave: "GS72" },
    DP1V: { b0: 0x11, b1: 0x05, predecay: 0x11, gdfinc: 0x01, gdcnt: 0x0f, pattern: "SWPAT", wave: "GS72" },
    XBV: { b0: 0x11, b1: 0x31, predecay: 0x00, gdfinc: 0x01, gdcnt: 0x00, pattern: "SPNSND", wave: "GSSQ2" },
    BBSV: { b0: 0xf4, b1: 0x12, predecay: 0x00, gdfinc: 0x00, gdcnt: 0x00, pattern: "BBSND", wave: "GS1" },
    HBEV: { b0: 0x41, b1: 0x45, predecay: 0x00, gdfinc: 0x00, gdcnt: 0x00, pattern: "HBESND", wave: "GS72" },
    PROTV:{ b0: 0x21, b1: 0x35, predecay: 0x11, gdfinc: 0xff, gdcnt: 0x00, pattern: "SPNSND", wave: "GS72" },
    SPNRV:{ b0: 0x15, b1: 0x00, predecay: 0x00, gdfinc: 0xfd, gdcnt: 0x00, pattern: "SPNR", wave: "GS2" },
    CLDWNV:{ b0: 0x31, b1: 0x11, predecay: 0x00, gdfinc: 0x01, gdcnt: 0x00, pattern: "COOLDN", wave: "GSSQ2" },
    SV3:  { b0: 0x01, b1: 0x15, predecay: 0x01, gdfinc: 0x01, gdcnt: 0x01, pattern: "BBSND", wave: "GS72" },
    ED10: { b0: 0xf6, b1: 0x53, predecay: 0x03, gdfinc: 0x00, gdcnt: 0x02, pattern: "ED10FP", wave: "GS12" },
    ED12: { b0: 0x6a, b1: 0x10, predecay: 0x02, gdfinc: 0x00, gdcnt: 0x02, pattern: "ED13FP", wave: "GS2" },
    ED17: { b0: 0x1f, b1: 0x12, predecay: 0x00, gdfinc: 0xff, gdcnt: 0x10, pattern: "SPNR", wave: "GS1" },
    BONV: { b0: 0x31, b1: 0x11, predecay: 0x00, gdfinc: 0xff, gdcnt: 0x00, pattern: "BONSND", wave: "GSSQ2" },
    TRBV: { b0: 0x12, b1: 0x06, predecay: 0x00, gdfinc: 0xff, gdcnt: 0x01, pattern: "TRBPAT", wave: "GS1_7" },
  };
  const DEFENDER_GWAVE_ORDER = [
    "HBDV",
    "STDV",
    "DP1V",
    "XBV",
    "BBSV",
    "HBEV",
    "PROTV",
    "SPNRV",
    "CLDWNV",
    "SV3",
    "ED10",
    "ED12",
    "ED17",
    "BONV",
    "TRBV",
  ];
  // Defa7 sound-script tables (timer ticks are 16 ms units).
  const DEFENDER_SOUND_SCRIPTS = {
    START_DISTORTO: [{ repeat: 1, delayTicks: 0x01, cmd: 0x02 }],
    START1: [{ repeat: 1, delayTicks: 0x40, cmd: 0x0a }],
    START2: [{ repeat: 1, delayTicks: 0x10, cmd: 0x0b }],
    SMARTBOMB: [
      { repeat: 6, delayTicks: 0x04, cmd: 0x11 },
      { repeat: 1, delayTicks: 0x10, cmd: 0x17 },
    ],
  };
  const DEFENDER_VARI_VECTORS = [
    // SAW, FOSHIT, QUASAR, CABSHK (vsndrm1: VVECT, 9 bytes each).
    { loPer: 0x40, hiPer: 0x01, loDt: 0x00, hiDt: 0x10, hiEn: 0xe1, swpDt: 0x0080, loMod: 0xff, vAmp: 0xff },
    { loPer: 0x28, hiPer: 0x01, loDt: 0x00, hiDt: 0x08, hiEn: 0x81, swpDt: 0x0200, loMod: 0xff, vAmp: 0xff },
    { loPer: 0x28, hiPer: 0x81, loDt: 0x00, hiDt: 0xfc, hiEn: 0x01, swpDt: 0x0200, loMod: 0xfc, vAmp: 0xff },
    { loPer: 0xff, hiPer: 0x01, loDt: 0x00, hiDt: 0x18, hiEn: 0x41, swpDt: 0x0480, loMod: 0x00, vAmp: 0xff },
  ];
  const DEFENDER_NOTTAB = [0x47, 0x3f, 0x37, 0x30, 0x29, 0x23, 0x1d, 0x17, 0x12, 0x0d, 0x08, 0x04];
  const DEFENDER_ROM_BASE = 0xf800;
  const DEFENDER_ROM_ADDR = {
    RADSND: 0xfd9a,
    GWVTAB: 0xfe4d,
    GS2: 0xfe4d,
    GSSQ2: 0xfe56,
    GS1: 0xfe5f,
    GS12: 0xfe70,
    GSQ22: 0xfe81,
    GS72: 0xfe92,
    GS1_7: 0xfedb,
    SVTAB: 0xfeec,
    STDV: 0xfef3,
    BONV: 0xff47,
    GFRTAB: 0xff55,
    BONSND: 0xff55,
    HBDSND: 0xff62,
    SWPAT: 0xff78,
    BBSND: 0xff78,
    HBESND: 0xff8c,
    SPNR: 0xff9a,
    COOLDN: 0xff9b,
    STDSND: 0xffc2,
    ORGTAB: 0xfdaa,
    NOTTAB: 0xfe41,
    ED10FP: 0xffe9,
    ED13FP: 0xffef,
    TRBPAT: 0xfff8,
  };

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
      presetEngine: "none",
      presetStartupVariant: "stdv",
      presetBaseHz: 110,
      presetSweep: 9.5,
      presetRomTiming: true,
      presetStrictRomLoop: true,
      presetCpuHz: 894886,
      presetStepMs: 34,
      presetPeriodScale: 8.4,
      presetEchoes: 1,
      presetEchoDelayMs: 72,
      presetEchoDecay: 0.58,
      presetCabinet: true,
      presetBits: 7,
      presetPulseWidth: 0.5,
      presetHPF: 90,
      presetLPF: 10000,
      engineEnabled: true,
      clockRate: +RNG.range(2.0, 8.0).toFixed(2),
      gateDepth: +RNG.range(0.25, 0.55).toFixed(2),
      stepAmount: +RNG.range(0.2, 0.5).toFixed(2),
      delayMix: +RNG.range(0.12, 0.35).toFixed(2),
      delayTime: +RNG.range(0.08, 0.22).toFixed(3),
      feedback: +RNG.range(0.15, 0.55).toFixed(2),
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
      noiseVolume: 1.0,
      textureVolume: 1.0,
      bassVolume: 1.0,
      stereoWidth: 0.5,
      gain: 0.15
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

  function syncRandomizeModeUI() {
    const mode = randomizeModeSelect ? randomizeModeSelect.value : "voices";
    const voicesMode = mode !== "presets";
    if (randomizeModesWrap) randomizeModesWrap.style.display = voicesMode ? "" : "none";
    if (randomizePresetsWrap) randomizePresetsWrap.style.display = voicesMode ? "none" : "";
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
    p.presetEngine = "none";
    p.startupContour = false;
    p.startupContourDepth = 0;
    p.startupContourJitter = 0;
    p.startupContourDirection = "down";
    p.startupContourQuantize = 0;
    p.startupContourPitchDepth = 0;
    p.startupContourTimbreDepth = 0;
    p.startupContourTimeScale = 1.0;
    p.engineEnabled = RNG.next() < 0.3;
    p.clockRate = +RNG.range(0.6, 12.0).toFixed(2);
    p.gateDepth = +RNG.range(0.0, 0.8).toFixed(2);
    p.stepAmount = +RNG.range(0.0, 0.75).toFixed(2);
    p.delayMix = +RNG.range(0.0, 0.55).toFixed(2);
    p.delayTime = +RNG.range(0.03, 0.35).toFixed(3);
    p.feedback = +RNG.range(0.0, 0.75).toFixed(2);
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

  function buildDefenderStartupPreset() {
    const mk = () => {
      const p = defaults();
      p.gain = 0.15;
      p.textureVolume = 1.0;
      p.noiseVolume = 1.0;
      p.bassVolume = 1.0;
      p.stereoWidth = 0.5;
      return p;
    };

    // Dedicated preset engine voice: ROM-style stepped waveform playback.
    const p0 = mk();
    p0.mode = "texture";
    p0.presetEngine = "defender-startup";
    p0.presetStartupVariant = "stdv";
    p0.textureBehavior = "oneshot";
    p0.engineEnabled = false;
    p0.clockRate = 1.0;
    p0.gateDepth = 0.0;
    p0.stepAmount = 0.0;
    p0.delayMix = 0.0;
    p0.delayTime = 0.08;
    p0.feedback = 0.0;
    p0.oscType = "square";
    p0.singleOsc = true;
    p0.pwmOn = false;
    p0.pwm = 0.5;
    p0.oscRate = 1.0;
    p0.baseHz = 150;
    p0.unisonSpread = +RNG.range(0.0001, 0.001).toFixed(4);
    p0.detune = 0;
    p0.subMix = 0.0;
    p0.drive = 0.0;
    p0.filterCutoff = 12000;
    p0.filterQ = 0.8;
    p0.edge = 0.0;
    p0.noiseMix = 0.0;
    p0.textureAms = 8;
    p0.textureSms = 2050;
    p0.textureDms = 2950;
    p0.textureVolume = 1.2;
    p0.startupContour = false;
    p0.startupContourDepth = 0;
    p0.startupContourJitter = 0;
    p0.startupContourDirection = "down";
    p0.startupContourQuantize = 0;
    p0.startupContourPitchDepth = 0;
    p0.startupContourTimbreDepth = 0;
    p0.startupContourTimeScale = 1.0;

    // ROM-authentic startup defaults (STDV: $12,$05,$1A,$FF,0,39,STDSND).
    p0.presetBaseHz = 110.0;
    p0.presetSweep = 1.0;
    p0.presetRomTiming = true;
    p0.presetStrictRomLoop = true;
    p0.presetCpuHz = 894886;
    p0.presetStepMs = 34.0;
    p0.presetPeriodScale = 1.0;
    p0.presetEchoes = 1;
    p0.presetEchoDelayMs = 72.0;
    p0.presetEchoDecay = 0.58;
    p0.presetCabinet = false;
    p0.presetBits = 7;
    p0.presetPulseWidth = 0.5;
    p0.presetHPF = 90;
    p0.presetLPF = 14000;

    const presetVoices = [p0];
    presetVoices.forEach((p) => {
      normalizeTextureEnvelope(p);
      normalizeBassEnvelope(p);
      normalizeNoiseEnvelope(p);
    });
    return presetVoices;
  }

  function buildDefenderSmartbombPreset() {
    const mk = () => {
      const p = defaults();
      p.gain = 0.15;
      p.textureVolume = 1.0;
      p.noiseVolume = 1.0;
      p.bassVolume = 1.0;
      p.stereoWidth = 0.5;
      return p;
    };

    // ROM table clue from defa7: SBSND = six fast repeats then a delayed tail.
    const p0 = mk();
    p0.mode = "texture";
    p0.presetEngine = "defender-smartbomb";
    p0.presetStartupVariant = "stdv";
    p0.textureBehavior = "oneshot";
    p0.engineEnabled = false;
    p0.clockRate = 1.0;
    p0.gateDepth = 0.0;
    p0.stepAmount = 0.0;
    p0.delayMix = 0.0;
    p0.delayTime = 0.08;
    p0.feedback = 0.0;
    p0.oscType = "square";
    p0.singleOsc = true;
    p0.pwmOn = false;
    p0.pwm = 0.5;
    p0.oscRate = 1.0;
    p0.baseHz = 120;
    p0.unisonSpread = 0;
    p0.detune = 0;
    p0.subMix = 0.0;
    p0.drive = 0.0;
    p0.filterCutoff = 12000;
    p0.filterQ = 0.8;
    p0.edge = 0.0;
    p0.noiseMix = 0.0;
    p0.textureAms = 5;
    p0.textureSms = 900;
    p0.textureDms = 2400;
    p0.textureVolume = 1.25;

    p0.presetBaseHz = 95.0;
    p0.presetSweep = 1.0;
    p0.presetRomTiming = false;
    p0.presetStrictRomLoop = false;
    p0.presetCpuHz = 894886;
    p0.presetStepMs = 64.0;      // 0x04 * 16ms
    p0.presetPeriodScale = 1.0;
    p0.presetEchoes = 6;         // first smartbomb stage repeat count
    p0.presetEchoDelayMs = 256.0; // 0x10 * 16ms delayed tail hint
    p0.presetEchoDecay = 0.78;
    p0.presetCabinet = true;
    p0.presetBits = 7;
    p0.presetPulseWidth = 0.5;
    p0.presetHPF = 38;
    p0.presetLPF = 9500;

    const presetVoices = [p0];
    presetVoices.forEach((p) => {
      normalizeTextureEnvelope(p);
      normalizeBassEnvelope(p);
      normalizeNoiseEnvelope(p);
    });
    return presetVoices;
  }

  function applyPresetFromSelection() {
    const family = presetFamilySelect ? presetFamilySelect.value : "defender-startup";
    const built = family === "defender-smartbomb"
      ? buildDefenderSmartbombPreset()
      : buildDefenderStartupPreset();
    for (let i = 0; i < state.voiceParams.length; i++) {
      if (i < built.length) {
        state.activeTracks[i] = true;
        state.frozen[i] = false;
        state.muted[i] = false;
        state.voiceParams[i] = built[i];
        state.paramLocks[i] = {};
        applyDefaultParamLocks(i);
      } else {
        state.activeTracks[i] = false;
        state.frozen[i] = false;
        state.muted[i] = true;
        state.voiceParams[i] = makeDefaultVoice();
        state.paramLocks[i] = {};
        applyDefaultParamLocks(i);
      }
    }
    state.active = 0;
    state.soloIndex = null;
    rerollGlobalSpatialization();
    renderVoices();
    syncControls();
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
    soloIndex: null,
    globalSpatialize: 1.0
  };

  const DEFAULT_LOCKED_PARAMS = ["gain", "textureVolume", "noiseVolume", "bassVolume"];

  function ensureParamLocks(index) {
    if (!state.paramLocks[index]) state.paramLocks[index] = {};
    return state.paramLocks[index];
  }

  function applyDefaultParamLocks(index) {
    const locks = ensureParamLocks(index);
    DEFAULT_LOCKED_PARAMS.forEach((key) => {
      if (locks[key] == null) locks[key] = true;
    });
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

  function makeBitCrusherShaper(ctx, bits = 7) {
    const input = ctx.createGain();
    const shaper = ctx.createWaveShaper();
    const output = ctx.createGain();
    input.connect(shaper);
    shaper.connect(output);

    function setBits(b) {
      const bitDepth = clamp(Math.round(b), 2, 16);
      const steps = Math.pow(2, bitDepth - 1);
      const curve = new Float32Array(4096);
      for (let i = 0; i < curve.length; i++) {
        const x = (i / (curve.length - 1)) * 2 - 1;
        curve[i] = Math.round(x * steps) / steps;
      }
      shaper.curve = curve;
      shaper.oversample = "none";
    }

    setBits(bits);
    return { input, output, setBits };
  }

  function makeStartupDistortoWave(ctx) {
    const n = 32;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    // Bright odd-harmonic-heavy table inspired by Defender start-distorto character.
    for (let k = 1; k < n; k++) {
      const oddWeight = k % 2 ? 1.0 : 0.25;
      const tilt = 1 / Math.pow(k, 0.85);
      imag[k] = oddWeight * tilt;
      real[k] = oddWeight * tilt * 0.08;
    }
    return ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  }

  function strictRomLoopEnabled() {
    // Hidden switch for advanced A/B testing:
    // localStorage.setItem("dz_strict_rom_loop", "0") to disable strict loop timing.
    try {
      const v = localStorage.getItem("dz_strict_rom_loop");
      if (v == null) return true;
      return v !== "0" && v !== "false";
    } catch (_) {
      return true;
    }
  }

  function loadDefenderRomBlob() {
    const hex = typeof window !== "undefined" ? window.DEFENDER_SOUND_ROM_HEX : null;
    if (!hex || typeof hex !== "string" || hex.length < 4096) return null;
    const clean = hex.trim().toLowerCase();
    if (!/^[0-9a-f]+$/.test(clean) || clean.length % 2 !== 0) return null;
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
      bytes[i >> 1] = parseInt(clean.slice(i, i + 2), 16);
    }
    return bytes;
  }

  function defenderRomByte(rom, addr) {
    const i = addr - DEFENDER_ROM_BASE;
    if (!rom || i < 0 || i >= rom.length) return 0;
    return rom[i];
  }

  function readRomBytes(rom, addr, len) {
    const out = [];
    for (let i = 0; i < len; i++) out.push(defenderRomByte(rom, addr + i));
    return out;
  }

  function readRomWave(rom, addr) {
    const len = defenderRomByte(rom, addr) & 0xff;
    return readRomBytes(rom, addr + 1, len);
  }

  function readRomVector(rom, addr) {
    return {
      b0: defenderRomByte(rom, addr + 0),
      b1: defenderRomByte(rom, addr + 1),
      predecay: defenderRomByte(rom, addr + 2),
      gdfinc: defenderRomByte(rom, addr + 3),
      gdcnt: defenderRomByte(rom, addr + 4),
      patternLen: defenderRomByte(rom, addr + 5),
      patternOff: defenderRomByte(rom, addr + 6),
    };
  }

  function buildDefenderRomTables() {
    const rom = loadDefenderRomBlob();
    if (!rom) return null;

    const waves = {
      GS2: readRomWave(rom, DEFENDER_ROM_ADDR.GS2),
      GSSQ2: readRomWave(rom, DEFENDER_ROM_ADDR.GSSQ2),
      GS1: readRomWave(rom, DEFENDER_ROM_ADDR.GS1),
      GS12: readRomWave(rom, DEFENDER_ROM_ADDR.GS12),
      GSQ22: readRomWave(rom, DEFENDER_ROM_ADDR.GSQ22),
      GS72: readRomWave(rom, DEFENDER_ROM_ADDR.GS72),
      GS1_7: readRomWave(rom, DEFENDER_ROM_ADDR.GS1_7),
    };
    const vectorsRaw = {
      HBDV: readRomVector(rom, DEFENDER_ROM_ADDR.SVTAB + 0 * 7),
      STDV: readRomVector(rom, DEFENDER_ROM_ADDR.SVTAB + 1 * 7),
      DP1V: readRomVector(rom, DEFENDER_ROM_ADDR.SVTAB + 2 * 7),
      XBV: readRomVector(rom, DEFENDER_ROM_ADDR.SVTAB + 3 * 7),
      BBSV: readRomVector(rom, DEFENDER_ROM_ADDR.SVTAB + 4 * 7),
      HBEV: readRomVector(rom, DEFENDER_ROM_ADDR.SVTAB + 5 * 7),
      PROTV: readRomVector(rom, DEFENDER_ROM_ADDR.SVTAB + 6 * 7),
      SPNRV: readRomVector(rom, DEFENDER_ROM_ADDR.SVTAB + 7 * 7),
      CLDWNV: readRomVector(rom, DEFENDER_ROM_ADDR.SVTAB + 8 * 7),
      SV3: readRomVector(rom, DEFENDER_ROM_ADDR.SVTAB + 9 * 7),
      ED10: readRomVector(rom, DEFENDER_ROM_ADDR.SVTAB + 10 * 7),
      ED12: readRomVector(rom, DEFENDER_ROM_ADDR.SVTAB + 11 * 7),
      ED17: readRomVector(rom, DEFENDER_ROM_ADDR.SVTAB + 12 * 7),
      BONV: readRomVector(rom, DEFENDER_ROM_ADDR.SVTAB + 13 * 7),
      TRBV: readRomVector(rom, DEFENDER_ROM_ADDR.SVTAB + 14 * 7),
    };
    const waveByNibble = ["GS2", "GSSQ2", "GS1", "GS12", "GSQ22", "GS72", "GS1_7"];
    const vectors = {};
    Object.keys(vectorsRaw).forEach((k) => {
      const v = vectorsRaw[k];
      const wave = waveByNibble[v.b1 & 0x0f] || "GS2";
      const patAddr = DEFENDER_ROM_ADDR.GFRTAB + (v.patternOff & 0xff);
      vectors[k] = {
        b0: v.b0,
        b1: v.b1,
        predecay: v.predecay,
        gdfinc: v.gdfinc,
        gdcnt: v.gdcnt,
        pattern: readRomBytes(rom, patAddr, v.patternLen & 0xff),
        wave,
      };
    });

    return {
      waves,
      vectors,
      radsnd: readRomBytes(rom, DEFENDER_ROM_ADDR.RADSND, 16),
      organTunes: parseOrganTunes(DEFENDER_ROM_ADDR.ORGTAB),
      nottab: readRomBytes(rom, DEFENDER_ROM_ADDR.NOTTAB, 12),
    };
  }

  const DEFENDER_ROM_TABLES = buildDefenderRomTables();

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
    const texturePostGain = ctx.createGain();
    texturePostGain.gain.value = 1.0;
    const noisePostGain = ctx.createGain();
    noisePostGain.gain.value = 1.0;
    const presetHP = ctx.createBiquadFilter();
    presetHP.type = "highpass";
    presetHP.frequency.value = 90;
    const presetLP = ctx.createBiquadFilter();
    presetLP.type = "lowpass";
    presetLP.frequency.value = 10000;
    const presetReconLP = ctx.createBiquadFilter();
    presetReconLP.type = "lowpass";
    presetReconLP.frequency.value = 9200;
    presetReconLP.Q.value = 0.707;
    const presetGain = ctx.createGain();
    presetGain.gain.value = 0.0;
    const presetCabHP = ctx.createBiquadFilter();
    presetCabHP.type = "highpass";
    presetCabHP.frequency.value = 110;
    const presetCabPeak = ctx.createBiquadFilter();
    presetCabPeak.type = "peaking";
    presetCabPeak.frequency.value = 1200;
    presetCabPeak.Q.value = 0.9;
    presetCabPeak.gain.value = 2.8;
    const presetCabShelf = ctx.createBiquadFilter();
    presetCabShelf.type = "highshelf";
    presetCabShelf.frequency.value = 3600;
    presetCabShelf.gain.value = -4.5;
    const presetCabDry = ctx.createGain();
    presetCabDry.gain.value = 0.0;
    const presetCabWet = ctx.createGain();
    presetCabWet.gain.value = 1.0;

    const panner = ctx.createStereoPanner();
    panner.pan.value = 0;
    const spatialEntry = ctx.createGain();
    spatialEntry.gain.value = 1.0;
    const spatialDry = ctx.createGain();
    spatialDry.gain.value = 1.0;
    const voiceOut = ctx.createGain();
    voiceOut.gain.value = 0;
    const engineGate = ctx.createGain();
    engineGate.gain.value = 1.0;
    const engineDry = ctx.createGain();
    engineDry.gain.value = 1.0;
    const engineDelay = ctx.createDelay(1.0);
    engineDelay.delayTime.value = 0.12;
    const engineDelayFb = ctx.createGain();
    engineDelayFb.gain.value = 0.25;
    const engineWet = ctx.createGain();
    engineWet.gain.value = 0.0;
    const engineOut = ctx.createGain();
    engineOut.gain.value = 1.0;
    const gateBase = ctx.createConstantSource();
    gateBase.offset.value = 1.0;
    const gateLfo = ctx.createOscillator();
    gateLfo.type = "triangle";
    gateLfo.frequency.value = 3.0;
    const gateLfoGain = ctx.createGain();
    gateLfoGain.gain.value = 0.0;
    noiseModeGain.connect(noisePostGain);
    noiseCrackleGain.connect(noisePostGain);
    noiseBoomGain.connect(noisePostGain);
    noiseRingGain.connect(noisePostGain);
    noisePostGain.connect(panner);
    let presetSrc = null;
    // Dynamic source chain: buffer source -> HP -> LP -> preset gain -> cabinet EQ -> panner.
    const presetInput = ctx.createGain();
    presetInput.connect(presetHP);
    presetHP.connect(presetLP);
    presetLP.connect(presetReconLP);
    presetReconLP.connect(presetGain);
    presetGain.connect(presetCabDry);
    presetCabDry.connect(panner);
    presetGain.connect(presetCabHP);
    presetCabHP.connect(presetCabPeak);
    presetCabPeak.connect(presetCabShelf);
    presetCabShelf.connect(presetCabWet);
    presetCabWet.connect(panner);

    const spatialBands = [];
    SPATIAL_CENTERS.forEach((fc) => {
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = fc;
      const fNorm = clamp((Math.log(fc) - Math.log(SPATIAL_MIN)) / (Math.log(SPATIAL_MAX) - Math.log(SPATIAL_MIN)), 0, 1);
      bp.Q.value = lerp(1.2, 3.4, fNorm);
      const g = ctx.createGain();
      g.gain.value = 0.0;
      const pan = ctx.createStereoPanner();
      pan.pan.value = 0;
      spatialEntry.connect(bp);
      bp.connect(g);
      g.connect(pan);
      pan.connect(voiceOut);
      spatialBands.push({ bp, g, pan, fc, idx: spatialBands.length, panNorm: 0, gainNorm: 0 });
    });

    mainGain.connect(filter);
    filter.connect(drive.input);
    drive.output.connect(gain);

    mainGain.connect(edgeBP);
    edgeBP.connect(edgeGain);
    edgeGain.connect(drive.input);

    gain.connect(texturePostGain);
    texturePostGain.connect(panner);
    panner.connect(spatialEntry);
    panner.connect(spatialDry);
    spatialDry.connect(voiceOut);
    voiceOut.connect(engineGate);
    engineGate.connect(engineDry);
    engineGate.connect(engineDelay);
    engineDelay.connect(engineDelayFb);
    engineDelayFb.connect(engineDelay);
    engineDelay.connect(engineWet);
    engineDry.connect(engineOut);
    engineWet.connect(engineOut);
    engineOut.connect(master);
    gateBase.connect(engineGate.gain);
    gateLfo.connect(gateLfoGain);
    gateLfoGain.connect(engineGate.gain);

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
    gateBase.start();
    gateLfo.start();
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
    let presetGateUntil = 0;
    const sustainSpatialPhase = Math.random() * Math.PI * 2;
    const sustainSpatialRate = lerp(0.045, 0.12, Math.random());
    const sustainSpatialDepth = lerp(0.55, 1.0, Math.random());
    const oneShotSpatial = { active: false, t0: 0, dur: 0, dir: 1 };
    let nextStepAt = 0;

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

    function quantizeSample(x, bitDepth) {
      const qBits = clamp(Math.round(bitDepth), 3, 12);
      const qLevels = Math.pow(2, qBits) - 1;
      const u = clamp(Math.round(((x + 1) * 0.5) * qLevels), 0, qLevels);
      return (u / qLevels) * 2 - 1;
    }

    function add8(a, b) {
      const sum = (a & 0xff) + (b & 0xff);
      return { value: sum & 0xff, carry: sum > 0xff ? 1 : 0 };
    }

    function signed8(v) {
      const n = v & 0xff;
      return n >= 0x80 ? n - 0x100 : n;
    }

    function applyWvDeca(workingWave, romWave, factor) {
      if (!factor) return;
      for (let i = 0; i < workingWave.length; i++) {
        const decUnit = (romWave[i] & 0xff) >> 4;
        const dec = decUnit * factor;
        workingWave[i] = (workingWave[i] - dec) & 0xff;
      }
    }

    function periodToHoldSamples(period, useRomTiming, strictLoop, cpuHz, stepScale) {
      if (!useRomTiming) {
        return Math.max(1, Math.round(period * clamp(stepScale, 0.2, 6.0)));
      }
      const hz = clamp(cpuHz || 894886, 200000, 3000000);
      // GWAVE inner-loop cycle model from loop disassembly:
      // wait loop ~= 5*period-1 cycles, plus fixed per-sample path overhead.
      const strictFixedCyclesPerSample = 18.0;
      const relaxedFixedCyclesPerSample = 23.0;
      const fixed = strictLoop ? strictFixedCyclesPerSample : relaxedFixedCyclesPerSample;
      const cycles = (5.0 * period - 1.0) + fixed;
      return Math.max(1, Math.round((cycles / hz) * ctx.sampleRate));
    }

    function renderRomGwaveVector(vectorName, opts = {}) {
      const romVector = DEFENDER_ROM_TABLES && DEFENDER_ROM_TABLES.vectors
        ? DEFENDER_ROM_TABLES.vectors[vectorName]
        : null;
      const vector = romVector || DEFENDER_GWAVE_VECTORS[vectorName];
      if (!vector) return new Float32Array(1);
      const waves = DEFENDER_ROM_TABLES && DEFENDER_ROM_TABLES.waves ? DEFENDER_ROM_TABLES.waves : DEFENDER_WAVES;
      const romWave = waves[vector.wave] ? waves[vector.wave].slice() : DEFENDER_WAVES.GS2.slice();
      const pattern = Array.isArray(vector.pattern)
        ? vector.pattern.slice()
        : (DEFENDER_PATTERNS[vector.pattern] ? DEFENDER_PATTERNS[vector.pattern].slice() : [0x40]);
      const bitDepth = clamp(Math.round(opts.bitDepth ?? 7), 3, 12);
      const stepScale = opts.stepScale ?? 1.0;
      const useRomTiming = !!opts.romTiming;
      const strictLoop = !!opts.strictLoop;
      const cpuHz = opts.cpuHz ?? 894886;

      const gecho = (vector.b0 >> 4) & 0x0f;
      const gccnt = vector.b0 & 0x0f;
      const gecdec = (vector.b1 >> 4) & 0x0f;
      const gdfinc = signed8(vector.gdfinc);
      let gdcnt = vector.gdcnt & 0xff;
      let fofset = 0;
      let gwfrq = 0;
      let frqend = pattern.length;
      let workingWave = romWave.slice();
      applyWvDeca(workingWave, romWave, vector.predecay & 0xff);

      const out = [];
      const emitPeriod = (periodU8) => {
        const period = Math.max(1, periodU8 & 0xff);
        const hold = periodToHoldSamples(period, useRomTiming, strictLoop, cpuHz, stepScale);
        for (let c = 0; c < Math.max(1, gccnt); c++) {
          for (let i = 0; i < workingWave.length; i++) {
            const sample = quantizeSample(((workingWave[i] & 0xff) - 127.5) / 127.5, bitDepth);
            for (let h = 0; h < hold; h++) out.push(sample);
          }
        }
      };

      let guard = 0;
      while (guard++ < 2048) {
        for (let echo = 0; echo < Math.max(1, gecho); echo++) {
          for (let x = gwfrq; x < frqend; x++) {
            emitPeriod((pattern[x] + fofset) & 0xff);
          }
          applyWvDeca(workingWave, romWave, gecdec);
        }

        if (gdfinc === 0) break;
        gdcnt = (gdcnt - 1) & 0xff;
        if (gdcnt === 0) break;
        fofset = (fofset + (gdfinc & 0xff)) & 0xff;

        let x = gwfrq;
        let found = false;
        let restarted = false;
        while (true) {
          const pat = pattern[x] & 0xff;
          const added = add8(fofset, pat);
          const overflow = gdfinc >= 0
            ? added.carry === 1
            : (added.value === 0 || added.carry === 0);

          if (overflow) {
            if (found) {
              frqend = x;
              if (gecdec !== 0) {
                workingWave = romWave.slice();
                applyWvDeca(workingWave, romWave, vector.predecay & 0xff);
              }
              restarted = true;
              break;
            }
          } else if (!found) {
            gwfrq = x;
            found = true;
          }

          x++;
          if (x !== frqend) continue;
          if (found) {
            frqend = x;
            if (gecdec !== 0) {
              workingWave = romWave.slice();
              applyWvDeca(workingWave, romWave, vector.predecay & 0xff);
            }
            restarted = true;
            break;
          }
          return new Float32Array(out.length ? out : [0]);
        }
        if (!restarted) break;
      }
      return new Float32Array(out.length ? out : [0]);
    }

    function renderRomRadio(bitDepth = 7, maxSec = 2.8, startFreq = 100) {
      const out = [];
      let timerL = 0;
      let timerH = 0;
      let freq = clamp(Math.round(startFreq), 1, 65535);
      const maxSamples = Math.floor(ctx.sampleRate * Math.max(0.1, maxSec));
      const cyclesPerIter = 28.0;
      const hold = Math.max(1, Math.round((cyclesPerIter / 894886) * ctx.sampleRate));

      while (freq !== 0 && out.length < maxSamples) {
        const addL = timerL + (freq & 0xff);
        timerL = addL & 0xff;
        const carryL = addL > 0xff ? 1 : 0;
        const addH = timerH + ((freq >> 8) & 0xff) + carryL;
        timerH = addH & 0xff;
        const carryH = addH > 0xff ? 1 : 0;
        if (carryH) {
          freq = (freq + 1) & 0xffff;
          if (freq === 0) break;
        }
        const idx = timerH & 0x0f;
        const tbl = DEFENDER_ROM_TABLES && DEFENDER_ROM_TABLES.radsnd ? DEFENDER_ROM_TABLES.radsnd : DEFENDER_RADSND;
        const sampleU8 = tbl[idx] & 0xff;
        const sample = quantizeSample((sampleU8 - 127.5) / 127.5, bitDepth);
        for (let h = 0; h < hold; h++) out.push(sample);
      }
      return new Float32Array(out.length ? out : [0]);
    }

    function stepDefenderRand(state) {
      let a = state.lo & 0xff;
      let carry = 0;
      for (let i = 0; i < 3; i++) {
        carry = a & 1;
        a = (a >> 1) & 0xff;
      }
      a ^= state.lo & 0xff;
      carry = a & 1;
      a = (a >> 1) & 0xff;
      const hiOld = state.hi & 0xff;
      const loOld = state.lo & 0xff;
      const hiNew = ((carry << 7) | (hiOld >> 1)) & 0xff;
      const loNew = (((hiOld & 1) << 7) | (loOld >> 1)) & 0xff;
      state.hi = hiNew;
      state.lo = loNew;
      return (loOld & 1) !== 0;
    }

    function u8ToSample(v) {
      return clamp(((v & 0xff) - 127.5) / 127.5, -1, 1);
    }

    function waitSamplesFromCounter(counter, cyclesPerIter = 5.0, cpuHz = 894886) {
      const loops = Math.max(1, counter | 0);
      return Math.max(1, Math.round((loops * cyclesPerIter / cpuHz) * ctx.sampleRate));
    }

    function renderLitenRoutine(startLFreq, dfreq, cycnt, maxSec = 2.5) {
      const maxSamples = Math.max(1, Math.floor(maxSec * ctx.sampleRate));
      const out = [];
      const r = { hi: 0xff, lo: 0x37 };
      let sound = 0xff;
      let lfreq = startLFreq & 0xff;
      const dfi = signed8(dfreq);

      while (lfreq !== 0 && out.length < maxSamples) {
        let b = Math.max(1, cycnt | 0);
        while (b-- > 0 && out.length < maxSamples) {
          if (stepDefenderRand(r)) sound = (~sound) & 0xff;
          const hold = waitSamplesFromCounter(lfreq, 4.8);
          const s = u8ToSample(sound);
          for (let i = 0; i < hold && out.length < maxSamples; i++) out.push(s);
        }
        lfreq = (lfreq + dfi) & 0xff;
      }
      return new Float32Array(out.length ? out : [0]);
    }

    function renderNoiseRoutine({ decay = 1, period = 1, amp = 0xff, cycnt = 0x20, nfflg = 1, maxSec = 2.0 }) {
      const maxSamples = Math.max(1, Math.floor(maxSec * ctx.sampleRate));
      const out = [];
      const r = { hi: 0xff, lo: 0x37 };
      let nfrq = Math.max(1, period | 0);
      let namp = amp & 0xff;
      const dec = Math.max(1, decay | 0);

      while (out.length < maxSamples && namp > 0) {
        let b = Math.max(1, cycnt | 0);
        while (b-- > 0 && out.length < maxSamples) {
          const sound = stepDefenderRand(r) ? namp : 0;
          const hold = waitSamplesFromCounter(nfrq, 4.7);
          const s = u8ToSample(sound);
          for (let i = 0; i < hold && out.length < maxSamples; i++) out.push(s);
        }
        namp = (namp - dec) & 0xff;
        if (namp === 0) break;
        if (nfflg) nfrq = (nfrq + 1) & 0xffff;
      }
      return new Float32Array(out.length ? out : [0]);
    }

    function renderFilteredNoiseRoutine({ fmaxInit = 3, fdf = 0, dsflg = 0, sampleCount = 1200, maxSec = 2.0 }) {
      const maxSamples = Math.max(1, Math.floor(maxSec * ctx.sampleRate));
      const out = [];
      const r = { hi: 0xff, lo: 0x37 };
      let fmax = fmaxInit & 0xff;
      let flo = 0;
      let sound = 0;
      let guard = 0;

      while (out.length < maxSamples && guard++ < 4096) {
        let x = Math.max(1, sampleCount | 0);
        while (x-- > 0 && out.length < maxSamples) {
          stepDefenderRand(r);
          let fhi = fmax;
          if (dsflg) fhi &= r.hi;
          let a = sound & 0xff;
          let b = flo & 0xff;
          if (a <= r.lo) {
            // slope up
            b = (b + flo) & 0xff;
            a = (a + fhi + (b < flo ? 1 : 0)) & 0xff;
          } else {
            // slope down
            b = (b - flo) & 0xff;
            a = (a - fhi) & 0xff;
          }
          sound = a & 0xff;
          const hold = waitSamplesFromCounter(Math.max(1, (fhi & 0xff) || 1), 2.4);
          const s = u8ToSample(sound);
          for (let i = 0; i < hold && out.length < maxSamples; i++) out.push(s);
        }
        if (!fdf) break;
        const q = (((fmax << 8) | flo) >> 3) & 0xffff;
        const inv = ((~q + 1) & 0xffff);
        const sum = (((fmax << 8) | flo) + inv) & 0xffff;
        fmax = (sum >> 8) & 0xff;
        flo = sum & 0xff;
        if (fmax === 0 && flo === 7) break;
      }
      return new Float32Array(out.length ? out : [0]);
    }

    function renderScreamPcm(sec = 1.25) {
      const len = Math.max(1, Math.floor(sec * ctx.sampleRate));
      const out = new Float32Array(len);
      const echoes = [0x40, 0x00, 0x00, 0x00];
      const timers = [0, 0, 0, 0];
      for (let i = 0; i < len; i++) {
        let amp = 0.8;
        let s = 0;
        for (let e = 0; e < 4; e++) {
          timers[e] = (timers[e] + echoes[e]) & 0xff;
          if (timers[e] & 0x80) s += amp;
          amp *= 0.5;
        }
        out[i] = clamp((s / 0.9375) * 0.9, -1, 1);
        if (i % Math.max(1, Math.floor(ctx.sampleRate / 240)) === 0) {
          for (let e = 0; e < 4; e++) {
            if (echoes[e] === 0x37 && e < 3 && echoes[e + 1] === 0x00) echoes[e + 1] = 0x41;
            if (echoes[e] > 0) echoes[e] = Math.max(0, echoes[e] - 1);
          }
        }
      }
      return out;
    }

    function renderVariVectorPcm(vec, bitDepth = 7, maxSec = 1.8) {
      const maxSamples = Math.max(1, Math.floor(maxSec * ctx.sampleRate));
      const out = [];
      let loPer = vec.loPer & 0xff;
      const hiPerBase = vec.hiPer & 0xff;
      let loCnt = loPer;
      let hiCnt = hiPerBase;
      let sound = vec.vAmp & 0xff;
      const hiDt = signed8(vec.hiDt);
      const loDt = signed8(vec.loDt);
      const hiEn = vec.hiEn & 0xff;
      const loMod = signed8(vec.loMod);
      const swp = Math.max(1, vec.swpDt | 0);
      let guard = 0;

      const pulse = (count, high) => {
        const hold = waitSamplesFromCounter(count, 4.5);
        const s0 = high ? sound : ((~sound) & 0xff);
        const s = quantizeSample(u8ToSample(s0), bitDepth);
        for (let i = 0; i < hold && out.length < maxSamples; i++) out.push(s);
      };

      while (out.length < maxSamples && guard++ < 16384) {
        // One VARI sweep window.
        let x = swp;
        while (x-- > 0 && out.length < maxSamples) {
          pulse(Math.max(1, loCnt), false);
          pulse(Math.max(1, hiCnt), true);
        }
        loCnt = (loCnt + loDt) & 0xff;
        hiCnt = (hiCnt + hiDt) & 0xff;
        if (hiCnt === hiEn) {
          if (loMod === 0) break;
          loPer = (loPer + loMod) & 0xff;
          if (loPer === 0) break;
          loCnt = loPer;
          hiCnt = hiPerBase;
        }
      }

      return new Float32Array(out.length ? out : [0]);
    }

    function popcount8(x) {
      let v = x & 0xff;
      let c = 0;
      while (v) {
        v &= (v - 1);
        c++;
      }
      return c;
    }

    function renderOrganEntryPcm(entry, maxSec = 3.0) {
      const maxSamples = Math.max(1, Math.floor(maxSec * ctx.sampleRate));
      const out = [];
      let tempb = 0;
      const oscMask = entry.oscMask & 0xff;
      const dur = Math.max(1, entry.dur | 0);
      const delay = entry.delay & 0xff;
      // Delay byte is compiled into a tiny code stub; model as extra cycles per sample.
      const iterCycles = 34 + delay * 4.0;
      const hold = Math.max(1, Math.round((iterCycles / 894886) * ctx.sampleRate));

      for (let i = 0; i < dur && out.length < maxSamples; i++) {
        tempb = (tempb + 1) & 0xff;
        const b = tempb & oscMask;
        const a = popcount8(b) & 0x0f;
        const s = quantizeSample(u8ToSample((a << 4) & 0xff), 7);
        for (let h = 0; h < hold && out.length < maxSamples; h++) out.push(s);
      }
      return new Float32Array(out.length ? out : [0]);
    }

    function renderOrganTunePcm(sec = 1.8) {
      const tunes = DEFENDER_ROM_TABLES && Array.isArray(DEFENDER_ROM_TABLES.organTunes)
        ? DEFENDER_ROM_TABLES.organTunes
        : [];
      const tune = tunes[0] && tunes[0].length ? tunes[0] : [
        { oscMask: 0x7f, delay: 0x1d, dur: 0x0ffb },
        { oscMask: 0x7f, delay: 0x23, dur: 0x0f15 },
        { oscMask: 0xfe, delay: 0x08, dur: 0x508b },
      ];
      const chunks = tune.map((e) => renderOrganEntryPcm(e, sec));
      let total = 0;
      for (let i = 0; i < chunks.length; i++) total += chunks[i].length;
      const maxLen = Math.max(1, Math.floor(sec * ctx.sampleRate));
      const out = new Float32Array(Math.min(maxLen, total));
      let p = 0;
      for (let i = 0; i < chunks.length && p < out.length; i++) {
        const c = chunks[i];
        const take = Math.min(c.length, out.length - p);
        out.set(c.subarray(0, take), p);
        p += take;
      }
      return out;
    }

    function renderOrganNotePcm(sec = 1.0, nottabIndex = 4) {
      const nottab = DEFENDER_ROM_TABLES && Array.isArray(DEFENDER_ROM_TABLES.nottab) && DEFENDER_ROM_TABLES.nottab.length >= 12
        ? DEFENDER_ROM_TABLES.nottab
        : DEFENDER_NOTTAB;
      const idx = clamp(Math.round(nottabIndex), 0, nottab.length - 1);
      const delay = nottab[idx] & 0xff;
      // ORGANN mode sets OSCIL with 0x7F mask and indefinite duration.
      const entry = { oscMask: 0x7f, delay, dur: 0xffff };
      return renderOrganEntryPcm(entry, sec);
    }

    function renderRomCommandPcm(cmd, p, level) {
      const romTiming = !!p.presetRomTiming;
      const strictLoop = p.presetStrictRomLoop !== false && strictRomLoopEnabled();
      const cpuHz = clamp(p.presetCpuHz ?? 894886, 200000, 3000000);
      const bits = clamp(Math.round(p.presetBits ?? 7), 3, 12);
      const stepMs = clamp(p.presetStepMs ?? 34, 8, 220);
      const baseHz = clamp(p.presetBaseHz ?? 100, 25, 280);
      const pitchScale = clamp(95 / baseHz, 0.2, 4.0);
      const vectorName = (cmd >= 1 && cmd <= DEFENDER_GWAVE_ORDER.length)
        ? DEFENDER_GWAVE_ORDER[cmd - 1]
        : null;

      if (vectorName) {
        return renderRomGwaveVector(vectorName, {
          bitDepth: bits,
          romTiming,
          strictLoop,
          cpuHz,
          stepScale: (stepMs / 22.0) * pitchScale,
        });
      }
      if (cmd === 0x11) {
        // BON2 handler routes to BONV on first trigger; use BONV as the base color.
        return renderRomGwaveVector("BONV", {
          bitDepth: bits,
          romTiming,
          strictLoop,
          cpuHz,
          stepScale: (stepMs / 22.0) * pitchScale,
        });
      }
      if (cmd === 0x17) {
        return renderRomRadio(bits, 2.8, Math.round(70 + baseHz * 0.55));
      }
      if (cmd === 0x18) {
        // Hyper toggle loop approximation.
        const len = Math.max(1, Math.floor(ctx.sampleRate * 0.42));
        const out = new Float32Array(len);
        let phase = 0;
        const duty = Math.max(1, Math.floor(ctx.sampleRate / 1800));
        let v = 1;
        for (let i = 0; i < len; i++) {
          if ((phase++ % duty) === 0) v = -v;
          out[i] = v * 0.75;
        }
        return out;
      }
      if (cmd === 0x10) {
        // LITE
        return renderLitenRoutine(0x01, 0x01, 0x03, 2.0);
      }
      if (cmd === 0x13) {
        // TURBO
        return renderNoiseRoutine({
          decay: 0x01,
          period: 0x0001,
          amp: 0xff,
          cycnt: 0x20,
          nfflg: 1,
          maxSec: 1.9,
        });
      }
      if (cmd === 0x14) {
        // APPEAR
        return renderLitenRoutine(0xc0, 0xfe, 0x10, 2.0);
      }
      if (cmd === 0x15) {
        // THRUST (steady filtered noise bed)
        return renderFilteredNoiseRoutine({
          fmaxInit: 0x03,
          fdf: 0,
          dsflg: 0,
          sampleCount: 1100,
          maxSec: 1.5,
        });
      }
      if (cmd === 0x16) {
        // CANNON (distorted filtered noise transient)
        return renderFilteredNoiseRoutine({
          fmaxInit: 0xff,
          fdf: 1,
          dsflg: 1,
          sampleCount: 1000,
          maxSec: 1.7,
        });
      }
      if (cmd === 0x19) {
        return renderScreamPcm(1.35);
      }
      if (cmd === 0x1a) {
        return renderOrganTunePcm(1.9);
      }
      if (cmd === 0x1b) {
        return renderOrganNotePcm(1.0, 4);
      }
      if (cmd >= 0x1c && cmd <= 0x3f) {
        const idx = (cmd - 0x1c) % DEFENDER_VARI_VECTORS.length;
        const vec = DEFENDER_VARI_VECTORS[idx];
        return renderVariVectorPcm(vec, bits, 1.8);
      }
      // Unknown/special commands fallback to silence.
      return new Float32Array([0]);
    }

    function renderSoundScriptPcm(script, p, level) {
      if (!Array.isArray(script) || !script.length) return new Float32Array([0]);
      const commandBursts = [];
      let atSec = 0;
      let maxEnd = 0;
      for (let i = 0; i < script.length; i++) {
        const step = script[i];
        const repeat = clamp(Math.round(step.repeat ?? 1), 1, 16);
        const gap = clamp((step.delayTicks ?? 1) * 0.016, 0.002, 3.0);
        for (let r = 0; r < repeat; r++) {
          const pcm = renderRomCommandPcm(step.cmd & 0xff, p, level);
          commandBursts.push({ atSec, pcm, gain: 1.0 });
          maxEnd = Math.max(maxEnd, atSec + pcm.length / ctx.sampleRate);
          atSec += gap;
        }
      }
      const out = new Float32Array(Math.max(1, Math.ceil((maxEnd + 0.02) * ctx.sampleRate)));
      for (let i = 0; i < commandBursts.length; i++) {
        const b = commandBursts[i];
        const start = Math.floor(b.atSec * ctx.sampleRate);
        for (let n = 0; n < b.pcm.length && start + n < out.length; n++) {
          out[start + n] = clamp(out[start + n] + b.pcm[n] * b.gain, -1, 1);
        }
      }
      return out;
    }

    function renderDefenderSmartbombPcm(p, level) {
      return renderSoundScriptPcm(DEFENDER_SOUND_SCRIPTS.SMARTBOMB, p, level);
    }

    function triggerPresetStartup(p, t, level) {
      const hpf = clamp(p.presetHPF ?? 90, 20, 4000);
      const lpf = clamp(p.presetLPF ?? 10000, 1200, 16000);
      const useCabinet = p.presetCabinet !== false;
      const variant = String(p.presetStartupVariant || "stdv");
      const startupScript = variant === "stdv"
        ? DEFENDER_SOUND_SCRIPTS.START_DISTORTO
        : variant === "st2"
        ? DEFENDER_SOUND_SCRIPTS.START2
        : (variant === "st1st2"
          ? DEFENDER_SOUND_SCRIPTS.START1.concat(DEFENDER_SOUND_SCRIPTS.START2)
          : DEFENDER_SOUND_SCRIPTS.START1);
      const stepPcm = renderSoundScriptPcm(startupScript, p, level);
      const echoes = clamp(Math.round(p.presetEchoes ?? 1), 1, 6);
      const echoDelay = clamp(p.presetEchoDelayMs ?? 72, 10, 320) / 1000;
      const echoDecay = clamp(p.presetEchoDecay ?? 0.58, 0.2, 0.98);
      const totalSec = stepPcm.length / ctx.sampleRate + (echoes - 1) * echoDelay;

      presetGateUntil = t + totalSec;
      triggerSpatialOneShot(totalSec, t);

      presetHP.frequency.setTargetAtTime(hpf, t, 0.02);
      presetLP.frequency.setTargetAtTime(lpf, t, 0.02);
      presetCabDry.gain.setTargetAtTime(useCabinet ? 0.0 : 1.0, t, 0.02);
      presetCabWet.gain.setTargetAtTime(useCabinet ? 1.0 : 0.0, t, 0.02);
      presetGain.gain.cancelScheduledValues(t);
      presetGain.gain.setValueAtTime(0, t);
      if (presetSrc) {
        try { presetSrc.stop(); } catch (_) {}
        try { presetSrc.disconnect(); } catch (_) {}
        presetSrc = null;
      }

      const mix = new Float32Array(Math.max(1, Math.ceil(totalSec * ctx.sampleRate)));
      for (let e = 0; e < echoes; e++) {
        const echoLevel = Math.pow(echoDecay, e);
        const start = Math.floor(e * echoDelay * ctx.sampleRate);
        for (let i = 0; i < stepPcm.length && start + i < mix.length; i++) {
          mix[start + i] = clamp(mix[start + i] + stepPcm[i] * echoLevel, -1, 1);
        }
      }
      const buf = ctx.createBuffer(1, mix.length, ctx.sampleRate);
      buf.getChannelData(0).set(mix);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(presetInput);
      src.start(t);
      presetSrc = src;

      presetGain.gain.setValueAtTime(1.0, t);
      presetGain.gain.linearRampToValueAtTime(0.0, t + totalSec);
    }

    function triggerPresetSmartbomb(p, t, level) {
      const hpf = clamp(p.presetHPF ?? 38, 20, 4000);
      const lpf = clamp(p.presetLPF ?? 9500, 1200, 16000);
      const useCabinet = p.presetCabinet !== false;
      const mix = renderDefenderSmartbombPcm(p, level);
      const totalSec = mix.length / ctx.sampleRate;
      presetGateUntil = t + totalSec;
      triggerSpatialOneShot(totalSec, t);

      presetHP.frequency.setTargetAtTime(hpf, t, 0.01);
      presetLP.frequency.setTargetAtTime(lpf, t, 0.01);
      presetCabDry.gain.setTargetAtTime(useCabinet ? 0.0 : 1.0, t, 0.02);
      presetCabWet.gain.setTargetAtTime(useCabinet ? 1.0 : 0.0, t, 0.02);
      presetGain.gain.cancelScheduledValues(t);
      presetGain.gain.setValueAtTime(0, t);
      if (presetSrc) {
        try { presetSrc.stop(); } catch (_) {}
        try { presetSrc.disconnect(); } catch (_) {}
        presetSrc = null;
      }

      const buf = ctx.createBuffer(1, mix.length, ctx.sampleRate);
      buf.getChannelData(0).set(mix);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(presetInput);
      src.start(t);
      presetSrc = src;
      presetGain.gain.setValueAtTime(1.0, t);
      presetGain.gain.linearRampToValueAtTime(0.0, t + totalSec);
    }

    function triggerPresetCommand(cmd, p, t, level) {
      const hpf = clamp(p.presetHPF ?? 90, 20, 4000);
      const lpf = clamp(p.presetLPF ?? 12000, 1200, 16000);
      const useCabinet = p.presetCabinet !== false;
      const pcm = renderRomCommandPcm(cmd & 0xff, p, clamp(level, 0.01, 2.0));
      const totalSec = Math.max(0.04, pcm.length / ctx.sampleRate);
      presetGateUntil = t + totalSec;
      triggerSpatialOneShot(totalSec, t);

      presetHP.frequency.setTargetAtTime(hpf, t, 0.01);
      presetLP.frequency.setTargetAtTime(lpf, t, 0.01);
      presetCabDry.gain.setTargetAtTime(useCabinet ? 0.0 : 1.0, t, 0.02);
      presetCabWet.gain.setTargetAtTime(useCabinet ? 1.0 : 0.0, t, 0.02);
      presetGain.gain.cancelScheduledValues(t);
      presetGain.gain.setValueAtTime(0, t);
      if (presetSrc) {
        try { presetSrc.stop(); } catch (_) {}
        try { presetSrc.disconnect(); } catch (_) {}
        presetSrc = null;
      }

      const buf = ctx.createBuffer(1, pcm.length, ctx.sampleRate);
      buf.getChannelData(0).set(pcm);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(presetInput);
      src.start(t);
      presetSrc = src;
      presetGain.gain.setValueAtTime(1.0, t);
      presetGain.gain.linearRampToValueAtTime(0.0, t + totalSec);
    }

    function scheduleDefenderStartupContour(p, t, isSingle, spread, baseRateHz) {
      if (!p.startupContour) return;
      const ep = effectiveTextureEndpoints(p);
      const timeScale = clamp(p.startupContourTimeScale ?? 1.0, 0.35, 1.8);
      const total = Math.max(0.12, (ep.d / 1000) * timeScale);
      const depth = clamp01(p.startupContourDepth ?? 0.85);
      const pitchDepth = clamp01(p.startupContourPitchDepth ?? depth);
      const timbreDepth = clamp01(p.startupContourTimbreDepth ?? depth);
      const jitter = clamp(p.startupContourJitter ?? 0.0, 0, 0.15);
      const pattern = DEFENDER_STARTUP_DISTORTO;
      const direction = p.startupContourDirection === "up" ? "up" : "down";
      const quantizeSteps = clamp(Math.round(p.startupContourQuantize ?? 0), 0, 32);
      const minV = 1;
      const maxV = 80;
      const baseA = baseRateHz * (1 - spread * 0.5);
      const baseB = baseRateHz * (1 + spread * 0.5);
      const baseFilter = clamp(p.filterCutoff, 240, 12000);
      const baseQ = clamp(p.filterQ, 0.2, 12);
      let monotonicNorm = direction === "down" ? 0 : 1;

      oscA.frequency.cancelScheduledValues(t);
      oscB.frequency.cancelScheduledValues(t);
      oscSub.frequency.cancelScheduledValues(t);
      filter.frequency.cancelScheduledValues(t);
      filter.Q.cancelScheduledValues(t);
      edgeGain.gain.cancelScheduledValues(t);

      for (let i = 0; i < pattern.length; i++) {
        const x = i / Math.max(1, pattern.length - 1);
        const ti = t + x * total;
        const rawPeriodNorm = clamp((pattern[i] - minV) / (maxV - minV), 0, 1);
        if (direction === "down") monotonicNorm = Math.max(monotonicNorm, rawPeriodNorm);
        else monotonicNorm = Math.min(monotonicNorm, rawPeriodNorm);
        let periodNorm = monotonicNorm;
        if (quantizeSteps >= 2) {
          periodNorm = Math.round(periodNorm * (quantizeSteps - 1)) / (quantizeSteps - 1);
        }
        const pitchMul = lerp(0.92, 1.14, periodNorm);
        const brightnessMul = lerp(0.95, 1.28, periodNorm);
        const qMul = lerp(0.85, 1.15, periodNorm);
        const edgeAdd = periodNorm * 0.08;
        const j = 1 + (Math.random() * 2 - 1) * jitter;

        const fa = clamp(baseA * (1 + (pitchMul - 1) * pitchDepth) * j, 50, 8000);
        const fb = clamp(baseB * (1 + (pitchMul - 1) * pitchDepth) * j, 50, 8000);
        const fs = clamp(baseRateHz * 0.5 * (1 + (pitchMul - 1) * pitchDepth * 0.45), 25, 4000);
        const fcut = clamp(baseFilter * (1 + (brightnessMul - 1) * timbreDepth), 2500, 16000);
        const fq = clamp(baseQ * qMul, 0.2, 14);
        const edgeVal = clamp(p.edge + edgeAdd * timbreDepth, 0, 1);

        oscA.frequency.linearRampToValueAtTime(fa, ti);
        if (!isSingle) {
          oscB.frequency.linearRampToValueAtTime(fb, ti);
          oscSub.frequency.linearRampToValueAtTime(fs, ti);
        }
        filter.frequency.linearRampToValueAtTime(fcut, ti);
        filter.Q.linearRampToValueAtTime(fq, ti);
        edgeGain.gain.linearRampToValueAtTime(edgeVal, ti);
      }
    }

    function triggerSpatialOneShot(totalSec, t) {
      oneShotSpatial.active = true;
      oneShotSpatial.t0 = t;
      oneShotSpatial.dur = clamp(totalSec, 0.08, 8.0);
      oneShotSpatial.dir = Math.random() < 0.5 ? -1 : 1;
    }

    function triggerTextureOneShot(p, t) {
      const ep = effectiveTextureEndpoints(p);
      const a = ep.a / 1000;
      const s = clamp(ep.s - ep.a, 0, ENV_TOTAL_MS) / 1000;
      const d = clamp(ep.d - ep.s, 0, ENV_TOTAL_MS) / 1000;
      applyOneShotEnv(voiceOut, t, a, s, d, 1);
      triggerSpatialOneShot(ep.d / 1000, t);
      textureGateUntil = t + a + s + d;
      textureOneShotCooldownUntil = t + (ep.d / 1000) * 0.8 + 0.04;
    }

    function triggerBassOneShot(p, t) {
      const ep = effectiveBassEndpoints(p);
      const a = ep.a / 1000;
      const s = clamp(ep.s - ep.a, 0, ENV_TOTAL_MS) / 1000;
      const d = clamp(ep.d - ep.s, 0, ENV_TOTAL_MS) / 1000;
      applyOneShotEnv(voiceOut, t, a, s, d, 1);
      triggerSpatialOneShot(ep.d / 1000, t);
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
      triggerSpatialOneShot(ep.d / 1000, t);
    }

    function apply(p, muted, width, basePan, opts = {}) {
      const forceNoiseTrigger = !!opts.forceNoiseTrigger;
      const forceTextureTrigger = !!opts.forceTextureTrigger;
      const forceBassTrigger = !!opts.forceBassTrigger;
      const forceReplay = !!opts.forceReplay;
      const t = ctx.currentTime;
      const isBass = p.mode === "bass";
      const isNoise = p.mode === "noise";
      const isPresetStartup = p.presetEngine === "defender-startup";
      const isPresetSmartbomb = p.presetEngine === "defender-smartbomb";
      const isPresetEngine = isPresetStartup || isPresetSmartbomb;
      const isTexture = !isBass && !isNoise && !isPresetEngine;
      const engineOn = !!p.engineEnabled;
      const clockRate = clamp(p.clockRate ?? 3.0, 0.2, 20);
      const gateDepth = clamp01(p.gateDepth ?? 0);
      const stepAmount = clamp01(p.stepAmount ?? 0);
      const delayMix = clamp01(p.delayMix ?? 0);
      const delayTime = clamp(p.delayTime ?? 0.12, 0.02, 0.6);
      const feedback = clamp(p.feedback ?? 0, 0, 0.95);
      const textureGain = clamp(p.gain, 0, 1.5);
      const bassGainValue = clamp(p.bassVolume ?? 1.0, 0, 1.5);
      const noiseGainValue = clamp(p.gain, 0, 1.5);
      const textureVolumeValue = clamp(p.textureVolume ?? 1.0, 0, 1.5);
      const noiseVolumeValue = clamp(p.noiseVolume ?? 1.0, 0, 1.5);
      const presetLevel = clamp((p.textureVolume ?? 1.0) * (p.gain ?? 0.15) * 2.2, 0, 2.0);

      if (!engineOn) {
        gateBase.offset.setTargetAtTime(1.0, t, 0.04);
        gateLfoGain.gain.setTargetAtTime(0.0, t, 0.04);
        engineDry.gain.setTargetAtTime(1.0, t, 0.06);
        engineWet.gain.setTargetAtTime(0.0, t, 0.06);
        engineDelayFb.gain.setTargetAtTime(0.0, t, 0.06);
      } else {
        const base = clamp(1.0 - gateDepth * 0.5, 0, 1.2);
        const mod = gateDepth * 0.5;
        gateLfo.frequency.setTargetAtTime(clockRate, t, 0.15);
        gateBase.offset.setTargetAtTime(base, t, 0.08);
        gateLfoGain.gain.setTargetAtTime(mod, t, 0.08);
        engineDelay.delayTime.setTargetAtTime(delayTime, t, 0.08);
        engineDelayFb.gain.setTargetAtTime(feedback, t, 0.08);
        engineDry.gain.setTargetAtTime(1.0 - delayMix, t, 0.08);
        engineWet.gain.setTargetAtTime(delayMix, t, 0.08);

        if (stepAmount > 0) {
          if (!nextStepAt || t >= nextStepAt) {
            const stepPeriod = 1 / clockRate;
            nextStepAt = t + stepPeriod;
            const stepDelta = (Math.random() * 2 - 1) * stepAmount * 0.35;
            gateBase.offset.setTargetAtTime(clamp(base + stepDelta, 0, 1.25), t, 0.02);
          }
        } else {
          nextStepAt = 0;
        }
      }
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
      texturePostGain.gain.setTargetAtTime(isTexture ? textureVolumeValue : 0, t, 0.04);
      noisePostGain.gain.setTargetAtTime(isNoise ? noiseVolumeValue : 0, t, 0.04);
      panner.pan.setTargetAtTime(clamp(-basePan * width, -1, 1), t, 0.06);

      const mainTarget = isBass || isNoise ? 0 : 1;
      mainGain.gain.setTargetAtTime(mainTarget, t, 0.05);

      if (isBass) {
        bassGain.gain.setTargetAtTime(1.0, t, 0.08);

        bassOsc.frequency.setTargetAtTime(clamp(p.bassHz, 30, 160), t, 0.08);
        bassLP.frequency.setTargetAtTime(clamp(p.bassLP, 60, 800), t, 0.08);
        bassLP.Q.setTargetAtTime(clamp(p.bassRes, 0.2, 8), t, 0.08);
        bassDrive.setAmount(clamp01(p.bassDrive));
        bassPostGain.gain.setTargetAtTime(bassGainValue, t, 0.08);

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
        bassPostGain.gain.setTargetAtTime(0.0, t, 0.05);
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
            scheduleDefenderStartupContour(p, t, isSingle, spread, base);
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

      if (isPresetEngine) {
        mainGain.gain.setTargetAtTime(0, t, 0.03);
        bassGain.gain.setTargetAtTime(0, t, 0.03);
        bassPostGain.gain.setTargetAtTime(0, t, 0.03);
        noisePostGain.gain.setTargetAtTime(0, t, 0.03);
        texturePostGain.gain.setTargetAtTime(0, t, 0.03);
        presetHP.frequency.setTargetAtTime(90, t, 0.04);
        presetLP.frequency.setTargetAtTime(10000, t, 0.04);
        presetGain.gain.setTargetAtTime(0, t, 0.02);
        voiceOut.gain.setTargetAtTime(muted ? 0 : 1, t, 0.02);

        if (forceReplay && !muted) {
          if (isPresetSmartbomb) triggerPresetSmartbomb(p, t, presetLevel);
          else triggerPresetStartup(p, t, presetLevel);
        } else if (forceTextureTrigger && !muted) {
          if (isPresetSmartbomb) triggerPresetSmartbomb(p, t, presetLevel);
          else triggerPresetStartup(p, t, presetLevel);
        } else if (muted || t >= presetGateUntil) {
          presetGain.gain.setTargetAtTime(0, t, 0.03);
        }
      } else {
        presetGain.gain.setTargetAtTime(0, t, 0.04);
        presetGateUntil = 0;
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

      const isSustainMode = (
        (isTexture && p.textureBehavior === "sustain") ||
        (isBass && p.bassBehavior === "sustain") ||
        (isNoise && p.noiseBehavior === "sustain")
      ) && !muted;
      if (oneShotSpatial.active && t >= oneShotSpatial.t0 + oneShotSpatial.dur) {
        oneShotSpatial.active = false;
      }
      const oneShotProgress = oneShotSpatial.active
        ? clamp01((t - oneShotSpatial.t0) / Math.max(0.001, oneShotSpatial.dur))
        : -1;

      applySpatialization(
        state.globalSpatialize,
        muted,
        clamp(-basePan * width, -1, 1),
        isSustainMode,
        oneShotProgress,
        oneShotSpatial.dir
      );
    }

    function rerollSpatialMap(profile = null) {
      if (Array.isArray(profile) && profile.length === spatialBands.length) {
        spatialBands.forEach((b, i) => {
          const src = profile[i];
          b.panNorm = clamp(src.panNorm, -1, 1);
          b.gainNorm = clamp(src.gainNorm, 0, 1);
        });
        return;
      }
      spatialBands.forEach((b) => {
        const fNorm = clamp((Math.log(b.fc) - Math.log(SPATIAL_MIN)) / (Math.log(SPATIAL_MAX) - Math.log(SPATIAL_MIN)), 0, 1);
        const maxPan = lerp(0.35, 1.0, fNorm);
        b.panNorm = (Math.random() * 2 - 1) * maxPan;
        b.gainNorm = lerp(0.14, 0.34, Math.random());
      });
    }
    rerollSpatialMap();

    function applySpatialization(amount, muted, panBias = 0, sustainOn = false, oneShotProgress = -1, oneShotDir = 1) {
      const t = ctx.currentTime;
      const amt = clamp01(amount);
      if (muted || amt <= 0) {
        spatialBands.forEach((b) => b.g.gain.setTargetAtTime(0, t, 0.06));
        spatialDry.gain.setTargetAtTime(1.0, t, 0.06);
        return;
      }
      const hasOneShot = oneShotProgress >= 0;
      const sustainPhase = t * sustainSpatialRate * Math.PI * 2 + sustainSpatialPhase;
      const sustainLfoA = Math.sin(sustainPhase);
      const sustainLfoB = Math.sin(sustainPhase * 0.53 + 1.9);
      const sustainPanWobble = sustainOn ? sustainLfoA * 0.12 * sustainSpatialDepth : 0;
      const sustainSpread = sustainOn ? lerp(0.86, 1.08, 0.5 + 0.5 * sustainLfoB) : 1.0;
      const sustainGainMul = sustainOn ? lerp(0.88, 1.12, 0.5 + 0.5 * Math.sin(sustainPhase * 0.37 + 0.5)) : 1.0;

      let shotSpread = 1.0;
      let shotPanGlide = 0.0;
      let shotGainMul = 1.0;
      if (hasOneShot) {
        const pTri = oneShotProgress < 0.5 ? oneShotProgress / 0.5 : (1 - oneShotProgress) / 0.5;
        shotSpread = lerp(0.42, 1.55, clamp01(pTri));
        shotPanGlide = oneShotDir * lerp(0.30, 0.02, oneShotProgress);
        shotGainMul = lerp(1.22, 0.72, oneShotProgress);
      }

      const dryBase = hasOneShot ? lerp(1.0, 0.18, amt) : lerp(1.0, 0.35, amt);
      const dryLevel = clamp(dryBase * (sustainOn ? 0.92 : 1.0), 0, 1);
      spatialDry.gain.setTargetAtTime(dryLevel, t, 0.08);

      spatialBands.forEach((b) => {
        const bandNorm = b.idx / Math.max(1, spatialBands.length - 1);
        const bandShape = (bandNorm - 0.5) * 2;
        const panMotion = (sustainPanWobble + shotPanGlide * bandShape * 0.75) * amt;
        const pan = clamp(b.panNorm * amt * sustainSpread * shotSpread + panBias * 0.5 + panMotion, -1, 1);
        const gain = clamp(b.gainNorm * amt * sustainGainMul * shotGainMul, 0, 1.5);
        b.g.gain.setTargetAtTime(gain, t, 0.08);
        b.pan.pan.setTargetAtTime(pan, t, 0.08);
      });
    }

    function auditionCommand(cmd, p, level = 1.0) {
      triggerPresetCommand(cmd & 0xff, p, ctx.currentTime, level);
    }

    return { apply, rerollSpatialMap, auditionCommand };
  }

  function initVoices() {
    const noiseBuf = makeNoiseBuffer(state.ctx);
    state.voices = [];
    for (let i = 0; i < 5; i++) {
      state.voices.push(createVoice(state.ctx, state.master, noiseBuf));
      const p = state.voiceParams[i] || defaults();
      ensureParamLocks(i);
      if (p.engineEnabled == null) p.engineEnabled = true;
      if (p.clockRate == null) p.clockRate = 4.0;
      if (p.gateDepth == null) p.gateDepth = 0.35;
      if (p.stepAmount == null) p.stepAmount = 0.3;
      if (p.delayMix == null) p.delayMix = 0.22;
      if (p.delayTime == null) p.delayTime = 0.14;
      if (p.feedback == null) p.feedback = 0.32;
      if (p.presetStartupVariant == null) p.presetStartupVariant = "stdv";
      if (p.gain == null) p.gain = 0.15;
      if (p.textureVolume == null) p.textureVolume = 1.0;
      if (p.noiseVolume == null) p.noiseVolume = 1.0;
      if (p.bassVolume == null) p.bassVolume = 1.0;
      if (p.stereoWidth == null) p.stereoWidth = 0.5;
      if (p.textureBehavior == null) p.textureBehavior = "sustain";
      if (p.textureAms == null) p.textureAms = 240;
      if (p.textureSms == null) p.textureSms = 1900;
      if (p.textureDms == null) p.textureDms = 4300;
      if (p.bassBehavior == null) p.bassBehavior = "sustain";
      if (p.bassAms == null) p.bassAms = 260;
      if (p.bassSms == null) p.bassSms = 2100;
      if (p.bassDms == null) p.bassDms = 4600;
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
      applyDefaultParamLocks(i);
      if (!state.activeTracks[i]) state.muted[i] = true;
      applyVoice(i);
    }
    rerollGlobalSpatialization();
  }

  function makeDefaultVoice() {
    const p = defaults();
    p.gain = 0.15;
    p.textureVolume = 1.0;
    p.noiseVolume = 1.0;
    p.bassVolume = 1.0;
    p.stereoWidth = 0.5;
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

  function rerollGlobalSpatialization() {
    const profile = SPATIAL_CENTERS.map((fc) => {
      const fNorm = clamp((Math.log(fc) - Math.log(SPATIAL_MIN)) / (Math.log(SPATIAL_MAX) - Math.log(SPATIAL_MIN)), 0, 1);
      return {
        panNorm: (Math.random() * 2 - 1) * lerp(0.35, 1.0, fNorm),
        gainNorm: lerp(0.14, 0.34, Math.random()),
      };
    });
    for (let i = 0; i < state.voices.length; i++) {
      if (!state.activeTracks[i]) continue;
      const voice = state.voices[i];
      if (!voice || !voice.rerollSpatialMap) continue;
      voice.rerollSpatialMap(profile);
    }
    applyAllVoices();
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
          p.gain = 0.15;
          p.textureVolume = 1.0;
          p.noiseVolume = 1.0;
          p.bassVolume = 1.0;
          p.stereoWidth = 0.5;
          normalizeTextureEnvelope(p);
          normalizeBassEnvelope(p);
          normalizeNoiseEnvelope(p);
          state.voiceParams[i] = p;
          state.paramLocks[i] = {};
          applyDefaultParamLocks(i);
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
      let disabled = state.active == null || effectiveMuted(state.active);
      if (p.presetEngine === "defender-startup" && key === "presetStepMs" && p.presetRomTiming) {
        disabled = true;
      }
      input.disabled = disabled;
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
    if (key === "presetStartupVariant") {
      if (value === "stdv") return "STDV (start-distorto)";
      if (value === "st2") return "ST2";
      if (value === "st1st2") return "ST1+ST2";
      return "ST1";
    }
    if (key === "presetRomTiming") return value ? "On" : "Off";
    if (key === "presetCpuHz") return `${Math.round(value)} Hz`;
    if (key === "presetStepMs") return `${value.toFixed(1)} ms`;
    if (key === "presetEchoes") return `${Math.round(value)}`;
    if (key === "presetEchoDelayMs") return `${value.toFixed(1)} ms`;
    if (key === "presetEchoDecay") return value.toFixed(2);
    if (key === "presetCabinet") return value ? "On" : "Off";
    if (key === "presetBits") return `${Math.round(value)} bit`;
    if (key === "presetHPF") return `${Math.round(value)} Hz`;
    if (key === "presetLPF") return `${Math.round(value)} Hz`;
    if (key === "engineEnabled") return value ? "On" : "Off";
    if (key === "clockRate") return `${value.toFixed(2)} Hz`;
    if (key === "gateDepth") return value.toFixed(2);
    if (key === "stepAmount") return value.toFixed(2);
    if (key === "delayMix") return value.toFixed(2);
    if (key === "delayTime") return `${value.toFixed(3)} s`;
    if (key === "feedback") return value.toFixed(2);
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
    if (key === "noiseVolume") return value.toFixed(2);
    if (key === "bassVolume") return value.toFixed(2);
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
    if (key === "textureVolume") return value.toFixed(2);
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
        key === "engineEnabled" ||
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
    const p = state.voiceParams[state.active] || {};
    const isPresetStartup = p.presetEngine === "defender-startup";
    const isPresetSmartbomb = p.presetEngine === "defender-smartbomb";
    const isPresetEngine = isPresetStartup || isPresetSmartbomb;
    if (isPresetEngine) {
      const allowed = isPresetStartup
        ? new Set([
            "mode",
            "presetStartupVariant",
            "presetRomTiming",
            "presetCpuHz",
            "presetStepMs",
            "presetEchoes",
            "presetEchoDelayMs",
            "presetEchoDecay",
            "presetCabinet",
            "presetBits",
            "presetHPF",
            "presetLPF",
            "stereoWidth",
            "gain",
            "textureVolume",
          ])
        : new Set([
            "mode",
            "presetBaseHz",
            "presetStepMs",
            "presetEchoes",
            "presetEchoDelayMs",
            "presetEchoDecay",
            "presetCabinet",
            "presetBits",
            "presetHPF",
            "presetLPF",
            "stereoWidth",
            "gain",
            "textureVolume",
          ]);
      rows.forEach((row) => {
        const input = row.querySelector("[data-param]");
        const key = input && input.dataset ? input.dataset.param : "";
        row.style.display = allowed.has(key) ? "" : "none";
      });
      if (texturePlayBtn) texturePlayBtn.style.display = "none";
      if (bassPlayBtn) bassPlayBtn.style.display = "none";
      if (noisePlayBtn) noisePlayBtn.style.display = "none";
      return;
    }
    rows.forEach((row) => {
      const m = row.dataset.mode;
      const showByMode = m === "all" || m === mode;
      const hideInNoise = row.dataset.hideNoise === "1" && mode === "noise";
      const hideInBass = row.dataset.hideBass === "1" && mode === "bass";
      const show = showByMode && !hideInNoise && !hideInBass;
      row.style.display = show ? "" : "none";
    });
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
    const mode = randomizeModeSelect ? randomizeModeSelect.value : "voices";
    if (mode === "presets") {
      applyPresetFromSelection();
      await replayAllVoices();
      return;
    }
    const randomizeConfig = getRandomizeConfig();
    for (let i = 0; i < state.voiceParams.length; i++) {
      if (!state.activeTracks[i]) continue;
      if (state.frozen[i]) continue;
      const p = state.voiceParams[i] || defaults();
      const prev = Object.assign({}, p);
      const keep = {
        gain: p.gain ?? 0.15,
        textureVolume: p.textureVolume ?? 1.0,
        noiseVolume: p.noiseVolume ?? 1.0,
        bassVolume: p.bassVolume ?? 1.0,
        stereoWidth: p.stereoWidth ?? 0.5
      };
      randomizeVoice(p, randomizeConfig);
      const locks = state.paramLocks[i] || {};
      Object.keys(locks).forEach((key) => {
        if (!locks[key]) return;
        if (Object.prototype.hasOwnProperty.call(prev, key)) p[key] = prev[key];
      });
      p.gain = keep.gain;
      p.textureVolume = keep.textureVolume;
      p.noiseVolume = keep.noiseVolume;
      p.bassVolume = keep.bassVolume;
      p.stereoWidth = keep.stereoWidth;
      state.voiceParams[i] = p;
    }
    rerollGlobalSpatialization();
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

  function updateAuditionHexReadout() {
    if (!auditionCommandHex) return;
    const cmd = clamp(parseHexOrDec(auditionCommandSelect ? auditionCommandSelect.value : "0x02", 0x02), 0, 0xff);
    auditionCommandHex.textContent = `0x${cmd.toString(16).padStart(2, "0")}`;
  }

  function buildAuditionPresetParams() {
    const p = state.voiceParams[state.active] || makeDefaultVoice();
    return {
      presetRomTiming: p.presetRomTiming !== false,
      presetStrictRomLoop: p.presetStrictRomLoop !== false,
      presetCpuHz: p.presetCpuHz ?? 894886,
      presetBits: p.presetBits ?? 7,
      presetStepMs: p.presetStepMs ?? 34,
      presetBaseHz: p.presetBaseHz ?? 110,
      presetHPF: p.presetHPF ?? 90,
      presetLPF: p.presetLPF ?? 14000,
      presetCabinet: p.presetCabinet === true,
    };
  }

  async function playAuditionCommand() {
    await startAudio();
    const cmd = clamp(parseHexOrDec(auditionCommandSelect ? auditionCommandSelect.value : "0x02", 0x02), 0, 0xff);
    updateAuditionHexReadout();
    const voiceIndex = state.activeTracks[state.active]
      ? state.active
      : state.activeTracks.findIndex(Boolean);
    if (voiceIndex < 0 || !state.voices[voiceIndex] || !state.voices[voiceIndex].auditionCommand) return;
    const params = buildAuditionPresetParams();
    state.voices[voiceIndex].auditionCommand(cmd, params, 1.0);
  }

  function init() {
    state.globalSpatialize = 1.0;
    if (!state.voiceParams.length) {
      for (let i = 0; i < 5; i++) {
        const p = defaults();
        p.gain = 0.15;
        p.textureVolume = 1.0;
        p.noiseVolume = 1.0;
        p.bassVolume = 1.0;
        p.stereoWidth = 0.5;
        normalizeTextureEnvelope(p);
        normalizeBassEnvelope(p);
        normalizeNoiseEnvelope(p);
        state.voiceParams[i] = p;
        ensureParamLocks(i);
        applyDefaultParamLocks(i);
      }
    }
    renderVoices();
    ensureRandomizeLockUI();
    attachControlHandlers();
    syncRandomizeModeUI();
    syncControls();
  }

  if (randomizeModeSelect) {
    randomizeModeSelect.addEventListener("change", () => {
      syncRandomizeModeUI();
      if (randomizeModeSelect.value === "presets") {
        applyPresetFromSelection();
      }
    });
  }
  if (presetFamilySelect) {
    presetFamilySelect.addEventListener("change", () => {
      if (randomizeModeSelect && randomizeModeSelect.value === "presets") {
        applyPresetFromSelection();
      }
    });
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
  if (auditionPlayBtn) auditionPlayBtn.addEventListener("click", playAuditionCommand);
  if (auditionCommandSelect) {
    auditionCommandSelect.addEventListener("change", updateAuditionHexReadout);
    auditionCommandSelect.addEventListener("input", updateAuditionHexReadout);
  }
  if (startOverlay && startBtn) {
    startOverlay.addEventListener("click", startAudio);
    startBtn.addEventListener("click", startAudio);
  }

  init();
  updateAuditionHexReadout();
})();
    function parseOrganTunes(addr) {
      const tunes = [];
      let p = addr;
      let guard = 0;
      while (guard++ < 128) {
        const len = defenderRomByte(rom, p) & 0xff;
        p += 1;
        if (len === 0) break;
        const count = Math.floor(len / 4);
        const entries = [];
        for (let i = 0; i < count; i++) {
          const oscMask = defenderRomByte(rom, p) & 0xff;
          const delay = defenderRomByte(rom, p + 1) & 0xff;
          const dur = ((defenderRomByte(rom, p + 2) & 0xff) << 8) | (defenderRomByte(rom, p + 3) & 0xff);
          entries.push({ oscMask, delay, dur });
          p += 4;
        }
        tunes.push(entries);
      }
      return tunes;
    }
