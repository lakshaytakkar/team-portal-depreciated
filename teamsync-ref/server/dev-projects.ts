import { Router } from "express";
import { db } from "./db";
import { devProjects, devTasks, devSubtasks, devComments } from "@shared/schema";
import { eq, desc, asc, and, sql } from "drizzle-orm";

export const devProjectsRouter = Router();

devProjectsRouter.get("/projects", async (_req, res) => {
  try {
    const projects = await db.select().from(devProjects).orderBy(asc(devProjects.name));

    const taskCounts = await db
      .select({
        projectId: devTasks.projectId,
        total: sql<number>`count(*)::int`,
        completed: sql<number>`count(*) filter (where ${devTasks.status} = 'done')::int`,
      })
      .from(devTasks)
      .groupBy(devTasks.projectId);

    const countMap = new Map(taskCounts.map(c => [c.projectId, { total: c.total, completed: c.completed }]));

    const result = projects.map(p => ({
      ...p,
      taskCount: countMap.get(p.id)?.total ?? 0,
      completedTaskCount: countMap.get(p.id)?.completed ?? 0,
    }));

    res.json(result);
  } catch (err: any) {
    console.error("[dev-projects] list error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

devProjectsRouter.get("/projects/:id", async (req, res) => {
  try {
    const [project] = await db.select().from(devProjects).where(eq(devProjects.id, req.params.id));
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

devProjectsRouter.post("/projects", async (req, res) => {
  try {
    const [project] = await db.insert(devProjects).values(req.body).returning();
    res.status(201).json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

devProjectsRouter.patch("/projects/:id", async (req, res) => {
  try {
    const [project] = await db
      .update(devProjects)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(devProjects.id, req.params.id))
      .returning();
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

devProjectsRouter.delete("/projects/:id", async (req, res) => {
  try {
    await db.delete(devProjects).where(eq(devProjects.id, req.params.id));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

devProjectsRouter.get("/projects/:id/tasks", async (req, res) => {
  try {
    const tasks = await db
      .select()
      .from(devTasks)
      .where(eq(devTasks.projectId, req.params.id))
      .orderBy(desc(devTasks.createdAt));
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

devProjectsRouter.get("/tasks", async (req, res) => {
  try {
    const tasks = await db.select().from(devTasks).orderBy(desc(devTasks.createdAt));
    res.json(tasks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

devProjectsRouter.get("/tasks/:id", async (req, res) => {
  try {
    const [task] = await db.select().from(devTasks).where(eq(devTasks.id, req.params.id));
    if (!task) return res.status(404).json({ error: "Task not found" });

    const subtasks = await db
      .select()
      .from(devSubtasks)
      .where(eq(devSubtasks.taskId, req.params.id))
      .orderBy(asc(devSubtasks.sortOrder));

    const comments = await db
      .select()
      .from(devComments)
      .where(eq(devComments.taskId, req.params.id))
      .orderBy(desc(devComments.createdAt));

    res.json({ ...task, subtasks, comments });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

devProjectsRouter.post("/tasks", async (req, res) => {
  try {
    const [task] = await db.insert(devTasks).values(req.body).returning();
    res.status(201).json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

devProjectsRouter.patch("/tasks/:id", async (req, res) => {
  try {
    const [task] = await db
      .update(devTasks)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(devTasks.id, req.params.id))
      .returning();
    res.json(task);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

devProjectsRouter.delete("/tasks/:id", async (req, res) => {
  try {
    await db.delete(devTasks).where(eq(devTasks.id, req.params.id));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

devProjectsRouter.post("/tasks/:id/subtasks", async (req, res) => {
  try {
    const [sub] = await db.insert(devSubtasks).values({ ...req.body, taskId: req.params.id }).returning();
    res.status(201).json(sub);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

devProjectsRouter.patch("/subtasks/:id", async (req, res) => {
  try {
    const [sub] = await db
      .update(devSubtasks)
      .set(req.body)
      .where(eq(devSubtasks.id, req.params.id))
      .returning();
    res.json(sub);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

devProjectsRouter.post("/reseed", async (_req, res) => {
  try {
    const { seedDevData } = await import("./dev-seed");
    await seedDevData(true);
    res.json({ ok: true, message: "Database reseeded successfully" });
  } catch (err: any) {
    console.error("[dev-projects] reseed error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

devProjectsRouter.post("/tasks/:id/comments", async (req, res) => {
  try {
    const [comment] = await db.insert(devComments).values({ ...req.body, taskId: req.params.id }).returning();
    res.status(201).json(comment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
