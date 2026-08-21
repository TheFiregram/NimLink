import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createGate } from "@/lib/server/gates";
import { useWallet } from "@/lib/wallet-context";
import { cn } from "@/lib/utils";

export function CreateForm() {
  const { address } = useWallet();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [priceAmount, setPriceAmount] = useState("2");
  const [priceCurrency, setPriceCurrency] = useState<"NIM" | "USDT">("USDT");
  const [accessOpens, setAccessOpens] = useState(3);
  const [accessDays, setAccessDays] = useState(7);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await createGate({
        data: {
          title,
          preview,
          destinationUrl,
          priceAmount,
          priceCurrency,
          creatorWallet: address,
          accessOpens,
          accessDays,
        },
      });
      toast.success("Latch is live.");
      await navigate({ to: "/g/$slug", params: { slug: result.slug } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create latch.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label="Title">
        <Input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Figma file, PDF, Notion kit…"
          maxLength={80}
        />
      </Field>
      <Field label="Hidden URL">
        <Input
          required
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          placeholder="https://…"
          inputMode="url"
        />
      </Field>
      <Field label="Preview line">
        <Textarea
          value={preview}
          onChange={(e) => setPreview(e.target.value)}
          placeholder="One sentence. No spoilers. This is what they see before they pay."
          maxLength={220}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Price">
          <Input
            required
            value={priceAmount}
            onChange={(e) => setPriceAmount(e.target.value)}
            inputMode="decimal"
          />
        </Field>
        <Field label="Currency">
          <div className="grid grid-cols-2 gap-1 rounded-[var(--radius-sm)] bg-elevated p-1 shadow-[var(--shadow-border)]">
            {(["USDT", "NIM"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setPriceCurrency(c)}
                className={cn(
                  "h-9 rounded-[6px] text-sm font-medium",
                  priceCurrency === c
                    ? "bg-accent text-accent-fg"
                    : "text-muted hover:text-fg",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Opens">
          <Input
            type="number"
            min={1}
            max={99}
            value={accessOpens}
            onChange={(e) => setAccessOpens(Number(e.target.value) || 1)}
          />
        </Field>
        <Field label="Days of access">
          <Input
            type="number"
            min={1}
            max={365}
            value={accessDays}
            onChange={(e) => setAccessDays(Number(e.target.value) || 1)}
          />
        </Field>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "Latching…" : "Create latch"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
