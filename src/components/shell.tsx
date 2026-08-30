import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { PREVIEW_WALLETS } from "@/lib/wallets";
import { useWallet } from "@/lib/wallet-context";
import { maskWallet, cn } from "@/lib/utils";
import { NimlinkWordmark } from "@/components/paperclip";

export function Shell({ children }: { children: ReactNode }) {
  const { address, role, setRole, isPayHost, ready } = useWallet();

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/" aria-label="Nimlink home" className="text-fg">
            <NimlinkWordmark className="text-[17px]" />
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              to="/me"
              className="rounded-[var(--radius-sm)] px-3 py-2 text-sm text-muted hover:bg-elevated hover:text-fg"
            >
              My latches
            </Link>
            {ready && (
              <span className="hidden rounded-full bg-elevated px-3 py-1.5 font-mono text-[11px] tracking-wide text-muted sm:inline">
                {maskWallet(address)}
              </span>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-32 pt-8 sm:pt-12">
        {children}
      </main>

      {ready && !isPayHost && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2.5">
            <p className="mr-auto hidden text-xs text-subtle sm:block">
              Preview wallets — switch to buy what you just created
            </p>
            <p className="mr-auto text-xs text-subtle sm:hidden">Wallet</p>
            {(Object.keys(PREVIEW_WALLETS) as Array<keyof typeof PREVIEW_WALLETS>).map(
              (id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRole(id)}
                  className={cn(
                    "h-9 rounded-full px-3 text-xs font-medium",
                    role === id
                      ? "bg-accent text-accent-fg"
                      : "bg-elevated text-muted hover:text-fg",
                  )}
                >
                  {PREVIEW_WALLETS[id].label}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
