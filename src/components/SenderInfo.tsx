import Avatar from "./Avatar";
import { cn } from "@/lib/utils";

type SenderInfoProps = {
  name: string;
  avatarUrl?: string;
  contactIcon?: string;
  contactHandle?: string;
  className?: string;
};

export default function SenderInfo({
  name,
  avatarUrl,
  contactIcon,
  contactHandle,
  className,
}: SenderInfoProps) {
  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      <Avatar url={avatarUrl} name={name} className="size-6" />
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-semibold text-white/60 leading-none">
          {name}
        </span>
        {contactHandle && (
          <span className="flex items-center gap-1 text-[10px] text-white/30 leading-none">
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
