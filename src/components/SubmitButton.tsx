import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  onClick: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  className?: string;
};

export default function SubmitButton({
  onClick,
  disabled,
  isSubmitting,
  className,
}: Props) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isSubmitting}
      className={cn("interact-btn-primary", className)}
    >
      {isSubmitting ? "Sending..." : "Send"}
      {!isSubmitting && <Send className="size-4" />}
    </Button>
  );
}
