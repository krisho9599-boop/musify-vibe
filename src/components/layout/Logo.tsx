import { AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl ember-surface shadow-glow">
        <AudioLines className="h-5 w-5" />
      </span>
      {!compact && (
        <span className="font-display text-lg font-extrabold tracking-tight">
          Musify<span className="ember-text">App</span>
        </span>
      )}
    </span>
  );
}
