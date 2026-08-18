import type { ReactNode } from "react";
import { AlertTriangle, MusicIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Section({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="animate-fade-up">
      <div className="mb-4 flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Scroller({ children }: { children: ReactNode }) {
  return (
    <div className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2">
      {children}
    </div>
  );
}

export function ErrorState({
  message = "We couldn't reach the music service.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-10 text-center">
      <AlertTriangle className="h-6 w-6 text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-accent">
        <MusicIcon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
