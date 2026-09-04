import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { newId, newSlug } from "@/lib/utils";
import { PREVIEW_WALLETS } from "@/lib/wallets";

const currencySchema = z.literal("NIM");

export type PublicGate = {
  id: string;
  slug: string;
  title: string;
  preview: string;
  priceAmount: string;
  priceCurrency: "NIM";
  creatorWallet: string;
  accessOpens: number;
  accessDays: number;
  paused: boolean;
  viewCount: number;
  saleCount: number;
  createdAt: string;
};

export type AccessState = {
  purchased: boolean;
  refunded: boolean;
  canOpen: boolean;
  remainingOpens: number;
  expiresAt: string | null;
  reason: string | null;
};

type GateRow = {
  id: string;
  slug: string;
  title: string;
  preview: string;
  price_amount: string;
  price_currency: "NIM";
  creator_wallet: string;
  access_opens: number;
  access_days: number;
  paused: boolean;
  view_count: number;
  sale_count: number;
  created_at: string;
};

const STARTER_ROW: GateRow = {
  id: "gate_starter",
  slug: "starter",
  title: "Cycle 2 scoring kit",
  preview:
    "A one-page brief: scoresheet, 40-second demo script, and copy you can steal for Sip & Ship.",
  price_amount: "2",
  price_currency: "NIM",
  creator_wallet: PREVIEW_WALLETS.creator.address,
  access_opens: 3,
  access_days: 7,
  paused: false,
  view_count: 0,
  sale_count: 0,
  created_at: "2026-08-21T00:00:00+00",
};

function dbUnavailable(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  return /pglite\.data|ENOENT|DATABASE_URL|ECONNREFUSED/i.test(msg);
}

function toPublic(row: GateRow): PublicGate {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    preview: row.preview,
    priceAmount: row.price_amount,
    priceCurrency: row.price_currency,
    creatorWallet: row.creator_wallet,
    accessOpens: row.access_opens,
    accessDays: row.access_days,
    paused: row.paused,
    viewCount: row.view_count,
    saleCount: row.sale_count,
    createdAt: row.created_at,
  };
}

const publicSelect = `
  id, slug, title, preview, price_amount, price_currency, creator_wallet,
  access_opens, access_days, paused, view_count, sale_count,
  created_at::text as created_at
`;

async function loadGateBySlug(slug: string) {
  try {
    const sql = await getSql();
    const rows = await sql.query<GateRow>(
      `select ${publicSelect} from gates where slug = $1`,
      [slug],
    );
    return rows[0] ?? (slug === "starter" ? STARTER_ROW : null);
  } catch (err) {
    if (slug === "starter" && dbUnavailable(err)) return STARTER_ROW;
    throw err;
  }
}

