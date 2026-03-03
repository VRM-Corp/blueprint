import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type AvatarProps = {
  url?: string;
  name?: string;
  className?: string;
  iconClassName?: string;
  style?: React.CSSProperties;
};

export default function Avatar({
  url,
  name,
  className,
  iconClassName,
  style,
}: AvatarProps) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className={cn("rounded-full object-cover shrink-0", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center shrink-0",
        className,
      )}
      style={{ background: "var(--glass-10)", ...style }}
    >
      {name ? (
        <span className="text-[10px] font-bold uppercase text-white/50">
          {name[0]}
        </span>
      ) : (
        <User className={cn("size-3.5 text-white/40", iconClassName)} />
      )}
    </div>
  );
}
