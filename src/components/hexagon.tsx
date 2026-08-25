import { cn } from "@/lib/utils";

/** Pointy-top Nimiq hexagon — the brand mark. */
export function HexagonMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("text-accent", className)}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.92 3.00 Q12.00 1.80 14.08 3.00 L18.75 5.70 Q20.83 6.90 20.83 9.30 L20.83 14.70 Q20.83 17.10 18.75 18.30 L14.08 21.00 Q12.00 22.20 9.92 21.00 L5.25 18.30 Q3.17 17.10 3.17 14.70 L3.17 9.30 Q3.17 6.90 5.25 5.70 Z" />
    </svg>
  );
}
