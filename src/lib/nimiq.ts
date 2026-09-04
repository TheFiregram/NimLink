import { init, type NimiqProvider } from "@nimiq/mini-app-sdk";

let providerPromise: Promise<NimiqProvider> | null = null;

type NimiqWindow = Window & {
  nimiqPay?: unknown;
  nimiq?: unknown;
};

export function isNimiqPay(): boolean {
  if (typeof window === "undefined") return false;
  const host = window as NimiqWindow;
  return Boolean(host.nimiqPay || host.nimiq);
}

export async function getNimiqProvider(): Promise<NimiqProvider> {
  if (!providerPromise) providerPromise = init();
  return providerPromise;
}

export async function getNimiqAddress(): Promise<string> {
  const provider = await getNimiqProvider();
  const accounts = await provider.listAccounts();
  const address = accounts[0];
  if (!address) throw new Error("No Nimiq Pay account is available.");
  return address;
}

export async function sendNimPayment(recipient: string, nimAmount: string): Promise<string> {
  const provider = await getNimiqProvider();
  const value = Math.round(Number(nimAmount) * 100_000);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Invalid NIM amount.");
  }
  return provider.sendBasicTransaction({ recipient, value });
}
