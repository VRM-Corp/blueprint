import { EVENT_CONFIG } from "@/lib/config";

type Props = {
  logoClassName?: string;
};

export default function LogoStrip({ logoClassName = "h-10" }: Props) {
  return (
    <>
      {EVENT_CONFIG.assets.logos.map((logo) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={logo.src}
          src={logo.src}
          alt={logo.alt}
          className={`opacity-60 ${logoClassName}`}
        />
      ))}
    </>
  );
}
