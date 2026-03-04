import Avatar from "./Avatar";
import { cn } from "@/lib/utils";

type SenderInfoProps = {
  name: string;
  avatarUrl?: string;
  contactIcon?: string;
  contactHandle?: string;
  className?: string;
  dark?: boolean;
};

export default function SenderInfo({
  name,
  avatarUrl,
  contactIcon,
  contactHandle,
  className,
  dark,
}: SenderInfoProps) {
  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      <Avatar url={avatarUrl} name={name} className="size-6" />
      <div className="flex flex-col min-w-0">
        <span
          className={cn(
            "text-xs font-semibold leading-none",
            dark ? "text-neutral-700" : "text-white/60"
          )}
        >
          {name}
        </span>
        {contactHandle && (
          <span
            className={cn(
              "flex items-center gap-1 text-[10px] leading-none",
              dark ? "text-neutral-400" : "text-white/30"
            )}
          >
            {contactIcon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={contactIcon} alt="" className="size-3 opacity-50" />
            )}
            {contactHandle}
          </span>
        )}
      </div>
    </div>
  );
}
