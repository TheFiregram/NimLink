import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, EyeOff, KeyRound, Link2 } from "lucide-react";
import { CreateForm } from "@/components/create-form";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="space-y-14">
      <section className="space-y-5">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          Mini App · Nimiq Pay
        </p>
        <h1 className="max-w-xl font-display text-[2.5rem] leading-[1.1] tracking-[-0.03em] sm:text-5xl">
          Put a price on any link.
        </h1>
        <p className="max-w-lg text-base leading-relaxed text-muted">
          Paste a URL. Set a price in NIM or USDT. Share one link. They pay —
          their wallet is the key. Forwarding the page does nothing.
        </p>
        <Link
          to="/g/$slug"
          params={{ slug: "starter" }}
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-elevated px-4 text-sm text-fg shadow-[var(--shadow-border)] hover:bg-surface"
        >
          Try the demo latch
          <ArrowRight className="size-4" />
        </Link>
      </section>

      <ol className="grid gap-3 sm:grid-cols-3">
        <Step
          icon={<Link2 className="size-4" />}
          n="01"
          title="Paste"
          body="Notion, Drive, Figma, a PDF, a private playlist. The destination never appears on the public page."
        />
        <Step
          icon={<KeyRound className="size-4" />}
          n="02"
          title="Price"
          body="NIM or USDT, paid from Nimiq Pay to you. Nothing sits in escrow. Access flips on confirmation."
        />
        <Step
          icon={<EyeOff className="size-4" />}
          n="03"
          title="Bound"
          body="Only the paying wallet can open it, a few times, for a few days. The server decides — not the browser."
        />
      </ol>

      <section className="rounded-[var(--radius-xl)] bg-surface p-5 shadow-[var(--shadow-border)] sm:p-7">
        <div className="mb-6 space-y-1">
          <h2 className="font-display text-2xl tracking-tight">New latch</h2>
          <p className="text-sm text-muted">
            Live in under a minute. Switch to the Buyer wallet afterwards to pay
            it.
          </p>
        </div>
        <CreateForm />
      </section>
    </div>
  );
}

function Step({
  icon,
  n,
  title,
  body,
}: {
  icon: ReactNode;
  n: string;
  title: string;
  body: string;
}) {
  return (
    <li className="rounded-[var(--radius-lg)] bg-surface p-4 shadow-[var(--shadow-border)]">
      <div className="mb-4 flex items-center justify-between text-muted">
        <span className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] bg-elevated">
          {icon}
        </span>
        <span className="font-mono text-[11px] tracking-widest">{n}</span>
      </div>
      <h3 className="font-display text-lg tracking-tight">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </li>
  );
}
