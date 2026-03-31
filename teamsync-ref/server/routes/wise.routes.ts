import type { Express } from "express";
import { getWiseSummary, getWiseTransfers, getWiseProfiles } from "../wise";

export function registerWiseRoutes(app: Express): void {
  app.get("/api/wise/summary", async (_req, res) => {
    try {
      const { profile, balances } = await getWiseSummary();
      return res.json({ profile, balances, lastSynced: new Date().toISOString() });
    } catch {
      return res.status(500).json({ error: "Failed to fetch Wise summary" });
    }
  });

  app.get("/api/wise/transfers", async (_req, res) => {
    try {
      const profiles = await getWiseProfiles();
      if (profiles.length === 0) return res.json({ transfers: [] });
      const profile = profiles.find((p) => p.type === "BUSINESS") ?? profiles[0];
      const transfers = await getWiseTransfers(profile.id);
      return res.json({ transfers });
    } catch {
      return res.status(500).json({ error: "Failed to fetch Wise transfers" });
    }
  });

  app.get("/api/wise/sync", async (_req, res) => {
    try {
      const { profile, balances } = await getWiseSummary();
      return res.json({ profile, balances, lastSynced: new Date().toISOString() });
    } catch {
      return res.status(500).json({ error: "Failed to sync Wise data" });
    }
  });
}
