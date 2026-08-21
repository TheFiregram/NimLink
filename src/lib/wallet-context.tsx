import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  PREVIEW_WALLETS,
  STORAGE_KEY,
  type PreviewRole,
} from "@/lib/wallets";

type WalletContextValue = {
  address: string;
  role: PreviewRole;
  isPayHost: boolean;
  setRole: (role: PreviewRole) => void;
  ready: boolean;
};

const WalletContext = createContext<WalletContextValue | null>(null);

function detectPayHost() {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as Window & { nimiqPay?: unknown }).nimiqPay ||
      (window as Window & { nimiq?: unknown }).nimiq,
  );
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<PreviewRole>("creator");
  const [ready, setReady] = useState(false);
  const [isPayHost, setIsPayHost] = useState(false);

  useEffect(() => {
    const hosted = detectPayHost();
    setIsPayHost(hosted);
    if (!hosted) {
      const saved = window.localStorage.getItem(STORAGE_KEY) as PreviewRole | null;
      if (saved && saved in PREVIEW_WALLETS) setRoleState(saved);
    }
    setReady(true);
  }, []);

  const setRole = useCallback((next: PreviewRole) => {
    setRoleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo<WalletContextValue>(
    () => ({
      address: PREVIEW_WALLETS[role].address,
      role,
      isPayHost,
      setRole,
      ready,
    }),
    [role, isPayHost, setRole, ready],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
