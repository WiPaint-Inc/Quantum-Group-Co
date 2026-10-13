"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { copy, tipDisclaimer } from "./copy";
import { chainMeta, tokenAllowed } from "./tokens";
import { chains, type ChainId, type PayMode, type PaymentReceipt, type ProfileId, type Quote, type SettledPayment, type TokenId, tokens } from "./types";
import type { WalletResult } from "./WalletPay";
import { estimateNativeAmount, parseInvoiceNumber, parsePayerEmail, parsePayerName, parseUsdAmount, tipNeedsContact } from "./validate";

const WalletPay = dynamic(() => import("./WalletPay").then((mod) => mod.WalletPay), { ssr: false });

export type PayPanelConfig = {
  businessName: string;
  profileId: ProfileId;
  modes: PayMode[];
  enabled: boolean;
  configured: boolean;
  sharedAddresses: boolean;
  sanctions: "configured" | "passthrough";
  walletConnect: boolean;
  projectId: string;
  siteUrl: string;
  solanaRpcUrl: string;
  presets: number[];
  anonymousTipCapUsd: number;
  fiat: { stripe: string | null; coinbase: string | null };
};

type QrPayload = { src: string; uri: string; payment: SettledPayment };

export function PayPanel({ config }: { config: PayPanelConfig }) {
  const [mode, setMode] = useState<PayMode>(config.modes[0] ?? "invoice");
  const [chain, setChain] = useState<ChainId>("base");
  const [token, setToken] = useState<TokenId>("USDC");
  const [amountUsd, setAmountUsd] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [quote, setQuote] = useState<{ token: TokenId; quote: Quote | null } | null>(null);
  const [qr, setQr] = useState<{ key: string; payload: QrPayload | null } | null>(null);
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  const tokenChoices = useMemo(() => tokens.filter((item) => tokenAllowed(chain, item)), [chain]);
  const activeToken = tokenChoices.includes(token) ? token : tokenChoices[0];
  const activeMode = config.modes.includes(mode) ? mode : config.modes[0] ?? "invoice";
  const parsedAmount = parseUsdAmount(amountUsd);
  const parsedInvoice = parseInvoiceNumber(invoiceNumber);
  const invoiceReady = activeMode !== "invoice" || parsedInvoice !== null;
  const native = activeToken === "ETH" || activeToken === "SOL";
  const liveQuote = quote && quote.token === activeToken ? quote.quote : null;
  const quoteMissing = native && quote?.token === activeToken && quote.quote === null;
  const estimate = parsedAmount && liveQuote ? estimateNativeAmount(parsedAmount, liveQuote.usdPerToken) : null;
  const quoteReady = !native || estimate !== null;
  const overCap = activeMode === "tip" && parsedAmount !== null && tipNeedsContact(parsedAmount, config.anonymousTipCapUsd);
  const contactReady = !overCap || (parsePayerName(payerName) !== null && parsePayerEmail(payerEmail) !== null);
  const addressReady = config.configured && !config.sharedAddresses && parsedAmount !== null && invoiceReady && quoteReady;
  const canSend = addressReady && config.enabled && contactReady;
  const displayKey = addressReady
    ? JSON.stringify({
        mode: activeMode,
        profileId: config.profileId,
        chain,
        token: activeToken,
        amountUsd,
        invoiceNumber: activeMode === "invoice" ? invoiceNumber : "",
      })
    : "";
  const shownQr = qr && qr.key === displayKey ? qr.payload : null;

  useEffect(() => {
    if (activeToken !== "ETH" && activeToken !== "SOL") return;
    const controller = new AbortController();
    const tokenAtRequest = activeToken;
    fetch(`/api/payments/quote?token=${tokenAtRequest}`, { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json()) as { data?: Quote };
        if (controller.signal.aborted) return;
        if (!response.ok || !body.data?.usdPerToken) {
          setQuote({ token: tokenAtRequest, quote: null });
          return;
        }
        setQuote({ token: tokenAtRequest, quote: body.data });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (controller.signal.aborted) return;
        setQuote({ token: tokenAtRequest, quote: null });
      });
    return () => controller.abort();
  }, [activeToken]);

  useEffect(() => {
    if (!displayKey) return;
    const controller = new AbortController();
    const key = displayKey;
    fetch("/api/payments/qr", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: key,
      signal: controller.signal,
    })
      .then(async (response) => {
        const body = (await response.json()) as { data?: QrPayload; error?: { message?: string } };
        if (controller.signal.aborted) return;
        if (!response.ok || !body.data) {
          setQr({ key, payload: null });
          setMessage(body.error?.message ?? copy.unconfigured);
          return;
        }
        setMessage("");
        setQr({ key, payload: body.data });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
      });
    return () => controller.abort();
  }, [displayKey]);

  async function screen(from: { evm?: string; solana?: string }) {
    const fromAddress = chain === "solana" ? from.solana ?? "" : from.evm ?? "";
    const response = await fetch("/api/payments/screen", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        mode: activeMode,
        profileId: config.profileId,
        chain,
        token: activeToken,
        amountUsd,
        invoiceNumber: activeMode === "invoice" ? invoiceNumber : "",
        fromAddress,
        payerName,
        payerEmail,
      }),
    });
    const payload = (await response.json()) as { data?: { payment: SettledPayment }; error?: { message?: string } };
    if (!response.ok || !payload.data?.payment) {
      return { ok: false as const, message: payload.error?.message ?? copy.blocked };
    }
    return { ok: true as const, payment: payload.data.payment };
  }

  async function onWallet(result: WalletResult) {
    if (!result.ok || !shownQr) {
      setMessage(result.ok ? "" : result.message);
      return;
    }
    const response = await fetch("/api/payments/log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        mode: shownQr.payment.mode,
        profileId: shownQr.payment.profileId,
        chain: shownQr.payment.chain,
        token: shownQr.payment.token,
        amountUsd: shownQr.payment.amountUsd,
        tokenAmount: shownQr.payment.tokenAmount,
        invoiceNumber: shownQr.payment.invoiceNumber ?? "",
        fromAddress: result.from,
        payerName,
        payerEmail,
        txHash: result.hash,
        status: "confirmed",
      }),
    });
    const payload = (await response.json()) as { data?: { receipt?: PaymentReceipt }; error?: { message?: string } };
    if (!response.ok || !payload.data?.receipt) {
      setMessage(payload.error?.message ?? copy.blocked);
      return;
    }
    setReceipt(payload.data.receipt);
    setMessage("The wallet reported a confirmed transfer. This site does not hold the funds.");
  }

  async function copyText(value: string, confirmation: string) {
    await navigator.clipboard.writeText(value);
    setMessage(confirmation);
  }

  const payButton = (
    <button type="button" className="border border-gold px-4 py-3 text-[0.68rem] tracking-[0.18em] text-sand uppercase disabled:opacity-40" disabled>
      Connect & Pay
    </button>
  );

  return (
    <section className="mt-10 max-w-3xl">
      {!config.enabled ? (
        <p className="border border-gold/70 px-4 py-3 text-sand" role="status">
          {copy.disabled}
        </p>
      ) : null}
      {!config.configured ? <p className="mt-4 border border-gold/70 px-4 py-3 text-sand">{copy.unconfigured}</p> : null}
      {config.sharedAddresses ? <p className="mt-4 border border-gold/70 px-4 py-3 text-sand">{copy.shared}</p> : null}

      {config.modes.length > 1 ? (
        <fieldset className="mt-8">
          <legend className="kicker">Payment</legend>
          <div className="mt-4 flex gap-3">
            {config.modes.map((item) => (
              <button
                key={item}
                type="button"
                className={activeMode === item ? "border border-gold px-4 py-2 text-sand" : "border border-line px-4 py-2 text-sand/70"}
                onClick={() => {
                  setMode(item);
                  setQr(null);
                  setReceipt(null);
                }}
              >
                {item === "invoice" ? "Invoice" : "Tip"}
              </button>
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="kicker mt-8">Invoice</p>
      )}

      {activeMode === "tip" ? (
        <p className="mt-4 text-sm leading-relaxed text-sand/75">{tipDisclaimer(config.businessName)}</p>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-sand/75">{copy.invoiceHelp}</p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-sand/70">
          Network
          <select
            className="mt-2 w-full border border-line bg-ink px-3 py-3 text-sand"
            value={chain}
            onChange={(event) => {
              setChain(event.target.value as ChainId);
              setReceipt(null);
            }}
          >
            {chains.map((item) => (
              <option key={item} value={item}>
                {chainMeta[item].label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-sand/70">
          Token
          <select
            className="mt-2 w-full border border-line bg-ink px-3 py-3 text-sand"
            value={activeToken}
            onChange={(event) => {
              setToken(event.target.value as TokenId);
              setReceipt(null);
            }}
          >
            {tokenChoices.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="block text-sm text-sand/70 md:col-span-2">
          <legend>Amount in US dollars</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {config.presets.map((amount) => (
              <button
                key={amount}
                type="button"
                className={amountUsd === String(amount) ? "border border-gold px-3 py-2 text-sand" : "border border-line px-3 py-2 text-sand/70"}
                onClick={() => {
                  setAmountUsd(String(amount));
                  setReceipt(null);
                }}
              >
                {amount}
              </button>
            ))}
          </div>
          <input
            className="mt-3 w-full border border-line bg-ink px-3 py-3 text-sand"
            inputMode="decimal"
            placeholder="Custom amount"
            value={amountUsd}
            onChange={(event) => {
              setAmountUsd(event.target.value);
              setReceipt(null);
            }}
          />
        </fieldset>
        {activeMode === "invoice" ? (
          <label className="block text-sm text-sand/70 md:col-span-2">
            Invoice number
            <input
              className="mt-2 w-full border border-line bg-ink px-3 py-3 text-sand"
              value={invoiceNumber}
              onChange={(event) => {
                setInvoiceNumber(event.target.value);
                setReceipt(null);
              }}
              required
            />
            {parsedInvoice === null ? <span className="mt-2 block text-sand/55">{copy.invoiceRequired}</span> : null}
          </label>
        ) : null}
      </div>

      {native ? (
        <p className="mt-4 text-sm text-sand/75">
          <span className="tracking-[0.16em] text-gold-2 uppercase">{copy.estimateLabel}</span>
          {estimate ? ` ${estimate} ${activeToken}` : quoteMissing ? " unavailable" : " …"}
          {". "}
          {copy.stablecoinRecommendation}
        </p>
      ) : (
        <p className="mt-4 text-sm text-sand/75">{copy.stableCredit}</p>
      )}

      {overCap ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-sand/70">
            Name
            <input className="mt-2 w-full border border-line bg-ink px-3 py-3 text-sand" value={payerName} onChange={(event) => setPayerName(event.target.value)} />
          </label>
          <label className="block text-sm text-sand/70">
            Email
            <input className="mt-2 w-full border border-line bg-ink px-3 py-3 text-sand" type="email" value={payerEmail} onChange={(event) => setPayerEmail(event.target.value)} />
          </label>
          {!contactReady ? <p className="text-sm text-sand/70 md:col-span-2">{copy.contactRequired}</p> : null}
        </div>
      ) : null}

      {shownQr ? (
        <div className="glass-panel mt-8 p-6">
          <p className="text-sm text-sand/70">{shownQr.payment.invoiceNumber ? `Invoice ${shownQr.payment.invoiceNumber}` : config.businessName}</p>
          {/* Generated per invoice as a data URL, so the image optimizer does not apply. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="mt-4" src={shownQr.src} alt="Payment code for the receiving address" width={280} height={280} />
          <p className="mt-4 break-all text-sm text-sand">{shownQr.payment.toAddress}</p>
          <p className="mt-2 text-sm text-sand/70">
            {shownQr.payment.tokenAmount} {shownQr.payment.token}
            {shownQr.payment.estimated ? " (estimate)" : " credited 1:1"}
            {` · ${shownQr.payment.amountUsd} USD`}
          </p>
          <button type="button" className="mt-4 text-[0.68rem] tracking-[0.18em] text-gold-2 uppercase" onClick={() => void copyText(shownQr.payment.toAddress, "Address copied.")}>
            Copy address
          </button>
        </div>
      ) : null}

      <div className="mt-6">
        {config.walletConnect ? (
          <WalletPay
            projectId={config.projectId}
            siteUrl={config.siteUrl}
            businessName={config.businessName}
            solanaRpcUrl={config.solanaRpcUrl}
            canSend={canSend}
            notice={copy.completion}
            onAuthorize={screen}
            onResult={(result) => void onWallet(result)}
          />
        ) : (
          <div className="mt-6">
            <p className="text-sm leading-relaxed text-sand">{copy.completion}</p>
            <div className="mt-4">{payButton}</div>
            <p className="mt-4 text-sm text-sand/60">{copy.walletMissing}</p>
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-sand/60">{copy.sendWarning}</p>
      {message ? (
        <p className="mt-4 text-sm text-sand" role="status">
          {message}
        </p>
      ) : null}

      {receipt ? (
        <div id="payment-receipt" className="glass-panel mt-8 p-6">
          <h2 className="font-serif text-3xl text-sand">Receipt</h2>
          <dl className="mt-4 space-y-2 text-sm text-sand">
            <div>
              <dt className="text-sand/55">Transaction</dt>
              <dd className="break-all">{receipt.txHash}</dd>
            </div>
            <div>
              <dt className="text-sand/55">Network</dt>
              <dd>{chainMeta[receipt.chain].label}</dd>
            </div>
            <div>
              <dt className="text-sand/55">Token</dt>
              <dd>{receipt.token}</dd>
            </div>
            <div>
              <dt className="text-sand/55">Payer</dt>
              <dd className="break-all">{receipt.payerAddress}</dd>
            </div>
            <div>
              <dt className="text-sand/55">USD value</dt>
              <dd>{receipt.amountUsd}</dd>
            </div>
            <div>
              <dt className="text-sand/55">Invoice number</dt>
              <dd>{receipt.invoiceNumber ?? ""}</dd>
            </div>
            <div>
              <dt className="text-sand/55">Time</dt>
              <dd>{receipt.at}</dd>
            </div>
          </dl>
          <p className="mt-4 break-all text-sm">
            <a className="text-gold-2" href={`${chainMeta[receipt.chain].explorerTx}${receipt.txHash}`}>
              View the transfer
            </a>
          </p>
          <div className="mt-4 flex gap-4">
            <button type="button" className="text-[0.68rem] tracking-[0.18em] text-gold-2 uppercase" onClick={() => void copyText(formatReceipt(receipt), "Receipt copied.")}>
              Copy receipt
            </button>
            <button type="button" className="text-[0.68rem] tracking-[0.18em] text-gold-2 uppercase" onClick={() => window.print()}>
              Print receipt
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-10 border-t border-line pt-6 text-sm text-sand/65">
        <p>Card checkout is a hosted link only. This page does not collect card numbers or identity documents.</p>
        {config.fiat.stripe || config.fiat.coinbase ? (
          <p className="mt-3 flex flex-wrap gap-4">
            {config.fiat.stripe ? (
              <a className="text-gold-2" href={config.fiat.stripe}>
                Stripe payment link
              </a>
            ) : null}
            {config.fiat.coinbase ? (
              <a className="text-gold-2" href={config.fiat.coinbase}>
                Coinbase Commerce
              </a>
            ) : null}
          </p>
        ) : (
          <p className="mt-3">Card checkout is not configured.</p>
        )}
      </div>
    </section>
  );
}

function formatReceipt(receipt: PaymentReceipt): string {
  return [
    `Transaction ${receipt.txHash}`,
    `Network ${chainMeta[receipt.chain].label}`,
    `Token ${receipt.token}`,
    `Payer ${receipt.payerAddress}`,
    `USD value ${receipt.amountUsd}`,
    `Invoice number ${receipt.invoiceNumber ?? ""}`,
    `Time ${receipt.at}`,
  ].join("\n");
}
