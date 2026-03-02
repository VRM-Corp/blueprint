export const EVENT_CONFIG = {
  title: "Blueprint",
  venue: "VROOM",

  messageMaxLength: 140,

  assets: {
    logos: [
      { src: "/assets/vroomlogo.svg", alt: "Vroom" },
      { src: "/assets/LORE_Logo-Symbol-Color=Porcelain.svg", alt: "Lore" },
    ],
    starGraphic: "/assets/star-graphic.svg",
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
