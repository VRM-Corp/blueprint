import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LogoStrip from "./LogoStrip";

type PageShellProps = {
  title?: string;
  backHref: string;
  backLabel?: string;
  children: React.ReactNode;
};

export default function PageShell({
  title,
  backHref,
  backLabel = "Back",
  children,
}: PageShellProps) {
  return (
    <div className="interact-page min-h-[100dvh] flex flex-col px-4 pb-6">
      <div className="page-header">
        <Link href={backHref} className="nav-pill">
          <ArrowLeft className="size-4" />
          {backLabel}
        </Link>
        {title && <h1 className="text-white">{title}</h1>}
      </div>
      {children}
      <div className="flex items-center justify-center gap-5 pt-6 mt-auto flex-shrink-0">
        <LogoStrip logoClassName="h-8 sm:h-10" />
      </div>
    </div>
  );
}
