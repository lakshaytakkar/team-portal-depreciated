import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function supabaseInsert(table: string, rows: any[]) {
  const batchSize = 50;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(batch),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error(`Insert error for ${table} batch ${i}:`, err);
      throw new Error(`Insert failed: ${err}`);
    }
    inserted += batch.length;
    process.stdout.write(`  ${table}: ${inserted}/${rows.length}\r`);
  }
  console.log(`  ${table}: ${inserted} rows inserted`);
  return inserted;
}

async function supabaseQuery(table: string, select = "*", filters = "") {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}${filters}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Query failed: ${await res.text()}`);
  return res.json();
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    if (vals.length < 3) continue;
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (vals[idx] || "").trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseCurrency(val: string): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[₹,\s]/g, "")) || 0;
}

function normalizePlan(plan: string): string {
  const p = (plan || "").trim().toLowerCase();
  if (p.includes("elite")) return "Elite";
  if (p.includes("basic") || p === "llc") return "Basic";
  if (p.includes("community")) return "Community";
  return "Elite";
}

const LLC_STATUSES = [
  "LLC Booked", "Onboarded", "LLC Under Formation", "Under EIN",
  "Under Website Formation", "EIN received", "Received EIN Letter",
  "Under BOI", "Under Banking", "Under Payment Gateway",
  "Ready to Deliver", "Delivered", "Refunded",
];

function normalizeLLCStatus(status: string): string {
  if (!status) return "LLC Booked";
  const s = status.trim();
  const found = LLC_STATUSES.find((ls) => ls.toLowerCase() === s.toLowerCase());
  if (found) return found;
  if (s.toLowerCase().includes("formation")) return "LLC Under Formation";
  if (s.toLowerCase().includes("ein") && s.toLowerCase().includes("received")) return "EIN received";
  if (s.toLowerCase().includes("ein")) return "Under EIN";
  if (s.toLowerCase().includes("website")) return "Under Website Formation";
  if (s.toLowerCase().includes("bank")) return "Under Banking";
  if (s.toLowerCase().includes("boi")) return "Under BOI";
  if (s.toLowerCase().includes("deliver")) return "Delivered";
  if (s.toLowerCase().includes("refund")) return "Refunded";
  if (s.toLowerCase().includes("payment")) return "Under Payment Gateway";
  return "LLC Booked";
}

function isMonthSeparator(row: Record<string, string>): boolean {
  const clientId = row["Client ID"] || "";
  const clientName = row["Client Name"] || "";
  if (!clientId && !clientName) return true;
  if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{4}$/i.test(clientName)) return true;
  if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{4}$/i.test(clientId)) return true;
  return false;
}

const ONBOARDING_STEPS = [
  { phase: "Onboarding", step_name: "Client onboarded", sort_order: 1 },
  { phase: "Onboarding", step_name: "Documents collected", sort_order: 2 },
  { phase: "Onboarding", step_name: "Onboarding call completed", sort_order: 3 },
  { phase: "Onboarding", step_name: "KYC verification done", sort_order: 4 },
  { phase: "Onboarding", step_name: "Payment confirmed", sort_order: 5 },
  { phase: "Onboarding", step_name: "Client folder created", sort_order: 6 },
  { phase: "Onboarding", step_name: "Welcome email sent", sort_order: 7 },
  { phase: "Legal", step_name: "LLC name approved", sort_order: 8 },
  { phase: "Legal", step_name: "Articles filed with state", sort_order: 9 },
  { phase: "Legal", step_name: "Articles of Organization received", sort_order: 10 },
  { phase: "Legal", step_name: "Operating Agreement drafted", sort_order: 11 },
  { phase: "Legal", step_name: "EIN application submitted", sort_order: 12 },
  { phase: "Legal", step_name: "EIN received", sort_order: 13 },
  { phase: "Legal", step_name: "BOI report filed", sort_order: 14 },
  { phase: "Legal", step_name: "Initial Resolutions signed", sort_order: 15 },
  { phase: "Bank", step_name: "Bank application submitted", sort_order: 16 },
  { phase: "Bank", step_name: "Bank account approved", sort_order: 17 },
  { phase: "Bank", step_name: "Bank credentials received", sort_order: 18 },
  { phase: "Bank", step_name: "Wire details configured", sort_order: 19 },
  { phase: "Bank", step_name: "Payment gateway applied", sort_order: 20 },
  { phase: "Bank", step_name: "Payment gateway approved", sort_order: 21 },
  { phase: "Bank", step_name: "Website domain purchased", sort_order: 22 },
  { phase: "Bank", step_name: "Website launched", sort_order: 23 },
  { phase: "Bank", step_name: "Final delivery to client", sort_order: 24 },
];

function getCompletedSteps(status: string): number {
  const statusMap: Record<string, number> = {
    "LLC Booked": 0,
    "Onboarded": 5,
    "LLC Under Formation": 8,
    "Under EIN": 11,
    "EIN received": 13,
    "Received EIN Letter": 13,
    "Under BOI": 14,
    "Under Website Formation": 15,
    "Under Banking": 16,
    "Under Payment Gateway": 20,
    "Ready to Deliver": 23,
    "Delivered": 24,
    "Refunded": 0,
  };
  return statusMap[status] || 0;
}

async function seedClients() {
  const oldCSV = fs.readFileSync(
    path.join(process.cwd(), "attached_assets", "Index_-_LLC_Clients_-_Index_(1)_1772888724965.csv"),
    "utf-8"
  );
  const newCSV = fs.readFileSync(
    path.join(process.cwd(), "attached_assets", "Index_-_LLC_Clients_(_New_)_-_Sheet1_1772888724964.csv"),
    "utf-8"
  );

  const oldRows = parseCSV(oldCSV);
  const newRows = parseCSV(newCSV);

  console.log(`Parsed ${oldRows.length} old rows, ${newRows.length} new rows`);

  const clients: any[] = [];
  const seen = new Set<string>();

  for (const row of [...oldRows, ...newRows]) {
    if (isMonthSeparator(row)) continue;
    const clientCode = (row["Client ID"] || "").trim();
    if (!clientCode || !clientCode.startsWith("SUPLLC")) continue;
    if (seen.has(clientCode)) continue;
    seen.add(clientCode);

    const client = {
      client_code: clientCode,
      client_name: (row["Client Name"] || "").trim(),
      email: (row["Email"] || "").trim() || null,
      contact_number: (row["Contact Number"] || "").trim() || null,
      country: (row["Country"] || "India").trim(),
      plan: normalizePlan(row["Plan"] || ""),
      website_included: (row["Website included?"] || "Yes").trim().toLowerCase() === "yes",
      client_health: (row["Client Health"] || "").trim() || null,
      llc_name: (row["LLC Name"] || "").trim() || null,
      llc_status: normalizeLLCStatus(row["LLC Status"] || ""),
      date_of_payment: (row["Date of Payment"] || "").trim() || null,
      date_of_onboarding: (row["Date of Onboarding"] || "").trim() || null,
      date_of_onboarding_call: (row["Date of Onboarding Call"] || "").trim() || null,
      date_of_document_submission: (row["Date of Document Submission"] || "").trim() || null,
      date_of_closing: (row["Date of Closing"] || "").trim() || null,
      amount_received: parseCurrency(row["Amount received so far"] || "0"),
      remaining_payment: parseCurrency(row["Remaining Payment"] || "0"),
      bank_name: (row["Name of Bank Approved"] || "").trim() || null,
      notes: (row["Additional Notes"] || row["Addiotional Notes"] || "").trim() || null,
    };

    if (client.client_name) clients.push(client);
  }

  console.log(`Seeding ${clients.length} clients...`);
  await supabaseInsert("ln_clients", clients);
  return clients.length;
}

async function seedChecklist() {
  const clients: any[] = await supabaseQuery("ln_clients", "id,llc_status");
  console.log(`Creating checklist for ${clients.length} clients...`);

  const allItems: any[] = [];
  for (const client of clients) {
    const completed = getCompletedSteps(client.llc_status);
    for (const step of ONBOARDING_STEPS) {
      const isComplete = step.sort_order <= completed;
      allItems.push({
        client_id: client.id,
        phase: step.phase,
        step_name: step.step_name,
        is_completed: isComplete,
        completed_at: isComplete ? new Date().toISOString() : null,
        sort_order: step.sort_order,
      });
    }
  }

  console.log(`Seeding ${allItems.length} checklist items...`);
  await supabaseInsert("ln_onboarding_checklist", allItems);
  return allItems.length;
}

function parseDate(val: string): string | null {
  if (!val) return null;
  const parts = val.split("/");
  if (parts.length === 3) {
    const [d, m, y] = parts;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

async function seedTaxFilings() {
  const csvContent = fs.readFileSync(
    path.join(process.cwd(), "attached_assets", "USA_Tax_filing_2025_-_Final_Sheet_1772888747739.csv"),
    "utf-8"
  );
  const rows = parseCSV(csvContent);
  console.log(`Parsed ${rows.length} tax filing rows`);

  const clients: any[] = await supabaseQuery("ln_clients", "id,llc_name,email");

  const filings: any[] = [];
  for (const row of rows) {
    const llcName = (row["LLC Name"] || "").trim();
    if (!llcName) continue;

    const matchClient = clients.find(
      (c: any) =>
        (c.llc_name && c.llc_name.toLowerCase() === llcName.toLowerCase()) ||
        (c.email && row["Email Address"] && c.email.toLowerCase() === row["Email Address"].trim().toLowerCase())
    );

    filings.push({
      client_id: matchClient?.id || null,
      llc_name: llcName,
      llc_type: (row["LLC Type"] || "").trim() || null,
      amount_received: parseCurrency(row["Amount Received"] || "0"),
      main_entity_name: (row["Main Entity Name"] || "").trim() || null,
      contact_details: (row["Contact Details"] || "").trim() || null,
      address: (row["Address"] || "").trim() || null,
      email_address: (row["Email Address"] || "").trim() || null,
      status: (row["Status"] || "Not Started").trim(),
      date_of_formation: parseDate(row["Date of Formation"] || ""),
      notes: (row["Notes"] || "").trim() || null,
      bank_transactions_count: parseInt(row["No. of Transactions in Bank"] || "0") || 0,
    });
  }

  console.log(`Seeding ${filings.length} tax filings...`);
  await supabaseInsert("ln_tax_filings", filings);
  return filings.length;
}

async function main() {
  console.log("=== LegalNations Seeder ===");
  console.log(`Target: ${SUPABASE_URL}`);

  const existing = await supabaseQuery("ln_clients", "id", "&limit=1");
  if (existing.length > 0) {
    console.log("Data already exists, clearing tables first...");
    for (const table of ["ln_onboarding_checklist", "ln_client_documents", "ln_client_credentials", "ln_tax_filings", "ln_clients"]) {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=neq.impossible`, {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: "return=minimal",
        },
      });
      if (res.ok) console.log(`  Cleared ${table}`);
      else console.log(`  Clear ${table}: ${res.status} ${await res.text()}`);
    }
  }

  const clientCount = await seedClients();
  const checklistCount = await seedChecklist();
  const taxCount = await seedTaxFilings();

  console.log("\n=== Seeding Complete ===");
  console.log(`Clients: ${clientCount}`);
  console.log(`Checklist items: ${checklistCount}`);
  console.log(`Tax filings: ${taxCount}`);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
