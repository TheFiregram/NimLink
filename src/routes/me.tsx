import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { listMyGates, listMyPurchases, type PublicGate } from "@/lib/server/gates";
import { useWallet } from "@/lib/wallet-context";
import { formatPrice } from "@/lib/utils";

export const Route = createFileRoute("/me")({ component: MePage });

function MePage() {
  const { address, ready } = useWallet();
  const [gates, setGates] = useState<PublicGate[]>([]);
  const [purchases, setPurchases] = useState<
    Array<{
      id: string;
      slug: string;
      title: string;
      amount: string;
      currency: "NIM" | "USDT";
      createdAt: string;
      refunded: boolean;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      listMyGates({ data: { wallet: address } }),
      listMyPurchases({ data: { wallet: address } }),
    ])
      .then(([g, p]) => {
        if (cancelled) return;
        setGates(g);
        setPurchases(p);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address, ready]);

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="font-display text-3xl tracking-tight">My latches</h1>
        <p className="text-sm text-muted">Created and bought with this wallet.</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
          Created
        </h2>
        {loading ? (
          <p className="text-sm text-subtle">Loading…</p>
        ) : gates.length === 0 ? (
          <p className="text-sm text-muted">
            Nothing yet.{" "}
            <Link to="/" className="underline underline-offset-4">
              Create a latch
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-2">
            {gates.map((g) => (
              <li key={g.id}>
                <Link
                  to="/g/$slug"
                  params={{ slug: g.slug }}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] bg-surface px-4 py-3.5 shadow-[var(--shadow-border)] hover:bg-elevated"
                >
                  <span>
                    <span className="block font-medium">{g.title}</span>
                    <span className="text-xs text-muted">
                      {g.saleCount} sales · {g.paused ? "paused" : "live"}
                    </span>
                  </span>
                  <span className="tabular-nums text-sm text-muted">
                    {formatPrice(g.priceAmount, g.priceCurrency)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
          Bought
        </h2>
        {loading ? (
          <p className="text-sm text-subtle">Loading…</p>
        ) : purchases.length === 0 ? (
          <p className="text-sm text-muted">
            No purchases. Switch to Buyer and open the{" "}
            <Link
              to="/g/$slug"
              params={{ slug: "starter" }}
              className="underline underline-offset-4"
            >
              demo latch
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-2">
            {purchases.map((p) => (
              <li key={p.id}>
                <Link
                  to="/g/$slug"
                  params={{ slug: p.slug }}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] bg-surface px-4 py-3.5 shadow-[var(--shadow-border)] hover:bg-elevated"
                >
                  <span>
                    <span className="block font-medium">{p.title}</span>
                    <span className="text-xs text-muted">
                      {p.refunded ? "Refunded" : "Access granted"}
                    </span>
                  </span>
                  <span className="tabular-nums text-sm text-muted">
                    {formatPrice(p.amount, p.currency)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