export const createGate = createServerFn({ method: "POST" })
  .validator(
    z.object({
      title: z.string().trim().min(2).max(80),
      preview: z.string().trim().max(220),
      destinationUrl: z.string().trim().min(1).max(2048),
      priceAmount: z.string().trim().min(1).max(16),
      priceCurrency: currencySchema,
      creatorWallet: z.string().trim().min(8).max(80),
      accessOpens: z.number().int().min(1).max(99),
      accessDays: z.number().int().min(1).max(365),
    }),
  )
  .handler(async ({ data }) => {
    const amount = Number(data.priceAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Price must be a positive number.");
    }

    let destination = data.destinationUrl.trim();
    if (!destination.startsWith("/")) {
      if (!/^https?:\/\//i.test(destination)) destination = `https://${destination}`;
      try {
        const parsed = new URL(destination);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          throw new Error("URL must be http or https.");
        }
      } catch {
        throw new Error("That does not look like a valid URL.");
      }
    }

    const sql = await getSql().catch((err) => {
      if (dbUnavailable(err)) {
        throw new Error(
          "Latches need a Postgres DATABASE_URL (Neon) in the Vercel project.",
        );
      }
      throw err;
    });
    const id = newId("gate");
    const slug = newSlug();
    await sql.query(
      `insert into gates (
        id, slug, destination_url, title, preview, price_amount, price_currency,
        creator_wallet, access_opens, access_days
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        id,
        slug,
        destination,
        data.title.trim(),
        data.preview.trim(),
        String(amount),
        "NIM",
        data.creatorWallet.replace(/\s+/g, ""),
        data.accessOpens,
        data.accessDays,
      ],
    );
    return { id, slug };
  });

export const getGate = createServerFn({ method: "GET" })
  .validator(
    z.object({
      slug: z.string().min(1),
      countView: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const row = await loadGateBySlug(data.slug);
    if (!row) return null;
    if (data.countView === false) return toPublic(row);
    try {
      const sql = await getSql();
      await sql.query(`update gates set view_count = view_count + 1 where id = $1`, [
        row.id,
      ]);
      return toPublic({ ...row, view_count: row.view_count + 1 });
    } catch (err) {
      if (dbUnavailable(err)) return toPublic(row);
      throw err;
    }
  });

export const getAccess = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1), wallet: z.string().min(1) }))
  .handler(async ({ data }): Promise<AccessState> => {
    const gate = await loadGateBySlug(data.slug);
    if (!gate) {
      return { purchased: false, refunded: false, canOpen: false, remainingOpens: 0, expiresAt: null, reason: "missing" };
    }
    const sql = await getSql().catch((err) => {
      if (dbUnavailable(err)) return null;
      throw err;
    });
    if (!sql) {
      return { purchased: false, refunded: false, canOpen: false, remainingOpens: 0, expiresAt: null, reason: "missing" };
    }
    const wallet = data.wallet.replace(/\s+/g, "");
    const purchases = await sql.query<{ id: string; created_at: string; refunded_at: string | null }>(
      `select id, created_at::text as created_at, refunded_at::text as refunded_at
       from purchases where gate_id = $1 and buyer_wallet = $2
       order by created_at desc limit 1`,
      [gate.id, wallet],
    );
    const purchase = purchases[0];
    if (!purchase) {
      return { purchased: false, refunded: false, canOpen: false, remainingOpens: 0, expiresAt: null, reason: "unpaid" };
    }
    if (purchase.refunded_at) {
      return { purchased: true, refunded: true, canOpen: false, remainingOpens: 0, expiresAt: null, reason: "refunded" };
    }
    const expires = new Date(purchase.created_at);
    expires.setUTCDate(expires.getUTCDate() + gate.access_days);
    if (expires.getTime() < Date.now()) {
      return { purchased: true, refunded: false, canOpen: false, remainingOpens: 0, expiresAt: expires.toISOString(), reason: "expired" };
    }
    const openRows = await sql.query<{ n: number }>(`select count(*)::int as n from opens where purchase_id = $1`, [purchase.id]);
    const used = openRows[0]?.n ?? 0;
    const remaining = Math.max(0, gate.access_opens - used);
    return { purchased: true, refunded: false, canOpen: remaining > 0, remainingOpens: remaining, expiresAt: expires.toISOString(), reason: remaining > 0 ? null : "opens_exhausted" };
  });

export const payGate = createServerFn({ method: "POST" })
  .validator(
    z.object({
      slug: z.string().min(1),
      buyerWallet: z.string().min(8),
      txHash: z.string().min(1).max(256),
    }),
  )
  .handler(async ({ data }) => {
    const gate = await loadGateBySlug(data.slug);
    if (!gate) throw new Error("This latch does not exist.");
    if (gate.paused) throw new Error("The creator paused this latch.");
    if (gate.price_currency !== "NIM") throw new Error("This latch only accepts NIM.");
    const buyer = data.buyerWallet.replace(/\s+/g, "");
    if (buyer === gate.creator_wallet) throw new Error("You cannot buy your own latch.");
    const sql = await getSql();
    const existing = await sql.query<{ id: string; refunded_at: string | null }>(
      `select id, refunded_at::text as refunded_at from purchases
       where gate_id = $1 and buyer_wallet = $2
       order by created_at desc limit 1`,
      [gate.id, buyer],
    );
    if (existing[0] && !existing[0].refunded_at) return { already: true as const, purchaseId: existing[0].id };
    const id = newId("pay");
    await sql.query(
      `insert into purchases (id, gate_id, buyer_wallet, tx_hash, amount, currency)
       values ($1,$2,$3,$4,$5,$6)`,
      [id, gate.id, buyer, data.txHash, gate.price_amount, "NIM"],
    );
    await sql.query(`update gates set sale_count = sale_count + 1 where id = $1`, [gate.id]);
    return { already: false as const, purchaseId: id, txHash: data.txHash };
  });

function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<base[^>]*>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "");
}

export const openGate = createServerFn({ method: "POST" })
  .validator(z.object({ slug: z.string().min(1), buyerWallet: z.string().min(8) }))
  .handler(async ({ data }) => {
    const gate = await loadGateBySlug(data.slug);
    if (!gate) throw new Error("This latch does not exist.");
    const buyer = data.buyerWallet.replace(/\s+/g, "");
    const sql = await getSql();
    const purchases = await sql.query<{ id: string; created_at: string; refunded_at: string | null }>(
      `select id, created_at::text as created_at, refunded_at::text as refunded_at
       from purchases where gate_id = $1 and buyer_wallet = $2
       order by created_at desc limit 1`,
      [gate.id, buyer],
    );
    const purchase = purchases[0];
    if (!purchase || purchase.refunded_at) throw new Error("Pay first. The wallet is the key.");
    const expires = new Date(purchase.created_at);
    expires.setUTCDate(expires.getUTCDate() + gate.access_days);
    if (expires.getTime() < Date.now()) throw new Error("Access expired.");
    const openRows = await sql.query<{ n: number }>(`select count(*)::int as n from opens where purchase_id = $1`, [purchase.id]);
    const used = openRows[0]?.n ?? 0;
    if (used >= gate.access_opens) throw new Error("No opens left on this latch.");
    await sql.query(`insert into opens (id, purchase_id) values ($1,$2)`, [newId("open"), purchase.id]);

    const destination = (await sql.query<{ destination_url: string }>(`select destination_url from gates where id = $1`, [gate.id]))[0]?.destination_url;
    if (!destination) throw new Error("Missing destination.");
    if (destination.startsWith("/")) {
      return { kind: "internal" as const, url: destination, remainingOpens: gate.access_opens - used - 1 };
    }

    const response = await fetch(destination, { redirect: "follow" });
    if (!response.ok) throw new Error("The protected resource could not be loaded.");
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      throw new Error("This resource is not an HTML page. Use a protected HTML viewer for this demo.");
    }
    const html = sanitizeHtml(await response.text());
    return { kind: "html" as const, html, remainingOpens: gate.access_opens - used - 1 };
  });

export const listMyGates = createServerFn({ method: "GET" })
  .validator(z.object({ wallet: z.string().min(8) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql.query<GateRow>(`select ${publicSelect} from gates where creator_wallet = $1 order by created_at desc`, [data.wallet.replace(/\s+/g, "")]);
    return rows.map(toPublic);
  });

export const listMyPurchases = createServerFn({ method: "GET" })
  .validator(z.object({ wallet: z.string().min(8) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql.query<{ id: string; slug: string; title: string; amount: string; currency: "NIM"; created_at: string; refunded_at: string | null }>(
      `select p.id, g.slug, g.title, p.amount, p.currency, p.created_at::text as created_at, p.refunded_at::text as refunded_at
       from purchases p join gates g on g.id = p.gate_id where p.buyer_wallet = $1 order by p.created_at desc`,
      [data.wallet.replace(/\s+/g, "")],
    );
    return rows.map((r) => ({ id: r.id, slug: r.slug, title: r.title, amount: r.amount, currency: r.currency, createdAt: r.created_at, refunded: Boolean(r.refunded_at) }));
  });

export const listSales = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1), wallet: z.string().min(8) }))
  .handler(async ({ data }) => {
    const gate = await loadGateBySlug(data.slug);
    if (!gate) throw new Error("Missing latch.");
    const wallet = data.wallet.replace(/\s+/g, "");
    if (wallet !== gate.creator_wallet) throw new Error("Only the creator can see sales.");
    const sql = await getSql();
    const rows = await sql.query<{ id: string; buyer_wallet: string; amount: string; currency: string; created_at: string; refunded_at: string | null; opens: number }>(
      `select p.id, p.buyer_wallet, p.amount, p.currency, p.created_at::text as created_at,
              p.refunded_at::text as refunded_at,
              (select count(*)::int from opens o where o.purchase_id = p.id) as opens
       from purchases p where p.gate_id = $1 order by p.created_at desc`,
      [gate.id],
    );
    return rows.map((r) => ({ id: r.id, buyerWallet: r.buyer_wallet, amount: r.amount, currency: r.currency, createdAt: r.created_at, refunded: Boolean(r.refunded_at), opens: r.opens }));
  });

export const pauseGate = createServerFn({ method: "POST" })
  .validator(z.object({ slug: z.string().min(1), wallet: z.string().min(8), paused: z.boolean() }))
  .handler(async ({ data }) => {
    const gate = await loadGateBySlug(data.slug);
    if (!gate) throw new Error("Missing latch.");
    if (data.wallet.replace(/\s+/g, "") !== gate.creator_wallet) throw new Error("Only the creator can pause this latch.");
    const sql = await getSql();
    await sql.query(`update gates set paused = $1 where id = $2`, [data.paused, gate.id]);
    return { paused: data.paused };
  });

export const refundPurchase = createServerFn({ method: "POST" })
  .validator(z.object({ purchaseId: z.string().min(1), wallet: z.string().min(8) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql.query<{ id: string; gate_id: string; creator_wallet: string; refunded_at: string | null }>(
      `select p.id, p.gate_id, g.creator_wallet, p.refunded_at::text as refunded_at
       from purchases p join gates g on g.id = p.gate_id where p.id = $1`,
      [data.purchaseId],
    );
    const row = rows[0];
    if (!row) throw new Error("Sale not found.");
    if (data.wallet.replace(/\s+/g, "") !== row.creator_wallet) throw new Error("Only the creator can refund.");
    if (row.refunded_at) return { ok: true };
    await sql.query(`update purchases set refunded_at = now() where id = $1`, [row.id]);
    await sql.query(`update gates set sale_count = greatest(sale_count - 1, 0) where id = $1`, [row.gate_id]);
    return { ok: true };
  });
