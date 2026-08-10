import { ludwittFetch } from "./client";

export async function putDocument(
  accessToken: string,
  collection: string,
  docId: string,
  data: Record<string, unknown>,
) {
  const response = await ludwittFetch(`/api/v1/data/${collection}/${docId}`, {
    method: "PUT",
    accessToken,
    body: JSON.stringify({ data }),
  });
  return response.json();
}

export async function listDocuments(
  accessToken: string,
  collection: string,
  opts: {
    limit?: number;
    cursor?: string;
    where?: string;
    orderBy?: string;
  } = {},
) {
  const params = new URLSearchParams();
  params.set("limit", String(opts.limit ?? 50));
  if (opts.cursor) params.set("cursor", opts.cursor);
  if (opts.where) params.set("where", opts.where);
  if (opts.orderBy) params.set("orderBy", opts.orderBy);

  const response = await ludwittFetch(
    `/api/v1/data/${collection}?${params.toString()}`,
    { accessToken },
  );
  return response.json() as Promise<{
    docs: Array<{
      docId: string;
      data: Record<string, unknown>;
      updatedAt?: string;
    }>;
    nextCursor: string | null;
  }>;
}

export async function getCreditsBalance(accessToken: string) {
  const response = await ludwittFetch("/api/v1/credits/balance", {
    accessToken,
  });
  return response.json() as Promise<{
    spendableCents: number;
    spendableFormatted: string;
    balanceCents: number;
    balanceFormatted: string;
  }>;
}

export async function aiMessages(
  accessToken: string,
  body: {
    model: string;
    max_tokens: number;
    system?: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
  },
) {
  const response = await ludwittFetch("/api/v1/ai/messages", {
    method: "POST",
    accessToken,
    body: JSON.stringify(body),
  });
  return response.json() as Promise<{
    content: Array<{ type: string; text?: string }>;
    "x-ludwitt-credits"?: {
      chargedCostCents: number;
      newBalanceCents: number;
      transactionId: string;
    };
  }>;
}
