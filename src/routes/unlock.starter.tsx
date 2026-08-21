import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/unlock/starter")({
  component: StarterKit,
});

function StarterKit() {
  return (
    <article className="space-y-8 pb-8">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-success">
        Unlocked
      </p>
      <h1 className="font-display text-4xl leading-tight tracking-tight">
        Cycle 2 scoring kit
      </h1>
      <p className="max-w-prose text-muted leading-relaxed">
        You paid. This page is the destination the public latch never showed.
        Steal what you need.
      </p>

      <section className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight">40-second demo</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
          <li>Paste a Notion URL. Set 2 USDT. Create.</li>
          <li>Open the latch in a second wallet. Pay. Confirm.</li>
          <li>Open — the page loads. Paste the same latch in a guest wallet. Still locked.</li>
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight">What judges score</h2>
        <ul className="space-y-2 text-sm leading-relaxed text-muted">
          <li>
            <strong className="text-fg">Design · 25</strong> — first impression,
            mobile, 60-second onboarding.
          </li>
          <li>
            <strong className="text-fg">Functionality · 25</strong> — unpaid
            cannot open. Paid can. Refund revokes.
          </li>
          <li>
            <strong className="text-fg">Usefulness · 25</strong> — a primitive
            anyone can use the hour they onboard.
          </li>
          <li>
            <strong className="text-fg">Marketing · 25</strong> — a live purchase
            on Sip & Ship is the demo.
          </li>
          <li>
            <strong className="text-fg">NIM bonus · 5</strong> — support NIM, not
            only USDT.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl tracking-tight">Copy you can steal</h2>
        <blockquote className="rounded-[var(--radius-lg)] bg-surface px-4 py-3 text-sm leading-relaxed text-muted shadow-[var(--shadow-border)]">
          Put a price on any link. They pay in NIM. Their wallet is the key.
          Forwarding the page does nothing.
        </blockquote>
      </section>

      <p className="text-sm text-subtle">
        This destination lives at <code className="font-mono">/unlock/starter</code>.
        The public latch is{" "}
        <Link to="/g/$slug" params={{ slug: "starter" }} className="underline underline-offset-4">
          /g/starter
        </Link>
        .
      </p>
    </article>
  );
}
