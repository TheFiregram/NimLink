export const PREVIEW_WALLETS = {
  creator: {
    id: "creator",
    label: "Creator",
    address: "NQ87LATCHCREATOR00000000000",
  },
  buyer: {
    id: "buyer",
    label: "Buyer",
    address: "NQ88LATCHBUYER000000000000",
  },
  guest: {
    id: "guest",
    label: "Guest",
    address: "NQ89LATCHGUEST000000000000",
  },
} as const;

export type PreviewRole = keyof typeof PREVIEW_WALLETS;

export const STORAGE_KEY = "latch.preview-role";
