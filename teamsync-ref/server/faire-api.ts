const FAIRE_API_BASE = "https://www.faire.com/external-api/v2";

export interface FaireStoreCreds {
  oauth_access_token: string;
  app_credentials: string;
}

async function faireGet(
  path: string,
  creds: FaireStoreCreds,
  params?: Record<string, string>
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const url = new URL(`${FAIRE_API_BASE}${path}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    }
  }
  const res = await fetch(url.toString(), {
    headers: {
      "X-FAIRE-OAUTH-ACCESS-TOKEN": creds.oauth_access_token,
      "X-FAIRE-APP-CREDENTIALS": creds.app_credentials,
      "Content-Type": "application/json",
    },
  });
  let data: unknown = null;
  try { data = await res.json(); } catch { data = null; }
  return { ok: res.ok, status: res.status, data };
}

export async function fetchBrandProfile(creds: FaireStoreCreds): Promise<unknown> {
  const result = await faireGet("/brands/profile", creds);
  if (!result.ok) throw new Error(`Faire brand profile error ${result.status}`);
  return result.data;
}

export async function fetchAllOrders(creds: FaireStoreCreds): Promise<unknown[]> {
  const all: unknown[] = [];
  let page = 1;
  let cursor: string | undefined;

  while (true) {
    const params: Record<string, string> = { limit: "50" };
    if (cursor) {
      params.cursor = cursor;
    } else {
      params.page = String(page);
    }

    const result = await faireGet("/orders", creds, params);
    if (!result.ok) {
      console.error(`[faire-api] fetchAllOrders error ${result.status}`);
      break;
    }

    const d = result.data as Record<string, unknown>;
    const orders = (d?.orders as unknown[]) ?? [];
    all.push(...orders);

    const nextCursor = d?.cursor as string | undefined;
    if (!nextCursor || orders.length === 0) break;
    cursor = nextCursor;
    page++;
  }

  return all;
}

export async function fetchAllProducts(creds: FaireStoreCreds): Promise<unknown[]> {
  const all: unknown[] = [];
  let page = 1;
  let cursor: string | undefined;

  while (true) {
    const params: Record<string, string> = { limit: "50" };
    if (cursor) {
      params.cursor = cursor;
    } else {
      params.page = String(page);
    }

    const result = await faireGet("/products", creds, params);
    if (!result.ok) {
      console.error(`[faire-api] fetchAllProducts error ${result.status}`);
      break;
    }

    const d = result.data as Record<string, unknown>;
    const products = (d?.products as unknown[]) ?? [];
    all.push(...products);

    const nextCursor = d?.cursor as string | undefined;
    if (!nextCursor || products.length === 0) break;
    cursor = nextCursor;
    page++;
  }

  return all;
}

async function fairePatch(
  path: string,
  creds: FaireStoreCreds,
  body: object
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const url = `${FAIRE_API_BASE}${path}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "X-FAIRE-OAUTH-ACCESS-TOKEN": creds.oauth_access_token,
      "X-FAIRE-APP-CREDENTIALS": creds.app_credentials,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  let data: unknown = null;
  try { data = await res.json(); } catch { data = null; }
  return { ok: res.ok, status: res.status, data };
}

export async function fetchProduct(
  creds: FaireStoreCreds,
  productId: string
): Promise<unknown | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const result = await faireGet(`/products/${productId}`, creds);
    if (result.ok) return result.data;
    if (result.status === 404) return null;
    if (result.status === 429) {
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      continue;
    }
    console.error(`[faire-api] fetchProduct ${productId} error ${result.status}`);
    return null;
  }
  return null;
}

export async function updateVariantInventory(
  creds: FaireStoreCreds,
  productId: string,
  variantId: string,
  availableQuantity: number
): Promise<{ ok: boolean; status: number; data: unknown }> {
  return fairePatch(
    `/products/${productId}/variants/${variantId}`,
    creds,
    { available_quantity: availableQuantity }
  );
}

export async function fetchRetailerProfile(
  creds: FaireStoreCreds,
  retailerId: string
): Promise<unknown | null> {
  const result = await faireGet(`/retailers/${retailerId}`, creds);
  if (!result.ok) {
    if (result.status === 404) return null;
    console.error(`[faire-api] fetchRetailer ${retailerId} error ${result.status}`);
    return null;
  }
  return result.data;
}
