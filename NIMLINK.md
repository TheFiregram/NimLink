# Nimlink

**Put a price on any link.** Buyers pay in NIM or USDT — their wallet is the key.

Nimlink is a [Nimiq Pay](https://www.nimiq.com) Mini App built for **Cycle 2 of the Mini Apps Competition**. It turns any URL into a wallet-bound, paywalled latch: the destination stays hidden until someone pays, and forwarding the page does nothing.

| | |
|---|---|
| Live app | [nimlink.vercel.app](https://nimlink.vercel.app) |
| GitHub | [TheFiregram/NimLink](https://github.com/TheFiregram/NimLink) |
| Vercel project | `nimlink` |
| License | MIT (FIREGRAM, 2026) |
| Wordmark | gold paperclip + **Nim***link* |

---

## 1. What it is

Creators paste a private URL (Notion, Drive, Figma, a PDF, a playlist), set a price, and get one public link. That public page shows a title, a teaser, and a price — never the destination.

A buyer pays from Nimiq Pay. Access is bound to **that wallet**:

- Opens are counted on the server.
- Access expires after a number of days.
- A refund revokes the key.
- A guest who is forwarded the latch page still sees a lock.

Nothing sits in escrow. Payment goes to the creator; Nimlink only records the purchase and decides who may open.

The product name in UI is **Nimlink** (gold paperclip, “Nim” upright, “link” italic). The repository and Vercel project stay `NimLink` / `nimlink`.

---

## 2. Why it exists

Cycle 2 scores Mini Apps on design, functionality, usefulness, marketing, plus a NIM bonus. Nimlink is a primitive anyone can use the hour they onboard:

1. Paste a URL. Set 2 USDT (or NIM). Create.
2. Open the latch in a second wallet. Pay. Confirm.
3. Open — the destination loads. Paste the same latch in a guest wallet. Still locked.

That 40-second loop is the Sip & Ship demo. The seeded latch at `/g/starter` (2 USDT, 3 opens, 7 days) unlocks `/unlock/starter` — a one-page scoring kit with the script, the rubric, and copy you can steal.

---

## 3. Brand

### Mark

A horizontal gold paperclip. A paperclip holds pages together; Nimlink holds a price on a link. It is a single rounded stroke: inner loop open on the left, outer loop open on the bottom-left, large round end on the right.

- Icon: [public/logo.svg](public/logo.svg) and [public/logo-mark.png](public/logo-mark.png)
- Favicon: [public/favicon.svg](public/favicon.svg) — gold clip on `#12100a` rounded tile
- Wordmark: gold clip + **Nim** (semibold sans) + *link* (italic, muted)
- Share card: [public/og.jpg](public/og.jpg) (1200×630)

### Palette

| Token | Hex | Use |
|---|---|---|
| Background | `#12100a` | Page, theme-color |
| Surface | `#1a170e` | Cards |
| Elevated | `#241f12` | Chips, inputs |
| Foreground | `#f7f1de` | Titles, “Nim” |
| Muted | `#c4b896` | Body, italic “link” |
| Subtle | `#8a7e5c` | Meta, labels |
| Accent | `#e9b114` | Paperclip, primary buttons, selection |
| Accent on gold | `#1a1400` | Text on accent |
| Border | `#3a3318` | Hairlines |
| Danger | `#c45c4a` | Refund, errors |
| Success | `#7d9a78` | Confirmations |

Gold is sampled from the supplied paperclip (`#E9B114`), in the same family as Nimiq gold (`#EAAA15`).

### Type

- **Figtree** — UI and the wordmark (italic for “link”)
- **Newsreader** — display headings
- **IBM Plex Mono** — slugs, wallets, counters

---

## 4. How a latch works

A **latch** is a paywalled link. Internally the table is still called `gates`.

### Create (Creator wallet)

From the home page:

| Field | Rules |
|---|---|
| Title | 2–80 characters. Public. |
| Hidden URL | `http(s)://…` or an internal path like `/unlock/starter`. Never shown on the public page. |
| Preview line | Optional, max 220 characters. The one sentence buyers see before they pay. |
| Price | Positive number. |
| Currency | `USDT` or `NIM`. |
| Opens | 1–99. How many times the paying wallet may open. |
| Days of access | 1–365. Clock starts at purchase. |

On submit, Nimlink stores the row, mints a short slug, and sends the creator to `/g/{slug}`.

### Public page (`/g/{slug}`)

Everyone sees title, teaser, price, opens/days, sales count, and a masked creator wallet. The destination is not in the HTML.

What the primary button does depends on the **connected wallet**:

| Who | State | Action |
|---|---|---|
| Creator | Live | Copy link, pause / resume, see sales, refund |
| Buyer / guest | Unpaid | Pay {price} |
| Buyer | Paid, opens left | Open · N left |
| Buyer | Opens used up | Disabled |
| Buyer | Access expired | Disabled |
| Buyer | Refunded | Disabled |
| Anyone | Creator paused | Disabled |

### Pay

Confirming payment (Nimiq Pay in the host; a preview confirm in this demo) writes a `purchases` row bound to `buyer_wallet`. The creator cannot buy their own latch. A second pay from the same wallet is a no-op while the first purchase is active.

### Open

The server checks: purchase exists, not refunded, not expired, opens remaining. Then it records an `opens` row and returns the destination.

- Internal paths (`/unlock/starter`) navigate in-app.
- External URLs open in a new tab.

The browser never “unlocks” by itself. Reloading, copying the latch URL, or switching wallet all re-ask the server.

### Pause and refund

Only the creator’s wallet can pause (new buys stop; existing keys still open until they expire or run out) or refund a sale (sets `refunded_at`, decrements `sale_count`, that buyer can no longer open).

---

## 5. Preview wallets

Nimiq Pay injects a host wallet when the Mini App runs inside it. Outside that host — this preview, the Vercel site in a normal browser — Nimlink exposes three **preview wallets** in the bottom bar so the full loop is playable without a real wallet:

| Role | Address | Use |
|---|---|---|
| Creator | `NQ87LATCHCREATOR00000000000` | Owns new latches and the starter latch |
| Buyer | `NQ88LATCHBUYER000000000000` | Pays and opens |
| Guest | `NQ89LATCHGUEST000000000000` | Sees the lock; no purchase |

The active role is stored in `localStorage` under `latch.preview-role`. The bar hides when a real Nimiq Pay host is detected (`window.nimiqPay` or `window.nimiq`).

**Demo path**

1. Stay on Creator. Create a latch (or open **Try the demo latch**).
2. Switch to **Buyer**. Pay. Confirm. Open.
3. Switch to **Guest**. Same URL, still locked.
4. Switch back to Creator. Refund. Buyer loses the key.

---

## 6. Pages

| Route | What |
|---|---|
| `/` | Pitch, three steps, create form |
| `/g/{slug}` | Public latch. Pay, open, pause, refund. |
| `/me` | Latches this wallet created, and ones it bought |
| `/unlock/starter` | Destination of the seeded demo latch (scoring kit) |

There is no sign-in. Identity is the wallet address. Auth stays off so a deployed visitor is not rejected by a preview-only session.

---

## 7. Data model

Postgres. In preview, an in-memory PGLite (WASM) so the app runs with no config. In production, Neon via `DATABASE_URL`.

### `gates`

| Column | Meaning |
|---|---|
| `id` | `gate_…` |
| `slug` | Public id in `/g/{slug}` |
| `destination_url` | Hidden target |
| `title`, `preview` | Public copy |
| `price_amount`, `price_currency` | `NIM` or `USDT` |
| `creator_wallet` | Owner |
| `access_opens`, `access_days` | Key limits |
| `paused` | Stops new purchases |
| `view_count`, `sale_count` | Public stats |
| `created_at` | |

### `purchases`

One active purchase per `(gate, buyer)` (unique index where `refunded_at` is null). Stores `tx_hash`, amount, currency. Preview payments use a synthetic `preview:{id}` hash.

### `opens`

Each successful open. Counted against `access_opens`.

### Seed

Slug `starter` — “Cycle 2 scoring kit”, 2 USDT, 3 opens, 7 days, creator = the Creator preview wallet, destination `/unlock/starter`.

If production has no `DATABASE_URL`, PGLite cannot open its WASM data file on Vercel. The starter latch is also hardcoded as a fallback so `/g/starter` still renders. **Creating new latches in production requires Neon.**

---

## 8. Access rules (the product)

Evaluated on the server in this order:

1. No gate → missing
2. No purchase for this wallet → unpaid
3. `refunded_at` set → refunded, cannot open
4. `created_at + access_days` in the past → expired
5. `count(opens) >= access_opens` → opens exhausted
6. Else → `canOpen`, with `remainingOpens`

The destination is selected only inside `openGate`, after those checks. It is never sent to `getGate`.

---

## 9. Stack

- React 19, TanStack Start / Router, Vite 8, Tailwind v4, Nitro (`vercel` preset)
- Zustand-free wallet context (React context + `localStorage`)
- Zod-validated server functions (`createServerFn`)
- Radix / shadcn-style buttons and inputs, lucide icons, sonner toasts
- `getSql()` — Neon when `DATABASE_URL` is set, otherwise PGLite
- Migrations in `migrations/0002_latch.sql` (auth schema exists but is unused)

Auth is **off** (`VITE_AUTH_ENABLED=false`). Rows are unowned by a user id; they are keyed by wallet strings.

---

## 10. Production

- **Vercel** project name: `nimlink` (slugs are lowercase; the GitHub repo is `NimLink`)
- **Production URL:** [https://nimlink.vercel.app](https://nimlink.vercel.app)
- Set `DATABASE_URL` (Neon Postgres) on the Vercel project so creates, pays, and opens persist. Without it, only the starter fallback is reliable.
- Do not put secrets in a committed `.env`. `VITE_*` is the only class of variable that reaches the browser.
- Share-card tags are not authored in the document shell; `src/lib/og/site.json` plus `public/og.jpg` drive the unfurl.

---

## 11. Cycle 2 scoring (how Nimlink is built to be judged)

| Axis | Points | How Nimlink answers |
|---|---|---|
| Design | 25 | Gold paperclip brand, dark warm chrome, mobile-first, 60-second onboarding on `/` |
| Functionality | 25 | Unpaid cannot open. Paid can. Refund revokes. Pause stops new buys. Wallet-bound. |
| Usefulness | 25 | A primitive: price any link the hour you onboard |
| Marketing | 25 | Live purchase on Sip & Ship is the demo; starter kit is the script |
| NIM bonus | 5 | Currency toggle is NIM or USDT, not USDT-only |

Steal-this copy:

> Put a price on any link. They pay in NIM. Their wallet is the key. Forwarding the page does nothing.

---

## 12. What is real vs preview

| | Preview / this site in a normal browser | Inside Nimiq Pay |
|---|---|---|
| Wallet | Creator / Buyer / Guest switcher | Host wallet |
| Payment | Confirm writes a `purchases` row with a synthetic tx | Confirm in Nimiq Pay, then the same row |
| Persistence | PGLite in memory (preview) or Neon | Neon, if `DATABASE_URL` is set |
| Starter latch | Always available | Always available (DB or fallback) |

Nimlink does not custody funds and does not show the destination to anyone who has not passed `openGate`.

---

## 13. File map

```
src/components/paperclip.tsx   Mark + wordmark
src/components/shell.tsx       Header, preview wallet bar
src/components/create-form.tsx New latch
src/routes/index.tsx           Home
src/routes/g.$slug.tsx         Public latch
src/routes/me.tsx              Created + bought
src/routes/unlock.starter.tsx  Demo destination
src/lib/server/gates.ts        All latch server functions
src/lib/wallets.ts             Preview addresses
src/lib/wallet-context.tsx     Active wallet
src/lib/db.ts                  Neon / PGLite
src/styles.css                 Tokens
migrations/0002_latch.sql      Schema + starter seed
public/favicon.svg             Tab icon
public/logo.svg                Gold paperclip
public/og.jpg                  Share card
```

---

## 14. Run it

```bash
npm install
npm run dev
```

Create a latch, switch to Buyer, pay, open, switch to Guest, confirm it stays locked.
