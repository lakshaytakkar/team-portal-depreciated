import type { Express } from "express";
import { createServer, type Server } from "http";
import { aiChatRouter } from "./ai-chat";
import { imageGenRouter } from "./image-gen";
import { devProjectsRouter } from "./dev-projects";
import { legalnationsRouter } from "./legalnations-api";
import { etsRouter } from "./ets-api";
import { etsPortalRouter } from "./ets-portal-api";
import { triphqRouter } from "./triphq-api";
import { registerFaireRoutes } from "./routes/faire.routes";
import { registerWiseRoutes } from "./routes/wise.routes";
import { registerCoreRoutes } from "./routes/core.routes";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  registerFaireRoutes(app);
  registerWiseRoutes(app);
  registerCoreRoutes(app);

  app.use("/api/ai", aiChatRouter);
  app.use("/api/images", imageGenRouter);
  app.use("/api/dev", devProjectsRouter);
  app.use("/api/legalnations", legalnationsRouter);
  app.use("/api/ets", etsRouter);
  app.use("/api/ets-portal", etsPortalRouter);
  app.use("/api/triphq", triphqRouter);

  return httpServer;
}
