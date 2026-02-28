export const EVENT_CONFIG = {
  title: "Blueprint",
  venue: "VROOM",

  messageDurationMs: 10_000,
  drawingDurationMs: 15_000,
  messageMaxLength: 140,
  toastDurationMs: 2_000,

  assets: {
    logos: [
      { src: "/assets/vroomlogo.svg", alt: "Vroom" },
      { src: "/assets/LORE_Logo-Symbol-Color=Porcelain.svg", alt: "Lore" },
    ],
    starGraphic: "/assets/Untitled design (5).svg",
  },

  projection: {
    qrSize: 200,
    qrQuietZone: 4,
    qrDuringScale: 0.65,
    cornerInset: 24,
    logoHeight: 40,
    logoPadding: 72,
    titleTopPercent: 0.08,
    titleFontPre: "12vw",
    titleFontDuring: "4vw",
    transitionDuration: 1,
    fadeInDuration: 1.5,
  },
};
