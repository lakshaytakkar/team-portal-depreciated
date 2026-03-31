import type { Express } from "express";
import multer from "multer";
import {
  getVerticals,
  getVertical,
  getUsers,
  getUser,
  getCoreTasksByVertical,
  getCoreTask,
  createCoreTask,
  updateCoreTask,
  deleteCoreTask,
  getCoreSubtasks,
  upsertCoreSubtask,
  deleteCoreSubtask,
  toggleCoreSubtask,
  getChannelsByVertical,
  createChannel,
  updateChannel,
  archiveChannel,
  findOrCreateDM,
  getChannelMessages,
  createChannelMessage,
  editMessage,
  deleteMessage,
  toggleReaction,
  markChannelRead,
  getUnreadCount,
  getCoreResources,
  createCoreResource,
  deleteCoreResource,
  getCoreContacts,
  createCoreContact,
  updateCoreContact,
  deleteCoreContact,
  getCoreNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  seedNotifications,
  getCoreTickets,
  getCoreTicket,
  createCoreTicket,
  updateCoreTicket,
  deleteCoreTicket,
  uploadChatFile,
} from "../supabase";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

export function registerCoreRoutes(app: Express): void {
  // Verticals
  app.get("/api/core/verticals", async (_req, res) => {
    try { return res.json(await getVerticals()); }
    catch { return res.status(500).json({ error: "Failed to fetch verticals" }); }
  });

  app.get("/api/core/verticals/:id", async (req, res) => {
    try {
      const v = await getVertical(req.params.id);
      if (!v) return res.status(404).json({ error: "Not found" });
      return res.json(v);
    } catch { return res.status(500).json({ error: "Failed to fetch vertical" }); }
  });

  // Users
  app.get("/api/core/users", async (req, res) => {
    try { return res.json(await getUsers(req.query.verticalId as string | undefined)); }
    catch { return res.status(500).json({ error: "Failed to fetch users" }); }
  });

  app.get("/api/core/users/:id", async (req, res) => {
    try {
      const u = await getUser(req.params.id);
      if (!u) return res.status(404).json({ error: "Not found" });
      return res.json(u);
    } catch { return res.status(500).json({ error: "Failed to fetch user" }); }
  });

  // Tasks
  app.get("/api/core/tasks", async (req, res) => {
    try { return res.json(await getCoreTasksByVertical(req.query.verticalId as string | undefined)); }
    catch { return res.status(500).json({ error: "Failed to fetch tasks" }); }
  });

  app.get("/api/core/tasks/:id", async (req, res) => {
    try {
      const t = await getCoreTask(req.params.id);
      if (!t) return res.status(404).json({ error: "Not found" });
      return res.json(t);
    } catch { return res.status(500).json({ error: "Failed to fetch task" }); }
  });

  app.post("/api/core/tasks", async (req, res) => {
    try {
      const task = await createCoreTask(req.body);
      if (!task) return res.status(500).json({ error: "Failed to create task" });
      return res.status(201).json(task);
    } catch { return res.status(500).json({ error: "Failed to create task" }); }
  });

  app.patch("/api/core/tasks/:id", async (req, res) => {
    try {
      const task = await updateCoreTask(req.params.id, req.body);
      if (!task) return res.status(500).json({ error: "Failed to update task" });
      return res.json(task);
    } catch { return res.status(500).json({ error: "Failed to update task" }); }
  });

  app.delete("/api/core/tasks/:id", async (req, res) => {
    try {
      const ok = await deleteCoreTask(req.params.id);
      if (!ok) return res.status(500).json({ error: "Failed to delete task" });
      return res.json({ ok: true });
    } catch { return res.status(500).json({ error: "Failed to delete task" }); }
  });

  // Task Subtasks
  app.get("/api/core/tasks/:id/subtasks", async (req, res) => {
    try { return res.json(await getCoreSubtasks(req.params.id)); }
    catch { return res.status(500).json({ error: "Failed to fetch subtasks" }); }
  });

  app.post("/api/core/tasks/:id/subtasks", async (req, res) => {
    try {
      const s = await upsertCoreSubtask({ ...req.body, task_id: req.params.id });
      if (!s) return res.status(500).json({ error: "Failed to create subtask" });
      return res.status(201).json(s);
    } catch { return res.status(500).json({ error: "Failed to create subtask" }); }
  });

  app.patch("/api/core/tasks/:id/subtasks/:sid", async (req, res) => {
    try {
      const { completed } = req.body;
      const s = completed !== undefined
        ? await toggleCoreSubtask(req.params.sid, completed)
        : await upsertCoreSubtask({ ...req.body, id: req.params.sid, task_id: req.params.id });
      if (!s) return res.status(500).json({ error: "Failed to update subtask" });
      return res.json(s);
    } catch { return res.status(500).json({ error: "Failed to update subtask" }); }
  });

  app.delete("/api/core/tasks/:id/subtasks/:sid", async (req, res) => {
    try {
      const ok = await deleteCoreSubtask(req.params.sid);
      if (!ok) return res.status(500).json({ error: "Failed to delete subtask" });
      return res.json({ ok: true });
    } catch { return res.status(500).json({ error: "Failed to delete subtask" }); }
  });

  // Channels + Messages
  app.get("/api/core/channels", async (req, res) => {
    try {
      const verticalId = req.query.verticalId as string;
      if (!verticalId) return res.status(400).json({ error: "verticalId required" });
      return res.json(await getChannelsByVertical(verticalId));
    } catch { return res.status(500).json({ error: "Failed to fetch channels" }); }
  });

  app.get("/api/core/channels/:id/messages", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      return res.json(await getChannelMessages(req.params.id, limit));
    } catch { return res.status(500).json({ error: "Failed to fetch messages" }); }
  });

  app.post("/api/core/channels", async (req, res) => {
    try {
      const ch = await createChannel(req.body);
      if (!ch) return res.status(500).json({ error: "Failed to create channel" });
      return res.status(201).json(ch);
    } catch { return res.status(500).json({ error: "Failed to create channel" }); }
  });

  app.post("/api/core/channels/dm", async (req, res) => {
    try {
      const { vertical_id, member_names } = req.body;
      if (!vertical_id || !member_names) return res.status(400).json({ error: "vertical_id and member_names required" });
      const dm = await findOrCreateDM(vertical_id, member_names);
      if (!dm) return res.status(500).json({ error: "Failed to find or create DM" });
      return res.status(200).json(dm);
    } catch { return res.status(500).json({ error: "Failed to create DM" }); }
  });

  app.patch("/api/core/channels/:id", async (req, res) => {
    try {
      const ch = await updateChannel(req.params.id, req.body);
      if (!ch) return res.status(500).json({ error: "Failed to update channel" });
      return res.json(ch);
    } catch { return res.status(500).json({ error: "Failed to update channel" }); }
  });

  app.delete("/api/core/channels/:id", async (req, res) => {
    try {
      const ok = await archiveChannel(req.params.id);
      if (!ok) return res.status(500).json({ error: "Failed to archive channel" });
      return res.json({ ok: true });
    } catch { return res.status(500).json({ error: "Failed to archive channel" }); }
  });

  app.post("/api/core/channels/:id/messages", async (req, res) => {
    try {
      const msg = await createChannelMessage({ ...req.body, channel_id: req.params.id });
      if (!msg) return res.status(500).json({ error: "Failed to send message" });
      return res.status(201).json(msg);
    } catch (e) {
      console.error("[routes] POST messages caught exception:", e);
      return res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.post("/api/core/channels/:id/upload", upload.single("file"), async (req, res) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "No file provided" });
      const { sender_name } = req.body;
      if (!sender_name) return res.status(400).json({ error: "sender_name required" });

      const uploaded = await uploadChatFile(req.params.id, file.buffer, file.originalname);
      if (!uploaded) return res.status(500).json({ error: "Failed to upload file" });

      const msg = await createChannelMessage({
        channel_id: req.params.id,
        sender_name,
        content: file.originalname,
        message_type: "file",
        file_url: uploaded.url,
        file_name: file.originalname,
        file_size: file.size,
      });
      if (!msg) return res.status(500).json({ error: "Failed to create file message" });
      return res.status(201).json(msg);
    } catch (e) {
      console.error("[routes] POST upload caught exception:", e);
      return res.status(500).json({ error: "Failed to upload file" });
    }
  });

  app.patch("/api/core/channels/:id/messages/:mid", async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: "content required" });
      const msg = await editMessage(req.params.mid, content);
      if (!msg) return res.status(500).json({ error: "Failed to edit message" });
      return res.json(msg);
    } catch { return res.status(500).json({ error: "Failed to edit message" }); }
  });

  app.delete("/api/core/channels/:id/messages/:mid", async (req, res) => {
    try {
      const ok = await deleteMessage(req.params.mid);
      if (!ok) return res.status(500).json({ error: "Failed to delete message" });
      return res.json({ ok: true });
    } catch { return res.status(500).json({ error: "Failed to delete message" }); }
  });

  app.post("/api/core/channels/:id/messages/:mid/react", async (req, res) => {
    try {
      const { emoji, user_name } = req.body;
      if (!emoji || !user_name) return res.status(400).json({ error: "emoji and user_name required" });
      const msg = await toggleReaction(req.params.mid, emoji, user_name);
      if (!msg) return res.status(500).json({ error: "Failed to toggle reaction" });
      return res.json(msg);
    } catch { return res.status(500).json({ error: "Failed to toggle reaction" }); }
  });

  app.post("/api/core/channels/:id/read", async (req, res) => {
    try {
      const { user_name, last_message_id } = req.body;
      if (!user_name) return res.status(400).json({ error: "user_name required" });
      const ok = await markChannelRead(req.params.id, user_name, last_message_id);
      return res.json({ ok });
    } catch { return res.status(500).json({ error: "Failed to mark channel read" }); }
  });

  app.get("/api/core/channels/:id/unread", async (req, res) => {
    try {
      const userName = req.query.user_name as string;
      if (!userName) return res.status(400).json({ error: "user_name required" });
      const count = await getUnreadCount(req.params.id, userName);
      return res.json({ count });
    } catch { return res.status(500).json({ error: "Failed to get unread count" }); }
  });

  // Resources
  app.get("/api/core/resources", async (req, res) => {
    try { return res.json(await getCoreResources(req.query.verticalId as string | undefined)); }
    catch { return res.status(500).json({ error: "Failed to fetch resources" }); }
  });

  app.post("/api/core/resources", async (req, res) => {
    try {
      const r = await createCoreResource(req.body);
      if (!r) return res.status(500).json({ error: "Failed to create resource" });
      return res.status(201).json(r);
    } catch { return res.status(500).json({ error: "Failed to create resource" }); }
  });

  app.delete("/api/core/resources/:id", async (req, res) => {
    try {
      const ok = await deleteCoreResource(req.params.id);
      if (!ok) return res.status(500).json({ error: "Failed to delete resource" });
      return res.json({ ok: true });
    } catch { return res.status(500).json({ error: "Failed to delete resource" }); }
  });

  // Contacts
  app.get("/api/core/contacts", async (req, res) => {
    try { return res.json(await getCoreContacts(req.query.verticalId as string | undefined)); }
    catch { return res.status(500).json({ error: "Failed to fetch contacts" }); }
  });

  app.post("/api/core/contacts", async (req, res) => {
    try {
      const c = await createCoreContact(req.body);
      if (!c) return res.status(500).json({ error: "Failed to create contact" });
      return res.status(201).json(c);
    } catch { return res.status(500).json({ error: "Failed to create contact" }); }
  });

  app.patch("/api/core/contacts/:id", async (req, res) => {
    try {
      const c = await updateCoreContact(req.params.id, req.body);
      if (!c) return res.status(500).json({ error: "Failed to update contact" });
      return res.json(c);
    } catch { return res.status(500).json({ error: "Failed to update contact" }); }
  });

  app.delete("/api/core/contacts/:id", async (req, res) => {
    try {
      const ok = await deleteCoreContact(req.params.id);
      if (!ok) return res.status(500).json({ error: "Failed to delete contact" });
      return res.json({ ok: true });
    } catch { return res.status(500).json({ error: "Failed to delete contact" }); }
  });

  // Notifications
  app.get("/api/core/notifications", async (req, res) => {
    try {
      return res.json(await getCoreNotifications(
        req.query.verticalId as string | undefined,
        req.query.userId as string | undefined
      ));
    } catch { return res.status(500).json({ error: "Failed to fetch notifications" }); }
  });

  app.post("/api/core/notifications/:id/read", async (req, res) => {
    try {
      const ok = await markNotificationRead(req.params.id);
      if (!ok) return res.status(500).json({ error: "Failed to mark read" });
      return res.json({ ok: true });
    } catch { return res.status(500).json({ error: "Failed to mark read" }); }
  });

  app.post("/api/core/notifications/read-all", async (req, res) => {
    try {
      const verticalId = req.query.verticalId as string;
      if (!verticalId) return res.status(400).json({ error: "verticalId required" });
      await markAllNotificationsRead(verticalId);
      return res.json({ ok: true });
    } catch { return res.status(500).json({ error: "Failed to mark all read" }); }
  });

  app.post("/api/core/notifications/seed", async (_req, res) => {
    try {
      const result = await seedNotifications();
      return res.json(result);
    } catch { return res.status(500).json({ error: "Failed to seed notifications" }); }
  });

  // Tickets
  app.get("/api/core/tickets", async (req, res) => {
    try {
      const { verticalId, status, priority, assignedTo, search, page, limit } = req.query as Record<string, string>;
      const result = await getCoreTickets({
        verticalId: verticalId || undefined,
        status: status || undefined,
        priority: priority || undefined,
        assignedTo: assignedTo || undefined,
        search: search || undefined,
        page: page ? parseInt(page) : undefined,
        limit: limit ? parseInt(limit) : undefined,
      });
      return res.json(result);
    } catch { return res.status(500).json({ error: "Failed to fetch tickets" }); }
  });

  app.get("/api/core/tickets/:id", async (req, res) => {
    try {
      const ticket = await getCoreTicket(req.params.id);
      if (!ticket) return res.status(404).json({ error: "Ticket not found" });
      return res.json(ticket);
    } catch { return res.status(500).json({ error: "Failed to fetch ticket" }); }
  });

  app.post("/api/core/tickets", async (req, res) => {
    try {
      const body = req.body;
      if (!body.title) return res.status(400).json({ error: "title is required" });
      const input: any = {
        title: body.title,
        description: body.description || "",
        vertical_id: body.verticalId || body.vertical_id || "",
        status: body.status || "open",
        priority: body.priority || "medium",
        category: body.category || "general",
        reported_by: body.reportedBy || body.reported_by || "",
        assigned_to: body.assignedTo || body.assigned_to || null,
        created_by: body.createdBy || body.created_by || "",
        tags: body.tags || [],
        due_date: body.dueDate || body.due_date || null,
      };
      const ticket = await createCoreTicket(input);
      if (!ticket) return res.status(500).json({ error: "Failed to create ticket" });
      return res.status(201).json(ticket);
    } catch { return res.status(500).json({ error: "Failed to create ticket" }); }
  });

  app.patch("/api/core/tickets/:id", async (req, res) => {
    try {
      const body = req.body;
      const patch: any = {};
      if (body.title !== undefined) patch.title = body.title;
      if (body.description !== undefined) patch.description = body.description;
      if (body.status !== undefined) patch.status = body.status;
      if (body.priority !== undefined) patch.priority = body.priority;
      if (body.category !== undefined) patch.category = body.category;
      if (body.resolution !== undefined) patch.resolution = body.resolution;
      if (body.tags !== undefined) patch.tags = body.tags;
      if (body.assignedTo !== undefined) patch.assigned_to = body.assignedTo;
      else if (body.assigned_to !== undefined) patch.assigned_to = body.assigned_to;
      if (body.reportedBy !== undefined) patch.reported_by = body.reportedBy;
      else if (body.reported_by !== undefined) patch.reported_by = body.reported_by;
      if (body.dueDate !== undefined) patch.due_date = body.dueDate;
      else if (body.due_date !== undefined) patch.due_date = body.due_date;
      const ticket = await updateCoreTicket(req.params.id, patch);
      if (!ticket) return res.status(500).json({ error: "Failed to update ticket" });
      return res.json(ticket);
    } catch { return res.status(500).json({ error: "Failed to update ticket" }); }
  });

  app.delete("/api/core/tickets/:id", async (req, res) => {
    try {
      const ok = await deleteCoreTicket(req.params.id);
      if (!ok) return res.status(500).json({ error: "Failed to delete ticket" });
      return res.json({ ok: true });
    } catch { return res.status(500).json({ error: "Failed to delete ticket" }); }
  });
}
