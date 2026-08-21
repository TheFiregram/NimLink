import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskWallet(address: string) {
  const compact = address.replace(/\s+/g, "");
  if (compact.length < 10) return compact;
  return `${compact.slice(0, 4)} ··· ${compact.slice(-4)}`;
}

export function formatPrice(amount: string, currency: "NIM" | "USDT") {
  return `${amount} ${currency}`;
}

export function newId(prefix: string) {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const body = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${body}`;
}

export function newSlug() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
