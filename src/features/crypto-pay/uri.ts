import { tokenContracts, solanaMints } from "./tokens";
import type { SettledPayment } from "./types";
import { toBaseUnits } from "./validate";

export function buildPaymentUri(payment: SettledPayment): string {
  const amount = toBaseUnits(payment.tokenAmount, payment.decimals);
  const memo = payment.invoiceNumber ? `Invoice ${payment.invoiceNumber}` : "Voluntary tip";
  if (payment.chain === "solana") {
    const params = new URLSearchParams({
      amount: payment.tokenAmount,
      label: "Quantum Group Co",
      message: memo,
    });
    if (payment.token === "USDC" || payment.token === "USDT") params.set("spl-token", solanaMints[payment.token]);
    return `solana:${payment.toAddress}?${params.toString()}`;
  }
  const chainId = payment.chain === "base" ? 8453 : 1;
  if (payment.token === "ETH") {
    return `ethereum:${payment.toAddress}@${chainId}?value=${amount.toString()}`;
  }
  if (payment.token !== "USDC" && payment.token !== "USDT") {
    throw new Error("That token is not available on this network.");
  }
  const contract = tokenContracts[payment.chain][payment.token].address;
  return `ethereum:${contract}@${chainId}/transfer?address=${payment.toAddress}&uint256=${amount.toString()}`;
}
