"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";

import { pickableModels } from "@/features/ai-providers/catalog";
import { envCatalog, platformProviderId } from "@/features/ai-providers/platform";
import { setModel, useStoredAgentModel } from "@/features/conversations/hooks/use-agent-model";
import { cn } from "@/lib/utils";

// Signed out there is no catalog query, so offer the env catalog's models for
// everyone. The pick is saved where the dashboard reads it; a model the admin
// has since removed falls back to the default there.
const CATALOG = envCatalog(platformProviderId());
const MODELS = pickableModels(CATALOG.models, { claimed: false, active: false, countedRunsLeft: 0 });

/** The model chip in the landing prompt box's header. */
export const LandingModelPicker = () => {
  const stored = useStoredAgentModel();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected =
    MODELS.find((model) => !stored?.keyId && model.id === stored?.modelId) ??
    MODELS.find((model) => model.id === CATALOG.defaultModelId) ??
    MODELS[0];

  // Close on an outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!selected) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Model: ${selected.name}`}
        onClick={() => setOpen((value) => !value)}
        className="flex h-6 items-center gap-1.5 rounded border border-border bg-card px-2 text-foreground normal-case tracking-normal transition-colors hover:border-brand/40"
      >
        <span className="size-1.5 rounded-full bg-brand" />
        <span className="font-sans text-[11px] font-medium">{selected.name}</span>
        <ChevronDown className={cn("size-3 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Model"
            // Lenis smooth-scrolls the page; this lets the wheel scroll the list instead.
            data-lenis-prevent
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 z-30 mt-2 max-h-72 w-64 origin-top-right overflow-y-auto overscroll-contain rounded-md border border-border bg-card p-1 normal-case tracking-normal shadow-[0_20px_50px_-20px_rgb(0_0_0/0.3)]"
          >
            {MODELS.map((model) => {
              const active = model.id === selected.id;
              return (
                <li key={model.id} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => {
                      setModel({ modelId: model.id });
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left font-sans text-[12px] transition-colors",
                      active ? "bg-brand/10 text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span className="flex-1 truncate">{model.name}</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                      {model.vendor}
                    </span>
                    <Check className={cn("size-3 text-brand", !active && "invisible")} />
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
