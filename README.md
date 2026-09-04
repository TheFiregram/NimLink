# NimLink

**Put a price on any link. Pay in NIM. Your wallet is the key.**

NimLink is a Nimiq Pay Mini App for the Nimiq Mini Apps Competition. It turns a private resource into a wallet-gated purchase: a creator sets a NIM price and access limits, shares one public latch URL, and a buyer gets access only after a Nimiq Pay transaction.

![NimLink](public/og.jpg)

**Live:** https://nimlink.vercel.app  
**Repository:** https://github.com/TheFiregram/NimLink

## The problem

A paid Notion, Drive, Figma, or web resource can be sold with a normal payment link, but the buyer can often forward the original destination after paying once.

NimLink keeps the destination on the server. The public latch contains the title, teaser, price, limits, and creator wallet only.

## How NimLink works

```text
Creator
  │
  ├─ paste destination
  ├─ set NIM price
  ├─ set opens + expiry
  └─ share /g/<slug>
          │
          ▼
Buyer opens latch
          │
          ▼
Nimiq Pay confirms NIM payment
          │
          ▼
Server records purchase → buyer wallet
          │
          ▼
Buyer taps Open
          │
          ▼
Server checks wallet + expiry + remaining opens
          │
          ▼
Protected content is fetched server-side
```

The original external destination is never returned by the public gate API. For HTML resources, NimLink fetches the page server-side and renders the protected copy inside the app. The browser therefore does not receive a redirect to the original page.

## Nimiq integration

NimLink uses the official `@nimiq/mini-app-sdk`.

The app uses Nimiq Pay for:

- wallet account discovery with `listAccounts()`
- native NIM payment confirmation with `sendBasicTransaction()`
- wallet-bound identity for purchases and access
- real NIM payments in the Nimiq Pay environment

The browser version has a demo wallet mode so the complete product flow can be tested without Nimiq Pay. The demo mode is never presented as a real blockchain transaction.

## Why NIM is the payment rail

NimLink is intentionally NIM-first for the competition build. There is no RainbowKit, wagmi, or viem dependency in the app.

The payment flow is native Nimiq:

1. Nimiq Pay supplies the connected account.
2. The buyer taps **Pay NIM**.
3. Nimiq Pay shows the native transaction confirmation.
4. The transaction is sent directly to the creator wallet.
5. NimLink records the transaction hash against the buyer wallet.
6. Access is granted only to that wallet.

## Access controls

Each purchase can have:

- a maximum number of opens
- an expiry period
- wallet-bound ownership
- creator pause and refund controls

A forwarded NimLink URL does not transfer the purchase to another wallet. A second wallet must purchase its own access.

## Current content scope

The protected viewer currently supports HTML resources. This is intentional for the hackathon build so the access model can be demonstrated without exposing the source URL through a browser redirect.

PDF and binary file delivery can be added as a streaming proxy in a later version.

## Tech stack

| Layer | Technology |
| --- | --- |
| UI | React 19 + TypeScript |
| Routing | TanStack Router + TanStack Start |
| Styling | Tailwind CSS v4 |
| Wallet | `@nimiq/mini-app-sdk` |
| Database | PostgreSQL / Neon, PGLite preview |
| Validation | Zod |
| Hosting | Vercel |

## Project structure

```text
src/
├── components/
│   ├── create-form.tsx       # NIM latch creation
│   ├── paperclip.tsx         # NimLink brand mark
│   └── shell.tsx             # App shell
├── lib/
│   ├── nimiq.ts              # Nimiq Pay SDK wrapper
│   ├── wallet-context.tsx    # Real wallet + browser demo wallet
│   └── server/
│       └── gates.ts          # Purchases, access checks, protected viewer
├── routes/
│   ├── index.tsx             # Create latch
│   ├── g.$slug.tsx           # Public latch + protected viewer
│   ├── me.tsx                # Creator and buyer history
│   └── unlock.starter.tsx    # Demo resource
└── styles.css
```

## Run locally

```bash
npm install
npm run dev
```

For a real Nimiq Pay test, open the app inside Nimiq Pay and use a testnet wallet. The Nimiq developer documentation provides the Mini App SDK setup and testnet flow.

## Production

The Vercel deployment uses PostgreSQL for persistent latches and purchases. Set `DATABASE_URL` in the Vercel project environment before creating production latches.

## Competition pitch

**Put a price on any link. Pay in NIM. Your wallet is the key.**

NimLink gives NIM a practical commerce use case: creators can sell access to digital resources without exposing the source URL on the public page, and buyers carry their access with their Nimiq wallet instead of an account or password.

## License

MIT
