# NimLink

Put a price on any link. Buyers pay in NIM or USDT — their wallet is the key.

A [Nimiq Pay](https://www.nimiq.com) Mini App for Cycle 2 of the Mini Apps Competition.

**Live:** [nimlink.vercel.app](https://nimlink.vercel.app)

## What it does

1. Paste a URL (Notion, Drive, Figma, a PDF).
2. Set a price in NIM or USDT.
3. Share one link. The destination never appears on the public page.
4. After payment, access is **wallet-bound**: forwarding the page does nothing.

## Run locally

```bash
npm install
npm run dev
```

## Production

Vercel project: `nimlink`. Persist latches by setting `DATABASE_URL` (Neon Postgres) in the project’s environment variables.

## License

MIT
