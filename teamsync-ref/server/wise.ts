const WISE_BASE = "https://api.wise.com";

function wiseHeaders(): Record<string, string> {
  const key = process.env.WISE_API_KEY;
  if (!key) {
    console.warn("[wise] WISE_API_KEY not set");
    return {};
  }
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

export interface WiseProfile {
  id: number;
  type: "PERSONAL" | "BUSINESS";
  details: {
    name?: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    businessRegistrationNumber?: string;
  };
}

export interface WiseBalance {
  id: number;
  currency: string;
  amount: { value: number; currency: string };
  reservedAmount: { value: number; currency: string };
  bankDetails?: { id: number };
}

export interface WiseTransfer {
  id: number;
  reference?: string;
  status: string;
  sourceCurrency: string;
  sourceValue: number;
  targetCurrency: string;
  targetValue: number;
  created: string;
  details?: { reference?: string };
  targetAccount?: number;
}

export async function getWiseProfiles(): Promise<WiseProfile[]> {
  try {
    const res = await fetch(`${WISE_BASE}/v2/profiles`, { headers: wiseHeaders() });
    if (!res.ok) {
      console.error(`[wise] getWiseProfiles ${res.status}: ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("[wise] getWiseProfiles error:", err);
    return [];
  }
}

export async function getWiseBalances(profileId: number): Promise<WiseBalance[]> {
  try {
    const res = await fetch(
      `${WISE_BASE}/v4/profiles/${profileId}/balances?types=STANDARD`,
      { headers: wiseHeaders() }
    );
    if (!res.ok) {
      console.error(`[wise] getWiseBalances ${res.status}: ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("[wise] getWiseBalances error:", err);
    return [];
  }
}

export async function getWiseTransfers(profileId: number, limit = 50): Promise<WiseTransfer[]> {
  try {
    const res = await fetch(
      `${WISE_BASE}/v1/transfers?profile=${profileId}&limit=${limit}`,
      { headers: wiseHeaders() }
    );
    if (!res.ok) {
      console.error(`[wise] getWiseTransfers ${res.status}: ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.content ?? []);
  } catch (err) {
    console.error("[wise] getWiseTransfers error:", err);
    return [];
  }
}

export async function getWiseSummary(): Promise<{
  profile: WiseProfile | null;
  balances: WiseBalance[];
}> {
  const profiles = await getWiseProfiles();
  if (profiles.length === 0) return { profile: null, balances: [] };

  const profile =
    profiles.find((p) => p.type === "BUSINESS") ?? profiles[0];
  const balances = await getWiseBalances(profile.id);
  return { profile, balances };
}
