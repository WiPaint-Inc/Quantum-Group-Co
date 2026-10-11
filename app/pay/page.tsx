import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { company } from "@/content/site";
import { paymentsEnabled } from "@/lib/flags";
import { PayPanel, type PayPanelConfig } from "@/src/features/crypto-pay/PayPanel";
import { copy } from "@/src/features/crypto-pay/copy";
import { readPayEnv, reownReady } from "@/src/features/crypto-pay/config";
import { profileConfigured, sharedProfileAddresses } from "@/src/features/crypto-pay/validate";

export const metadata: Metadata = {
  title: "Pay",
  description: "Pay a Quantum Group Co invoice from your own wallet. Payments stay off until the company turns them on.",
};

export default function PayPage() {
  if (!paymentsEnabled()) notFound();
  return (
    <main id="content" className="px-6 pt-32 pb-24 md:px-14">
      <p className="kicker">{company.name}</p>
      <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.92] text-sand sm:text-7xl">Pay deposit / invoice</h1>
      <p className="mt-6 max-w-2xl text-lg text-sand/80">Deposits and invoices only. This page does not list a price for a house.</p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-sand/70">{copy.nonCustodial}</p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-sand/60">{copy.antigua}</p>
      <Suspense fallback={<p className="mt-10 text-sand/70">Checking whether payments are enabled.</p>}>
        <PayDesk />
      </Suspense>
    </main>
  );
}

async function PayDesk() {
  await connection();
  const env = readPayEnv();
  const shared = sharedProfileAddresses(env).length > 0;
  const quantum = env.profiles.quantum;
  const config: PayPanelConfig = {
    businessName: quantum.businessName,
    profileId: "quantum",
    modes: ["invoice"],
    enabled: env.paymentsEnabled,
    configured: profileConfigured(env, "quantum"),
    sharedAddresses: shared,
    sanctions: env.sanctionsApiUrl ? "configured" : "passthrough",
    walletConnect: reownReady(env.reownProjectId),
    projectId: reownReady(env.reownProjectId) ? env.reownProjectId : "",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://quantum-group.example",
    solanaRpcUrl: env.solanaRpcUrl,
    presets: [...env.presetAmountsUsd],
    anonymousTipCapUsd: env.anonymousTipCapUsd,
    fiat: env.fiat,
  };

  return (
    <>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-sand/60">{config.sanctions === "configured" ? copy.sanctionsConfigured : copy.sanctionsPassthrough}</p>
      <PayPanel config={config} />
    </>
  );
}
