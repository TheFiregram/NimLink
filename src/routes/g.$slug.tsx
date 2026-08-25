import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { Check, Copy, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getAccess,
  getGate,
  listSales,
  openGate,
  pauseGate,
  payGate,
  refundPurchase,
  type AccessState,
  type PublicGate,
} from "@/lib/server/gates";
import { useWallet } from "@/lib/wallet-context";
import { formatPrice, maskWallet } from "@/lib/utils";
import { PREVIEW_WALLETS } from "@/lib/wallets";

export const Route = createFileRoute("/g/$slug")({
  loader: async ({ params }) => {
    const gate = await getGate({ data: { slug: params.slug } });
    if (!gate) throw notFound();
    return { gate };
  },
  notFoundComponent: () => (
    <div className="space-y-3 py-16 text-center">
      <h1 className="font-display text-3xl">No latch here</h1>
      <p className="text-muted">That link is dead or was never created.</p>
      <Button asChild variant="secondary">
        <Link to="/">Back</Link>
      </Button>
    </div>
  ),
  component: GatePage,
});

function GatePage() {
  const { gate: initial } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { address, role, setRole } = useWallet();
  const [gate, setGate] = useState<PublicGate>(initial);
  const [access, setAccess] = useState<AccessState | null>(null);
  const [sales, setSales] = useState<
    Array<{
      id: string;
      buyerWallet: string;
      amount: string;
      currency: string;
      createdAt: string;
      refunded: boolean;
      opens: number;
    }>
  >([]);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const isCreator = address === gate.creatorWallet;

  async function refresh() {
    const [nextGate, nextAccess] = await Promise.all([
      getGate({ data: { slug, countView: false } }),
      getAccess({ data: { slug, wallet: address } }),
    ]);
    if (nextGate) setGate(nextGate);
    setAccess(nextAccess);
    if (address === (nextGate ?? gate).creatorWallet) {
      try {
        const rows = await listSales({ data: { slug, wallet: address } });
        setSales(rows);
      } catch {
        setSales([]);
      }
    } else {
      setSales([]);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, slug]);

  async function copyLink() {
    const url = `${window.location.origin}/g/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied.");
    setTimeout(() => setCopied(false), 1600);
  }

  async function confirmPay() {
    setBusy(true);
    try {
      await payGate({ data: { slug, buyerWallet: address } });
      toast.success("Paid. Your wallet is now the key.");
      setPayOpen(false);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onOpen() {
    setBusy(true);
    try {
      const result = await openGate({ data: { slug, buyerWallet: address } });
      await refresh();
      if (result.url.startsWith("/")) {
        window.location.assign(result.url);
      } else {
        window.open(result.url, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not open.");
    } finally {
      setBusy(false);
    }
  }

  async function onPause(paused: boolean) {
    setBusy(true);
    try {
      await pauseGate({ data: { slug, wallet: address, paused } });
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update.");
    } finally {
      setBusy(false);
    }
  }

  async function onRefund(purchaseId: string) {
    setBusy(true);
    try {
      await refundPurchase({ data: { purchaseId, wallet: address } });
      toast.success("Refunded. Access revoked.");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Refund failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[var(--radius-xl)] bg-surface p-6 shadow-[var(--shadow-border)] sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            {gate.paused ? "Paused" : "Locked link"}
          </p>
          <span className="font-mono text-[11px] text-subtle">{slug}</span>
        </div>
        <h1 className="mt-4 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
          {gate.title}
        </h1>
        {gate.preview ? (
          <p className="mt-3 max-w-prose text-base leading-relaxed text-muted">
            {gate.preview}
          </p>
        ) : null}

        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Meta
            label="Price"
            value={formatPrice(gate.priceAmount, gate.priceCurrency)}
            accent
          />
          <Meta label="Opens" value={`${gate.accessOpens} / ${gate.accessDays}d`} />
          <Meta label="Sales" value={String(gate.saleCount)} />
          <Meta label="Creator" value={maskWallet(gate.creatorWallet)} />
        </dl>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          {isCreator ? (
            <>
              <Button onClick={copyLink} className="flex-1" size="lg">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copied" : "Copy link"}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                disabled={busy}
                onClick={() => onPause(!gate.paused)}
              >
                {gate.paused ? "Resume" : "Pause"}
              </Button>
            </>
          ) : access?.canOpen ? (
            <Button onClick={onOpen} disabled={busy} size="lg" className="flex-1">
              <Unlock className="size-4" />
              Open · {access.remainingOpens} left
            </Button>
          ) : access?.purchased && access.reason === "opens_exhausted" ? (
            <Button disabled size="lg" className="flex-1" variant="secondary">
              Opens used up
            </Button>
          ) : access?.purchased && access.reason === "expired" ? (
            <Button disabled size="lg" className="flex-1" variant="secondary">
              Access expired
            </Button>
          ) : access?.refunded ? (
            <Button disabled size="lg" className="flex-1" variant="secondary">
              Refunded
            </Button>
          ) : gate.paused ? (
            <Button disabled size="lg" className="flex-1" variant="secondary">
              Paused by creator
            </Button>
          ) : (
            <Button
              onClick={() => setPayOpen(true)}
              size="lg"
              className="flex-1"
            >
              <Lock className="size-4" />
              Pay {formatPrice(gate.priceAmount, gate.priceCurrency)}
            </Button>
          )}
        </div>

        {!isCreator && !access?.purchased && role === "creator" && (
          <p className="mt-4 text-sm text-muted">
            You are on the Creator wallet.{" "}
            <button
              type="button"
              className="underline decoration-border-strong underline-offset-4 hover:text-fg"
              onClick={() => setRole("buyer")}
            >
              Switch to Buyer
            </button>{" "}
            to pay this latch.
          </p>
        )}
      </div>

      {isCreator && (
        <section className="space-y-3">
          <h2 className="font-display text-xl tracking-tight">Sales</h2>
          {sales.length === 0 ? (
            <p className="text-sm text-muted">
              No sales yet. Share the link, then switch to Buyer to try it yourself.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-[var(--radius-lg)] bg-surface shadow-[var(--shadow-border)]">
              {sales.map((sale) => (
                <li
                  key={sale.id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
                >
                  <span className="font-mono text-xs text-muted">
                    {maskWallet(sale.buyerWallet)}
                  </span>
                  <span className="text-muted">
                    {sale.amount} {sale.currency}
                  </span>
                  <span className="text-subtle">{sale.opens} opens</span>
                  {sale.refunded ? (
                    <span className="ml-auto text-xs uppercase tracking-wider text-danger">
                      Refunded
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onRefund(sale.id)}
                      className="ml-auto text-xs text-muted underline-offset-4 hover:text-fg hover:underline"
                    >
                      Refund
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {payOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-bg/70 p-4 sm:items-center"
          onClick={() => setPayOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-[var(--radius-xl)] bg-surface p-5 shadow-[var(--shadow-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Confirm in Nimiq Pay
            </p>
            <h2 className="mt-2 font-display text-2xl tracking-tight">
              {formatPrice(gate.priceAmount, gate.priceCurrency)}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Pays {maskWallet(gate.creatorWallet)} for “{gate.title}”. Access is
              bound to {maskWallet(address)} · {gate.accessOpens} opens ·{" "}
              {gate.accessDays} days.
            </p>
            {role === "guest" && (
              <p className="mt-3 text-sm text-muted">
                Guest has no prior purchase — this is a clean first buy.
              </p>
            )}
            {address === PREVIEW_WALLETS.creator.address && (
              <p className="mt-3 text-sm text-danger">
                Switch off the Creator wallet or this will be rejected.
              </p>
            )}
            <div className="mt-5 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setPayOpen(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" disabled={busy} onClick={confirmPay}>
                {busy ? "Paying…" : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Meta({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-md)] bg-elevated px-3 py-2.5">
      <dt className="text-[11px] uppercase tracking-[0.14em] text-subtle">{label}</dt>
      <dd className={`mt-1 font-medium tabular-nums ${accent ? "text-accent" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
