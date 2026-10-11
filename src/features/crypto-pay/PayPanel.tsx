"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, type FormEvent } from "react";
import { copy } from "./copy";
import { chainMeta, tokenAllowed } from "./tokens";
import { chains, tokens, type ChainId, type PayMode, type SettledPayment, type TokenId } from "./types";
import type { WalletResult } from "./WalletPay";

const WalletPay = dynamic(() => import("./WalletPay").then((mod) => mod.WalletPay), { ssr: false });

export type PayPanelConfig = {
  enabled: boolean;
  sanctions: "webhook" | "passthrough";
  walletConnect: boolean;
  projectId: string;
  siteUrl: string;
  solanaRpcUrl: string;
  sharedAddresses: boolean;
  addresses: {
    quantum: Record<ChainId, string> | null;
    tip: Record<ChainId, string> | null;
  };
};

type ScreenResponse = {
  ok: boolean;
  data?: { payment: SettledPayment; sanctions: string };
  error?: { message?: string };
};

export function PayPanel({ config }: { config: PayPanelConfig }) {
  const [mode, setMode] = useState<PayMode>("invoice");
  const [chain, setChain] = useState<ChainId>("base");
  const [token, setToken] = useState<TokenId>("USDC");
  const [amountUsd, setAmountUsd] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [qr, setQr] = useState<{ src: string; uri: string; payment: SettledPayment } | null>(null);
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState("");
  const [busy, setBusy] = useState(false);

  const tokenChoices = useMemo(() => tokens.filter((item) => tokenAllowed(chain, item)), [chain]);
  const activeToken = tokenChoices.includes(token) ? token : tokenChoices[0];
  const profileReady = config.addresses[mode === "invoice" ? "quantum" : "tip"] !== null;
  const canPrepare = config.enabled && !config.sharedAddresses && profileReady;

  async function screen(): Promise<{ ok: true; payment: SettledPayment } | { ok: false; message: string }> {
    const response = await fetch("/api/payments/screen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode, chain, token: activeToken, amountUsd, invoiceNumber }),
    });
    const payload = (await response.json()) as ScreenResponse;
    if (!response.ok || !payload.data?.payment) {
      return { ok: false, message: payload.error?.message ?? "The payment was not accepted." };
    }
    return { ok: true, payment: payload.data.payment };
  }

  async function prepare(event: FormEvent) {
    event.preventDefault();
    setReceipt("");
    setMessage("");
    setQr(null);
    if (!canPrepare) return;
    setBusy(true);
    try {
      const authorized = await screen();
      if (!authorized.ok) {
        setMessage(authorized.message);
        return;
      }
      const response = await fetch("/api/payments/qr", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode, chain, token: activeToken, amountUsd, invoiceNumber }),
      });
      const payload = (await response.json()) as { data?: { qr: string; uri: string; payment: SettledPayment }; error?: { message?: string } };
      if (!response.ok || !payload.data) {
        setMessage(payload.error?.message ?? "The payment code could not be made.");
        return;
      }
      setQr({ src: payload.data.qr, uri: payload.data.uri, payment: payload.data.payment });
    } finally {
      setBusy(false);
    }
  }

  async function copyAddress() {
    if (!qr) return;
    await navigator.clipboard.writeText(qr.payment.toAddress);
    setMessage("Address copied.");
  }

  async function onWallet(result: WalletResult) {
    if (!result.ok || !qr) {
      setMessage(result.ok ? "" : result.message);
      return;
    }
    await fetch("/api/payments/log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...qr.payment, fromAddress: result.from, txHash: result.hash, status: "confirmed" }),
    });
    setReceipt(`${chainMeta[qr.payment.chain].explorerTx}${result.hash}`);
    setMessage("The wallet reported a confirmed transfer. Quantum Group Co does not hold the funds.");
  }

  return (
    <form onSubmit={(event) => void prepare(event)} className="mt-10 max-w-3xl">
      {!config.enabled ? <p className="border border-gold/70 px-4 py-3 text-sand">{copy.disabled}</p> : null}
      {config.enabled && !profileReady ? <p className="mt-4 border border-gold/70 px-4 py-3 text-sand">{copy.unconfigured}</p> : null}
      {config.sharedAddresses ? <p className="mt-4 border border-gold/70 px-4 py-3 text-sand">{copy.shared}</p> : null}

      <fieldset className="mt-8">
        <legend className="kicker">Payment</legend>
        <div className="mt-4 flex gap-3">
          {(["invoice", "tip"] as const).map((item) => (
            <button key={item} type="button" className={mode === item ? "border border-gold px-4 py-2 text-sand" : "border border-line px-4 py-2 text-sand/70"} onClick={() => { setMode(item); setQr(null); }}>
              {item === "invoice" ? "Invoice" : "Tip"}
            </button>
          ))}
        </div>
      </fieldset>

      {mode === "tip" ? <p className="mt-4 text-sm leading-relaxed text-sand/75">{copy.tip}</p> : <p className="mt-4 text-sm leading-relaxed text-sand/75">{copy.invoiceHelp}</p>}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-sand/70">
          Network
          <select className="mt-2 w-full border border-line bg-ink px-3 py-3 text-sand" value={chain} onChange={(event) => { setChain(event.target.value as ChainId); setQr(null); }}>
            {chains.map((item) => <option key={item} value={item}>{chainMeta[item].label}</option>)}
          </select>
        </label>
        <label className="block text-sm text-sand/70">
          Token
          <select className="mt-2 w-full border border-line bg-ink px-3 py-3 text-sand" value={activeToken} onChange={(event) => { setToken(event.target.value as TokenId); setQr(null); }}>
            {tokenChoices.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="block text-sm text-sand/70">
          Amount in US dollars
          <input className="mt-2 w-full border border-line bg-ink px-3 py-3 text-sand" inputMode="decimal" value={amountUsd} onChange={(event) => { setAmountUsd(event.target.value); setQr(null); }} required />
        </label>
        {mode === "invoice" ? (
          <label className="block text-sm text-sand/70">
            Invoice number
            <input className="mt-2 w-full border border-line bg-ink px-3 py-3 text-sand" value={invoiceNumber} onChange={(event) => { setInvoiceNumber(event.target.value); setQr(null); }} required />
          </label>
        ) : null}
      </div>

      <button type="submit" className="mt-6 border border-gold px-4 py-3 text-[0.68rem] tracking-[0.18em] text-sand uppercase disabled:opacity-40" disabled={!canPrepare || busy}>
        {busy ? "Preparing" : "Show payment code"}
      </button>
      <p className="mt-4 text-sm text-sand/60">{copy.sendWarning}</p>
      {message ? <p className="mt-4 text-sm text-sand" role="status">{message}</p> : null}

      {qr ? (
        <div className="glass-panel mt-8 p-6">
          {/* Generated per invoice as a data URL, so the image optimizer does not apply. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr.src} alt="Payment code for the receiving address" width={280} height={280} />
          <p className="mt-4 break-all text-sm text-sand">{qr.payment.toAddress}</p>
          <p className="mt-2 text-sm text-sand/70">
            {qr.payment.tokenAmount} {qr.payment.token}
            {qr.payment.estimated ? " (estimate, not a locked rate)" : " at one US dollar each"}
            {qr.payment.invoiceNumber ? ` · Invoice ${qr.payment.invoiceNumber}` : ""}
          </p>
          <button type="button" className="mt-4 text-[0.68rem] tracking-[0.18em] text-gold-2 uppercase" onClick={() => void copyAddress()}>
            Copy address
          </button>
          {config.walletConnect ? (
            <WalletPay
              projectId={config.projectId}
              siteUrl={config.siteUrl}
              solanaRpcUrl={config.solanaRpcUrl}
              canSend={canPrepare}
              onAuthorize={screen}
              onResult={(result) => void onWallet(result)}
            />
          ) : <p className="mt-4 text-sm text-sand/60">{copy.walletMissing}</p>}
        </div>
      ) : null}
      {receipt ? <p className="mt-4 break-all text-sm"><a className="text-gold-2" href={receipt}>View the transfer</a></p> : null}
    </form>
  );
}
