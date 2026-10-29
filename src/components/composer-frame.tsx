import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The prompt box as a small window: a `● NEW PROJECT` header bar with room for
 * actions on the right, around a PromptComposer flattened by the
 * `composer-frame` styles in globals.css. Used by the landing page and the
 * dashboard.
 */
export const ComposerFrame = ({
  actions,
  className,
  children,
}: {
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) => (
  <div className={cn("composer-frame", className)}>
    {/* No overflow clipping: a picker in the header can drop out of it. */}
    <div className="rounded-lg border border-border bg-card transition-[border-color,box-shadow] duration-200 focus-within:border-brand/50 focus-within:ring-4 focus-within:ring-brand/10">
      <div className="flex h-10 items-center justify-between gap-3 rounded-t-lg border-b border-border bg-muted/40 px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-brand" />
          New project
        </span>
        <span className="flex items-center gap-3">
          <span className="max-lg:hidden">Enter to start</span>
          {actions}
        </span>
      </div>
      {children}
    </div>
  </div>
);
