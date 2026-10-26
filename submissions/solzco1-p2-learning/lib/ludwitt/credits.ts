import { ludwitt } from "@/lib/config";

export type CreditBalance = {
  balanceCents: number;
  spendableCents: number;
};

export async function fetchCreditBalance(
  accessToken: string
): Promise<CreditBalance | null> {
  const res = await fetch(`${ludwitt.apiBase}/api/v1/credits/balance`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as CreditBalance;
  return data;
}

export const LUDWITT_TOP_UP_URL = "https://pitchrise.ludwitt.com/account/credits";
