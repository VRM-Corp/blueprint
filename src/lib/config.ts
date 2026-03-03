export const CONTACT_TYPES = [
  { id: "instagram", label: "Instagram", icon: "/assets/blueprintappicons/instagram.png", placeholder: "@username" },
  { id: "twitter",   label: "Twitter / X", icon: "/assets/blueprintappicons/x.svg", placeholder: "@handle" },
  { id: "linkedin",  label: "LinkedIn", icon: "/assets/blueprintappicons/linkedin.png", placeholder: "linkedin.com/in/..." },
  { id: "email",     label: "Email", icon: "/assets/blueprintappicons/gmail.svg", placeholder: "your@email.com" },
] as const;

export type ContactTypeId = (typeof CONTACT_TYPES)[number]["id"];

export function getContactType(id: string | undefined) {
  if (!id) return undefined;
  return CONTACT_TYPES.find((t) => t.id === id);
}

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
