/** This site accepts invoice payments on the quantum profile only. */
export function sitePaymentAllowed(mode: string, profileId: string): boolean {
  return mode === "invoice" && profileId === "quantum";
}
