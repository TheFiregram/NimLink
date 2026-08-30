import { cn } from "@/lib/utils";

/** Horizontal paperclip mark — the Nimlink icon. */
export function PaperclipMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 671 255"
      className={cn("text-accent", className)}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M231.5 84.5 H453 A41.5 41.5 0 0 1 453 167.5 H93 A74.5 74.5 0 0 1 93 18.5 H543.5 A109 109 0 0 1 543.5 236.5 H223.5"
        stroke="currentColor"
        strokeWidth={37}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Gold paperclip + Nimlink wordmark (Nim + italic link). */
export function NimlinkWordmark({
  className,
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <PaperclipMark className={cn("h-[1.15em] w-auto shrink-0", markClassName)} />
      <span className="font-sans text-[1.05em] font-semibold leading-none tracking-tight">
        Nim
        <span className="font-normal italic text-muted">link</span>
      </span>
    </span>
  );
}
