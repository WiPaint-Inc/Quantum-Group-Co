"use client";

import { useAppKit, useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import type { Provider as SolanaProvider } from "@reown/appkit-utils/solana";
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react";
import { useSendTransaction, useSwitchChain, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { ensurePayAppKit } from "./appkit";
import { chainMeta, erc20TransferAbi, solanaMints, tokenContracts } from "./tokens";
import type { SettledPayment } from "./types";
import { toBaseUnits } from "./validate";

export type WalletResult = { ok: true; hash: string; from: string } | { ok: false; message: string };

export function WalletPay({
  projectId,
  siteUrl,
  solanaRpcUrl,
  canSend,
  onAuthorize,
  onResult,
}: {
  projectId: string;
  siteUrl: string;
  solanaRpcUrl: string;
  canSend: boolean;
  onAuthorize: () => Promise<{ ok: true; payment: SettledPayment } | { ok: false; message: string }>;
  onResult: (result: WalletResult) => void;
}) {
  const config = ensurePayAppKit(projectId, siteUrl);
  const { open } = useAppKit();
  const evm = useAppKitAccount({ namespace: "eip155" });
  const sol = useAppKitAccount({ namespace: "solana" });
  const { walletProvider } = useAppKitProvider<SolanaProvider>("solana");
  const { switchChainAsync } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!canSend || busy) return;
    setBusy(true);
    try {
      const authorized = await onAuthorize();
      if (!authorized.ok) {
        onResult(authorized);
        return;
      }
      const payment = authorized.payment;
      const result = payment.chain === "solana"
        ? await sendSolana(payment, walletProvider, sol.address, solanaRpcUrl)
        : await sendEvm(payment, config, evm.address, switchChainAsync, sendTransactionAsync, writeContractAsync);
      onResult(result);
    } catch (error) {
      onResult({ ok: false, message: error instanceof Error ? error.message : "The wallet did not send." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 flex flex-wrap gap-4">
      <button type="button" className="border border-line px-4 py-3 text-[0.68rem] tracking-[0.18em] text-sand uppercase" onClick={() => void open()}>
        Connect wallet
      </button>
      <button type="button" className="border border-gold px-4 py-3 text-[0.68rem] tracking-[0.18em] text-sand uppercase disabled:opacity-40" disabled={!canSend || busy} onClick={() => void send()}>
        {busy ? "Waiting for wallet" : "Send from wallet"}
      </button>
      <p className="w-full text-sm text-sand/55">
        {evm.address ? `EVM ${evm.address}` : "No EVM wallet connected."}
        {" "}
        {sol.address ? `Solana ${sol.address}` : "No Solana wallet connected."}
      </p>
    </div>
  );
}

async function sendEvm(
  payment: SettledPayment,
  config: ReturnType<typeof ensurePayAppKit>,
  from: string | undefined,
  switchChainAsync: ReturnType<typeof useSwitchChain>["switchChainAsync"],
  sendTransactionAsync: ReturnType<typeof useSendTransaction>["sendTransactionAsync"],
  writeContractAsync: ReturnType<typeof useWriteContract>["writeContractAsync"],
): Promise<WalletResult> {
  if (!from || !from.startsWith("0x")) return { ok: false, message: "Connect an Ethereum or Base wallet first." };
  const chainId = chainMeta[payment.chain].chainId;
  if (!chainId) return { ok: false, message: "That network is not an EVM network." };
  await switchChainAsync({ chainId });
  const units = toBaseUnits(payment.tokenAmount, payment.decimals);
  const hash = payment.token === "ETH"
    ? await sendTransactionAsync({ to: payment.toAddress as `0x${string}`, value: units, chainId })
    : await writeContractAsync({
        address: tokenContract(payment),
        abi: erc20TransferAbi,
        functionName: "transfer",
        args: [payment.toAddress as `0x${string}`, units],
        chainId,
      });
  await waitForTransactionReceipt(config, { hash, chainId });
  return { ok: true, hash, from };
}

function tokenContract(payment: SettledPayment): `0x${string}` {
  if (payment.chain === "solana" || payment.token === "ETH" || payment.token === "SOL") {
    throw new Error("That token is not an EVM contract transfer.");
  }
  return tokenContracts[payment.chain][payment.token].address;
}

async function sendSolana(payment: SettledPayment, provider: SolanaProvider | undefined, from: string | undefined, rpcUrl: string): Promise<WalletResult> {
  if (!provider || !from) return { ok: false, message: "Connect a Solana wallet first." };
  const connection = new Connection(rpcUrl, "confirmed");
  const payer = new PublicKey(from);
  const recipient = new PublicKey(payment.toAddress);
  const transaction = new Transaction();
  const units = toBaseUnits(payment.tokenAmount, payment.decimals);
  if (payment.token === "SOL") {
    transaction.add(SystemProgram.transfer({ fromPubkey: payer, toPubkey: recipient, lamports: units }));
  } else if (payment.token === "USDC" || payment.token === "USDT") {
    const mint = new PublicKey(solanaMints[payment.token]);
    const source = await getAssociatedTokenAddress(mint, payer);
    const destination = await getAssociatedTokenAddress(mint, recipient);
    try {
      await getAccount(connection, destination);
    } catch {
      transaction.add(createAssociatedTokenAccountInstruction(payer, destination, recipient, mint));
    }
    transaction.add(createTransferInstruction(source, destination, payer, units));
  } else {
    return { ok: false, message: "That token is not available on Solana." };
  }
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = payer;
  const hash = await provider.sendTransaction(transaction, connection);
  await connection.confirmTransaction({ signature: hash, blockhash, lastValidBlockHeight }, "confirmed");
  return { ok: true, hash, from };
}
