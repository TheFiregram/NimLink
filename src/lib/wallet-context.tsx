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
import { getNimiqAddress, isNimiqPay } from "@/lib/nimiq";

type WalletContextValue = {
  address: string;
  role: PreviewRole | "real";
  isPayHost: boolean;
  setRole: (role: PreviewRole) => void;
  ready: boolean;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<PreviewRole | "real">("creator");
  const [address, setAddress] = useState(PREVIEW_WALLETS.creator.address);
  const [ready, setReady] = useState(false);
  const [isPayHost, setIsPayHost] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      const hosted = isNimiqPay();
      if (cancelled) return;
      setIsPayHost(hosted);

      if (hosted) {
        try {
          const realAddress = await getNimiqAddress();
          if (!cancelled) {
            setAddress(realAddress);
            setRoleState("real");
          }
        } catch {
          if (!cancelled) setReady(true);
          return;
        }
      } else {
        const saved = window.localStorage.getItem(STORAGE_KEY) as PreviewRole | null;
        const next = saved && saved in PREVIEW_WALLETS ? saved : "creator";
        setRoleState(next);
        setAddress(PREVIEW_WALLETS[next].address);
      }
      if (!cancelled) setReady(true);
    }

    void connect();
    return () => {
      cancelled = true;
    };
  }, []);

  const setRole = useCallback((next: PreviewRole) => {
    if (isPayHost) return;
    setRoleState(next);
    setAddress(PREVIEW_WALLETS[next].address);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, [isPayHost]);

  const value = useMemo<WalletContextValue>(
    () => ({ address, role, isPayHost, setRole, ready }),
    [address, role, isPayHost, setRole, ready],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
