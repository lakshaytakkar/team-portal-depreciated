import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth, requireRole } from "./auth";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { loadDb, saveDb } from "./db";
import { 
  insertUserSchema, insertLeadSchema, insertActivitySchema, 
  insertTaskSchema, insertServiceSchema, insertTemplateSchema,
  insertEmployeeSchema, insertTravelPackageSchema,
  insertEventSchema, insertEventAttendeeSchema, insertEventHotelSchema,
  insertEventFlightSchema, insertEventCreativeSchema, insertEventPackingItemSchema,
  insertEventCommunicationSchema, insertEventPresentationSchema,
  insertHrEmployeeSchema, insertEmployeeDocumentSchema,
  insertAssetSchema, insertAssetAssignmentSchema, insertAssetMaintenanceSchema,
  insertAttendanceSchema, insertLeaveRequestSchema, insertJobOpeningSchema, insertJobPortalSchema,
  insertCandidateSchema, insertCandidateCallSchema, insertHrTemplateSchema, insertInterviewSchema,
  insertFaireStoreSchema, insertFaireSupplierSchema, insertFaireProductSchema, insertFaireOrderSchema, insertFaireShipmentSchema,
  insertLLCClientSchema, insertLLCClientDocumentSchema, insertLLCClientTimelineSchema,
  insertTeamMemberSchema,
  insertContactSchema, insertDealSchema, insertAppointmentSchema,
  insertTicketSchema, insertAuditLogSchema, insertNotificationSchema,
  type User
} from "@shared/schema";
import { fromError } from "zod-validation-error";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  import("./seed-team-members").then(m => m.seedTeamMembers()).catch(err => console.error("Team seeding error:", err));

  // Auth routes
  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const parsed = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(parsed.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(parsed.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...parsed,
        password: hashedPassword,
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const user = req.user as User;
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/auth/logout", (req, res) => {
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    const user = req.user as User;
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // User routes (admin only)
  app.get("/api/users", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as User;
      const userTeams = await storage.getUserTeams(currentUser.id);
      const isManager = userTeams.some(t => t.role === 'manager') || currentUser.role === 'superadmin';
      if (!isManager) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const users = await storage.getAllUsers();
      
      // Only show salary to admin@suprans.in
      const isMainAdmin = currentUser.email === 'admin@suprans.in';
      const usersWithoutPasswords = users.map(({ password, salary, ...user }) => ({
        ...user,
        ...(isMainAdmin ? { salary } : {})
      }));
      res.json(usersWithoutPasswords);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/:id", requireAuth, async (req, res, next) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/users/:id", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as User;
      
      // Users can only update their own profile unless they're admin
      if (currentUser.id !== req.params.id && currentUser.role !== "superadmin") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/users/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const deleted = await storage.deleteUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // ========== TEAM MEMBERSHIP ROUTES ==========

  app.get("/api/team-members", requireAuth, async (req, res, next) => {
    try {
      const { teamId } = req.query;
      if (!teamId) {
        return res.status(400).json({ message: "teamId is required" });
      }
      const members = await storage.getTeamMembers(teamId as string);
      const membersWithUsers = await Promise.all(
        members.map(async (m) => {
          const user = await storage.getUser(m.userId);
          return {
            ...m,
            user: user ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role } : null
          };
        })
      );
      res.json(membersWithUsers);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/my-teams", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const memberships = await storage.getUserTeams(user.id);
      res.json(memberships);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/team-members", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const parsed = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(parsed);
      res.json(member);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/team-members/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      if (!role || !['manager', 'executive'].includes(role)) {
        return res.status(400).json({ message: "Valid role (manager/executive) is required" });
      }
      const db = loadDb();
      const members: any[] = db['team_members'] ?? [];
      const idx = members.findIndex((m: any) => m.id === id);
      if (idx === -1) {
        return res.status(404).json({ message: "Team member not found" });
      }
      members[idx] = { ...members[idx], role, updatedAt: new Date().toISOString() };
      db['team_members'] = members;
      saveDb(db);
      res.json(members[idx]);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/team-members/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTeamMember(id);
      if (!deleted) {
        return res.status(404).json({ message: "Team member not found" });
      }
      res.json({ message: "Team member removed" });
    } catch (error) {
      next(error);
    }
  });

  // Lead routes
  app.get("/api/leads", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const teamId = req.query.teamId as string | undefined;
      const effectiveRole = req.query.effectiveRole as string | undefined;

      if (user.role === 'superadmin') {
        if (effectiveRole === 'executive' && teamId) {
          const leads = await storage.getLeads({ userId: user.id, teamId });
          return res.json(leads);
        }
        if (effectiveRole === 'manager' && teamId) {
          const leads = await storage.getLeads({ teamId });
          return res.json(leads);
        }
        const leads = await storage.getLeads({ role: 'superadmin' });
        return res.json(leads);
      }

      if (teamId) {
        const userTeams = await storage.getUserTeams(user.id);
        const membership = userTeams.find(t => t.teamId === teamId);
        if (membership?.role === 'manager') {
          const leads = await storage.getLeads({ teamId });
          return res.json(leads);
        }
        if (membership?.role === 'executive') {
          const leads = await storage.getLeads({ userId: user.id, teamId });
          return res.json(leads);
        }
      }

      const leads = await storage.getLeads({ userId: user.id });
      res.json(leads);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/leads/:id", requireAuth, async (req, res, next) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      const user = req.user as User;
      if (user.role === 'superadmin') {
        return res.json(lead);
      }
      if (lead.assignedTo === user.id) {
        return res.json(lead);
      }
      if (lead.teamId) {
        const userTeams = await storage.getUserTeams(user.id);
        const membership = userTeams.find(t => t.teamId === lead.teamId);
        if (membership?.role === 'manager') {
          return res.json(lead);
        }
      }
      return res.status(403).json({ message: "Forbidden" });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/leads", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(parsed);
      res.json(lead);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/leads/:id", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const existingLead = await storage.getLead(req.params.id);
      
      if (!existingLead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      // Check authorization: superadmin can always update; assignee can update their own lead;
      // team managers can update any lead within their managed team
      if (user.role !== 'superadmin') {
        const isAssignee = existingLead.assignedTo === user.id;
        let isTeamManager = false;
        if (existingLead.teamId) {
          const userTeams = await storage.getUserTeams(user.id);
          isTeamManager = userTeams.some(t => t.teamId === existingLead.teamId && t.role === 'manager');
        }
        if (!isAssignee && !isTeamManager) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      const lead = await storage.updateLead(req.params.id, req.body);

      // Log a stage_change activity whenever the stage is updated
      if (req.body.stage && req.body.stage !== existingLead.stage) {
        await storage.createActivity({
          leadId: req.params.id,
          userId: user.id,
          type: 'stage_change',
          notes: `Stage changed from "${existingLead.stage}" to "${req.body.stage}"`,
        }).catch(() => { /* non-critical — don't fail the update */ });
      }

      res.json(lead);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/leads/:id", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const existingLead = await storage.getLead(req.params.id);
      if (!existingLead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      // Allow superadmin and team managers to delete leads in their managed teams
      if (user.role !== 'superadmin') {
        let isTeamManager = false;
        if (existingLead.teamId) {
          const userTeams = await storage.getUserTeams(user.id);
          isTeamManager = userTeams.some(t => t.teamId === existingLead.teamId && t.role === 'manager');
        }
        if (!isTeamManager) {
          return res.status(403).json({ message: "Forbidden: only managers can delete leads" });
        }
      }
      const deleted = await storage.deleteLead(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json({ message: "Lead deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/leads/:id/assign", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const { userId } = req.body;
      const lead = await storage.assignLead(req.params.id, userId);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      next(error);
    }
  });

  // Activity routes
  app.get("/api/activities", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const { leadId } = req.query;
      
      const activities = await storage.getActivities(
        leadId as string | undefined,
        user.role === 'superadmin' ? undefined : user.id
      );
      
      res.json(activities);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/activities", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const parsed = insertActivitySchema.parse({
        ...req.body,
        userId: user.id,
      });
      
      const activity = await storage.createActivity(parsed);
      res.json(activity);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.delete("/api/activities/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteActivity(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Activity not found" });
      }
      res.json({ message: "Activity deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Task routes
  app.get("/api/tasks", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const teamId = req.query.teamId as string | undefined;
      const effectiveRole = req.query.effectiveRole as string | undefined;
      const leadId = req.query.leadId as string | undefined;

      // If leadId is provided, verify the caller has access to that lead before returning its tasks
      if (leadId) {
        const lead = await storage.getLead(leadId);
        if (!lead) return res.status(404).json({ message: "Lead not found" });
        // Superadmin can see any lead; regular users must own or manage the lead's team
        if (user.role !== 'superadmin') {
          const isOwner = lead.assignedTo === user.id;
          let isTeamManager = false;
          if (lead.teamId) {
            const userTeams = await storage.getUserTeams(user.id);
            isTeamManager = userTeams.some(t => t.teamId === lead.teamId && t.role === 'manager');
          }
          if (!isOwner && !isTeamManager) {
            return res.status(403).json({ message: "Forbidden" });
          }
        }
        const tasks = await storage.getTasks({ leadId });
        return res.json(tasks);
      }

      if (user.role === 'superadmin') {
        if (effectiveRole === 'executive' && teamId) {
          const tasks = await storage.getTasks({ userId: user.id, teamId });
          return res.json(tasks);
        }
        if (effectiveRole === 'manager' && teamId) {
          const tasks = await storage.getTasks({ teamId });
          return res.json(tasks);
        }
        const tasks = await storage.getTasks();
        return res.json(tasks);
      }

      if (teamId) {
        const userTeams = await storage.getUserTeams(user.id);
        const membership = userTeams.find(t => t.teamId === teamId);
        if (membership?.role === 'manager') {
          const tasks = await storage.getTasks({ teamId });
          return res.json(tasks);
        }
        if (membership?.role === 'executive') {
          const tasks = await storage.getTasks({ userId: user.id, teamId });
          return res.json(tasks);
        }
      }

      const tasks = await storage.getTasks({ userId: user.id });
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/tasks/:id", requireAuth, async (req, res, next) => {
    try {
      const task = await storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/tasks", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(parsed);
      res.json(task);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/tasks/:id", requireAuth, async (req, res, next) => {
    try {
      const task = await storage.updateTask(req.params.id, req.body);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/tasks/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteTask(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Public service routes (no auth required)
  app.get("/api/public/services", async (req, res, next) => {
    try {
      const services = await storage.getServices();
      // Only return active services for public API, sorted by displayOrder
      const activeServices = services
        .filter(s => s.isActive)
        .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      res.json(activeServices);
    } catch (error) {
      next(error);
    }
  });

  // Public lead submission (no auth required)
  app.post("/api/public/leads", async (req, res, next) => {
    try {
      const { name, phone, email, message, service, source } = req.body;
      
      if (!name || !phone || !email) {
        return res.status(400).json({ message: "Name, phone, and email are required" });
      }
      
      // Check for duplicate by phone number (normalize phone)
      const normalizedPhone = phone.replace(/\D/g, '');
      const existingLead = await storage.getLeadByPhone(normalizedPhone);
      
      if (existingLead) {
        // Update existing lead with new message/activity
        await storage.updateLead(existingLead.id, {
          name,
          email,
          tags: [...(existingLead.tags || []), 'repeat-inquiry'],
        });
        return res.json({ message: "Thank you! We'll get back to you soon.", duplicate: true });
      }
      
      // Validate and determine source - only allow whitelisted values
      const allowedSources = ["Website", "contact_form", "callback_form", "travel_enquiry", "event_registration"];
      const leadSource = source && allowedSources.includes(source) ? source : "Website";
      const tags = message ? ["website-lead", `Note: ${message}`] : ["website-lead"];
      
      // Create new lead - unassigned by default
      const lead = await storage.createLead({
        name,
        phone: normalizedPhone,
        email,
        company: name, // Use name as company fallback
        service: service || "General Inquiry",
        source: leadSource,
        stage: "new",
        value: 0,
        assignedTo: null,
        tags,
        temperature: "warm",
      });
      
      res.json({ message: "Thank you! We'll get back to you within 24 hours.", lead });
    } catch (error) {
      next(error);
    }
  });

  // Service routes (authenticated)
  app.get("/api/services", requireAuth, async (req, res, next) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/services", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const parsed = insertServiceSchema.parse(req.body);
      const service = await storage.createService(parsed);
      res.json(service);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/services/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const service = await storage.updateService(req.params.id, req.body);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/services/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const deleted = await storage.deleteService(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Template routes
  app.get("/api/templates", requireAuth, async (req, res, next) => {
    try {
      const { type } = req.query;
      const templates = await storage.getTemplates(type as string | undefined);
      res.json(templates);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/templates", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const parsed = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(parsed);
      res.json(template);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/templates/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const template = await storage.updateTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/templates/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const deleted = await storage.deleteTemplate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Public employee routes (for contact modal)
  app.get("/api/public/employees", async (req, res, next) => {
    try {
      const employees = await storage.getActiveEmployees();
      res.json(employees);
    } catch (error) {
      next(error);
    }
  });

  // Public sales team - returns sales executives for Call Now feature
  app.get("/api/public/sales-team", async (req, res, next) => {
    try {
      const salesUsers = await storage.getUsersByRole("sales_executive");
      // Return only public-safe fields (no password)
      const safeUsers = salesUsers
        .filter(u => u.phone)
        .map(u => ({
          id: u.id,
          name: u.name,
          phone: u.phone,
        }));
      res.json(safeUsers);
    } catch (error) {
      next(error);
    }
  });

  // Public callback request submission - creates a lead with source='callback_request'
  app.post("/api/public/callback", async (req, res, next) => {
    try {
      const { name, phone, email, service, message } = req.body;
      
      if (!name || !phone) {
        return res.status(400).json({ message: "Name and phone are required" });
      }
      
      const leadData = {
        name: name.trim(),
        phone: phone.replace(/\D/g, ''),
        email: email?.trim() || `${phone.replace(/\D/g, '')}@callback.local`,
        company: "Individual",
        service: service || "General Inquiry",
        source: "callback_request",
        value: 0,
        stage: "new" as const,
        tags: message ? [`Note: ${message.trim()}`] : [],
        temperature: "warm" as const,
      };
      
      const parsed = insertLeadSchema.parse(leadData);
      const lead = await storage.createLead(parsed);
      
      res.json({ 
        message: "Thank you! Our team will call you back shortly.",
        lead 
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  // Employee routes (admin)
  app.get("/api/employees", requireAuth, async (req, res, next) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/employees", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const parsed = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(parsed);
      res.json(employee);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/employees/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const employee = await storage.updateEmployee(req.params.id, req.body);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/employees/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const deleted = await storage.deleteEmployee(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Public events routes
  app.get("/api/public/events", async (req, res, next) => {
    try {
      const events = await storage.getUpcomingEvents();
      res.json(events);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/public/events/:id", async (req, res, next) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      next(error);
    }
  });

  // Public travel package routes
  app.get("/api/public/travel-packages", async (req, res, next) => {
    try {
      const packages = await storage.getActiveTravelPackages();
      res.json(packages);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/public/travel-packages/featured", async (req, res, next) => {
    try {
      const packages = await storage.getFeaturedTravelPackages();
      res.json(packages);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/public/travel-packages/:slug", async (req, res, next) => {
    try {
      const pkg = await storage.getTravelPackageBySlug(req.params.slug);
      if (!pkg) {
        return res.status(404).json({ message: "Travel package not found" });
      }
      res.json(pkg);
    } catch (error) {
      next(error);
    }
  });

  // Razorpay payment routes
  app.post("/api/payments/create-order", async (req, res, next) => {
    try {
      const Razorpay = (await import('razorpay')).default;
      const { packageId, customerName, customerEmail, customerPhone, numberOfTravelers, travelDate, notes } = req.body;
      
      if (!packageId || !customerName || !customerEmail || !customerPhone) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Get the travel package
      const pkg = await storage.getTravelPackage(packageId);
      if (!pkg) {
        return res.status(404).json({ message: "Travel package not found" });
      }

      // Check seats availability
      if (pkg.seatsLeft !== null && pkg.seatsLeft !== undefined && pkg.seatsLeft <= 0) {
        return res.status(400).json({ message: "Sorry, this package is fully booked. No seats available." });
      }

      // Charge fixed booking amount (₹30,000 default) in paise
      const travelers = numberOfTravelers || 1;
      const bookingAmount = pkg.bookingAmount || 30000;
      const totalAmount = bookingAmount * 100;

      // Initialize Razorpay
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });

      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: totalAmount,
        currency: "INR",
        receipt: `booking_${Date.now()}`,
        notes: {
          packageId,
          packageTitle: pkg.title,
          customerName,
          customerEmail,
          numberOfTravelers: travelers.toString(),
        },
      });

      // Create booking record in database
      const booking = await storage.createTravelBooking({
        packageId,
        customerName,
        customerEmail,
        customerPhone,
        numberOfTravelers: travelers,
        amount: totalAmount,
        currency: "INR",
        razorpayOrderId: order.id,
        status: "pending",
        notes: notes || null,
        travelDate: travelDate ? new Date(travelDate) : null,
      });

      res.json({
        orderId: order.id,
        bookingId: booking.id,
        amount: totalAmount,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
        packageTitle: pkg.title,
      });
    } catch (error: any) {
      console.error("Razorpay order creation error:", error);
      next(error);
    }
  });

  app.post("/api/payments/verify", async (req, res, next) => {
    try {
      const crypto = await import('crypto');
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Fetch the booking to verify order ID and amount match
      const existingBooking = await storage.getTravelBooking(bookingId);
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Verify order ID matches the stored booking
      if (existingBooking.razorpayOrderId !== razorpay_order_id) {
        await storage.updateTravelBooking(bookingId, { status: "failed" });
        return res.status(400).json({ message: "Order ID mismatch" });
      }

      // Fetch payment details from Razorpay to verify amount
      const Razorpay = (await import('razorpay')).default;
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });

      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      
      // Verify payment amount matches the booking amount
      if (payment.amount !== existingBooking.amount) {
        await storage.updateTravelBooking(bookingId, { status: "failed" });
        return res.status(400).json({ message: "Payment amount mismatch" });
      }

      // Verify payment status is captured/authorized
      if (payment.status !== 'captured' && payment.status !== 'authorized') {
        await storage.updateTravelBooking(bookingId, { status: "failed" });
        return res.status(400).json({ message: "Payment not captured" });
      }

      // Verify signature using HMAC-SHA256
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        // Update booking as failed
        await storage.updateTravelBooking(bookingId, {
          status: "failed",
        });
        return res.status(400).json({ message: "Invalid payment signature" });
      }

      // Update booking as paid
      const booking = await storage.updateTravelBooking(bookingId, {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      });

      // Decrement seats left for the package
      if (booking && booking.packageId) {
        const pkg = await storage.getTravelPackage(booking.packageId);
        if (pkg && pkg.seatsLeft !== null && pkg.seatsLeft !== undefined && pkg.seatsLeft > 0) {
          await storage.updateTravelPackage(booking.packageId, {
            seatsLeft: pkg.seatsLeft - 1,
          });
        }
      }

      res.json({
        success: true,
        message: "Payment verified successfully",
        booking,
      });
    } catch (error: any) {
      console.error("Payment verification error:", error);
      next(error);
    }
  });

  // Get Razorpay key for frontend
  app.get("/api/payments/config", async (req, res) => {
    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  });

  // Create Razorpay order for event registration
  app.post("/api/payments/create-event-order", async (req, res, next) => {
    try {
      const Razorpay = (await import('razorpay')).default;
      const { amount, eventId, customerName, customerEmail, customerPhone } = req.body;
      
      if (!amount || !eventId || !customerName || !customerEmail || !customerPhone) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Amount is in rupees, Razorpay expects paise
      const amountInPaise = amount * 100;

      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      });

      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `event_${eventId}_${Date.now()}`,
        notes: {
          eventId,
          customerName,
          customerEmail,
          customerPhone,
        },
      });

      res.json({
        orderId: order.id,
        amount: amountInPaise,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    } catch (error: any) {
      console.error("Event order creation error:", error);
      res.status(500).json({ message: error.message || "Failed to create order" });
    }
  });

  // Verify event payment
  app.post("/api/payments/verify-event-payment", async (req, res, next) => {
    try {
      const crypto = await import('crypto');
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature, eventId, customerName, customerEmail, customerPhone } = req.body;

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Verify signature
      const body = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }

      // Payment verified - create event attendee record
      const event = await storage.getEvent(eventId);
      if (event) {
        await storage.createEventAttendee({
          eventId,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          company: "",
          source: "online_payment",
          ticketStatus: "issued",
          notes: `Paid ₹${event.ticketPrice || 0} via Razorpay. Order: ${razorpayOrderId}, Payment: ${razorpayPaymentId}`,
        });
      }

      res.json({
        success: true,
        message: "Payment verified and registration confirmed",
      });
    } catch (error: any) {
      console.error("Event payment verification error:", error);
      res.status(500).json({ message: error.message || "Payment verification failed" });
    }
  });

  // Admin travel package routes
  app.get("/api/travel-packages", requireAuth, async (req, res, next) => {
    try {
      const packages = await storage.getTravelPackages();
      res.json(packages);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/travel-packages", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const parsed = insertTravelPackageSchema.parse(req.body);
      const pkg = await storage.createTravelPackage(parsed);
      res.json(pkg);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/travel-packages/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const pkg = await storage.updateTravelPackage(req.params.id, req.body);
      if (!pkg) {
        return res.status(404).json({ message: "Travel package not found" });
      }
      res.json(pkg);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/travel-packages/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const deleted = await storage.deleteTravelPackage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Travel package not found" });
      }
      res.json({ message: "Travel package deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // ========== EVENT MANAGEMENT ROUTES ==========

  // Events CRUD
  app.get("/api/events", requireAuth, async (req, res, next) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/events/:id", requireAuth, async (req, res, next) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/events", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const parsed = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(parsed);
      res.status(201).json(event);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/events/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const event = await storage.updateEvent(req.params.id, req.body);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/events/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const deleted = await storage.deleteEvent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Event Attendees
  app.get("/api/events/:eventId/attendees", requireAuth, async (req, res, next) => {
    try {
      const attendees = await storage.getEventAttendees(req.params.eventId);
      res.json(attendees);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/events/:eventId/attendees", requireAuth, async (req, res, next) => {
    try {
      // Auto-generate unique ticket ID if not provided
      let ticketId = req.body.ticketId;
      if (!ticketId) {
        const event = await storage.getEvent(req.params.eventId);
        const eventDate = event ? new Date(event.date) : new Date();
        // Use fixed format for month/year
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const monthYear = months[eventDate.getMonth()] + String(eventDate.getFullYear()).slice(-2);
        
        // Generate unique ticket ID using timestamp + random suffix to avoid collisions
        const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        ticketId = `SBC-${monthYear}-${timestamp}${random}`;
      }
      
      const parsed = insertEventAttendeeSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
        ticketId,
      });
      const attendee = await storage.createEventAttendee(parsed);
      res.status(201).json(attendee);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/events/:eventId/attendees/:id", requireAuth, async (req, res, next) => {
    try {
      const attendee = await storage.updateEventAttendee(req.params.id, req.body);
      if (!attendee) {
        return res.status(404).json({ message: "Attendee not found" });
      }
      res.json(attendee);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/events/:eventId/attendees/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteEventAttendee(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Attendee not found" });
      }
      res.json({ message: "Attendee deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/events/:eventId/attendees/:id/checkin", requireAuth, async (req, res, next) => {
    try {
      const attendee = await storage.checkInAttendee(req.params.id);
      if (!attendee) {
        return res.status(404).json({ message: "Attendee not found" });
      }
      res.json(attendee);
    } catch (error) {
      next(error);
    }
  });

  // QR-based check-in endpoint - scans ticket ID from QR code
  app.post("/api/events/:eventId/checkin-by-qr", requireAuth, async (req, res, next) => {
    try {
      const { ticketId, eventId: qrEventId } = req.body;
      
      if (!ticketId) {
        return res.status(400).json({ message: "Ticket ID is required" });
      }

      // Verify event ID matches
      if (qrEventId && qrEventId !== req.params.eventId) {
        return res.status(400).json({ 
          message: "This ticket is for a different event",
          success: false
        });
      }

      // Find attendee by ticket ID
      const attendees = await storage.getEventAttendees(req.params.eventId);
      const attendee = attendees.find(a => a.ticketId === ticketId);
      
      if (!attendee) {
        return res.status(404).json({ 
          message: "Ticket not found for this event",
          success: false
        });
      }

      // Check if already checked in
      if (attendee.checkedIn) {
        return res.status(200).json({ 
          message: "Already checked in",
          attendee,
          alreadyCheckedIn: true,
          success: true
        });
      }

      // Check in the attendee
      const checkedInAttendee = await storage.checkInAttendee(attendee.id);
      
      res.json({ 
        message: "Check-in successful!",
        attendee: checkedInAttendee,
        success: true,
        alreadyCheckedIn: false
      });
    } catch (error) {
      next(error);
    }
  });

  // Generate tickets for all attendees of an event
  app.post("/api/events/:eventId/generate-tickets", requireAuth, async (req, res, next) => {
    try {
      const event = await storage.getEvent(req.params.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const attendees = await storage.getEventAttendees(req.params.eventId);
      const updatedAttendees = [];

      // Generate ticket prefix based on event date
      const eventDate = new Date(event.date);
      const month = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const year = eventDate.getFullYear().toString().slice(-2);
      const ticketPrefix = `SBC-${month}${year}`;

      for (let i = 0; i < attendees.length; i++) {
        const attendee = attendees[i];
        
        // Skip if ticket already exists
        if (attendee.ticketId && attendee.ticketQr) {
          updatedAttendees.push(attendee);
          continue;
        }

        // Generate ticket ID
        const ticketNumber = String(i + 1).padStart(3, '0');
        const ticketId = `${ticketPrefix}-${ticketNumber}`;

        // Generate QR code with ticket info
        const qrData = JSON.stringify({
          ticketId,
          name: attendee.name,
          eventId: event.id,
          eventName: event.name,
          date: event.date
        });
        
        const ticketQr = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' }
        });

        // Update attendee with ticket info
        const updated = await storage.updateEventAttendee(attendee.id, {
          ticketId,
          ticketQr,
          ticketStatus: 'issued'
        });

        if (updated) {
          updatedAttendees.push(updated);
        }
      }

      res.json({ 
        message: `Generated ${updatedAttendees.filter(a => a.ticketId).length} tickets`,
        attendees: updatedAttendees 
      });
    } catch (error) {
      next(error);
    }
  });

  // Generate ticket for a single attendee
  app.post("/api/events/:eventId/attendees/:id/generate-ticket", requireAuth, async (req, res, next) => {
    try {
      const event = await storage.getEvent(req.params.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const attendees = await storage.getEventAttendees(req.params.eventId);
      const attendee = attendees.find(a => a.id === req.params.id);
      
      if (!attendee) {
        return res.status(404).json({ message: "Attendee not found" });
      }

      // Generate ticket prefix based on event date
      const eventDate = new Date(event.date);
      const month = eventDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const year = eventDate.getFullYear().toString().slice(-2);
      const ticketPrefix = `SBC-${month}${year}`;

      // Find the attendee's position for ticket number
      const attendeeIndex = attendees.findIndex(a => a.id === req.params.id);
      const ticketNumber = String(attendeeIndex + 1).padStart(3, '0');
      const ticketId = `${ticketPrefix}-${ticketNumber}`;

      // Generate QR code
      const qrData = JSON.stringify({
        ticketId,
        name: attendee.name,
        eventId: event.id,
        eventName: event.name,
        date: event.date
      });
      
      const ticketQr = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });

      // Update attendee
      const updated = await storage.updateEventAttendee(req.params.id, {
        ticketId,
        ticketQr,
        ticketStatus: 'issued'
      });

      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  // HTML escape function to prevent injection
  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Branded email template generator
  function generateEventEmailHtml(params: {
    attendeeName: string;
    ticketId: string;
    ticketCount?: number;
    eventName: string;
    eventDate: string;
    venue: string;
    venueAddress: string;
    venuePhone: string;
    mapsLink: string;
    qrCode?: string;
    isTest?: boolean;
    eventType?: string;
    slotTime?: string;
  }) {
    // Escape all user-provided data to prevent HTML injection
    const attendeeName = escapeHtml(params.attendeeName);
    const ticketId = escapeHtml(params.ticketId);
    const ticketCount = params.ticketCount || 1;
    const eventName = escapeHtml(params.eventName);
    const eventDate = escapeHtml(params.eventDate);
    const venue = escapeHtml(params.venue);
    const venueAddress = escapeHtml(params.venueAddress);
    const venuePhone = escapeHtml(params.venuePhone);
    // Hardcode trusted Google Maps direct URL for security - this is a known venue (Radisson Blu Plaza Delhi Airport)
    const mapsLink = "https://www.google.com/maps/place/Radisson+Blu+Plaza+Delhi+Airport/@28.5495277,77.1003028,17z";
    const qrCode = params.qrCode; // Base64 data URL, safe
    const isTest = params.isTest;
    const eventType = params.eventType || '';
    const slotTime = params.slotTime ? escapeHtml(params.slotTime) : 'To be assigned';
    
    // Hotel thumbnail
    const hotelImageUrl = "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/29/07/53/40/radisson-blu-plaza-delhi.jpg?w=1200&h=-1&s=1";

    // IBS Event Template - simpler, matches WhatsApp format
    if (eventType === 'ibs') {
      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your IBS Ticket - Suprans</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #F34147 0%, #d63031 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 2px;">SUPRANS</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Your Gateway to Global Business</p>
            </td>
          </tr>
          
          ${isTest ? `
          <tr>
            <td style="background-color: #fff3cd; padding: 12px 20px; text-align: center; border-bottom: 1px solid #ffc107;">
              <p style="margin: 0; color: #856404; font-size: 14px; font-weight: 600;">[TEST EMAIL] This is a preview of the actual email</p>
            </td>
          </tr>
          ` : ''}
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 25px 20px 15px;">
              <p style="color: #333; font-size: 18px; margin: 0 0 15px;">Hello <strong>${attendeeName}</strong>!</p>
              <p style="color: #333; font-size: 16px; margin: 0; line-height: 1.6;">
                Your ticket for <strong style="color: #F34147;">${eventName}</strong> is confirmed.
              </p>
            </td>
          </tr>
          
          <!-- Ticket Details -->
          <tr>
            <td style="padding: 0 20px 20px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fafafa; border-radius: 12px; border: 1px solid #eee;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #666; font-size: 13px;">Number of Tickets</p>
                          <p style="margin: 3px 0 0; color: #333; font-size: 16px; font-weight: 600;">${ticketCount}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #666; font-size: 13px;">Date</p>
                          <p style="margin: 3px 0 0; color: #333; font-size: 16px; font-weight: 600;">${eventDate}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Your Batch -->
          <tr>
            <td style="padding: 0 20px 20px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 2px;">Your Batch</p>
                    <h2 style="color: #F34147; font-size: 22px; margin: 0 0 10px; font-weight: 700;">${slotTime}</h2>
                    <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 0;">Please arrive 15 minutes before your batch timing.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Venue Details -->
          <tr>
            <td style="padding: 0 20px 20px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fafafa; border-radius: 12px; border: 1px solid #eee;">
                <tr>
                  <td style="padding: 20px;">
                    <h3 style="color: #F34147; font-size: 14px; margin: 0 0 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Venue</h3>
                    <p style="margin: 0 0 5px; color: #333; font-size: 16px; font-weight: 600;">Radisson Blu Plaza</p>
                    <p style="margin: 0 0 10px; color: #666; font-size: 14px;">${venueAddress}</p>
                    <p style="margin: 0 0 10px; color: #333; font-size: 14px;">Phone: ${venuePhone}</p>
                    <a href="${mapsLink}" style="color: #F34147; font-size: 14px; text-decoration: none;">View on Google Maps</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Important Instructions -->
          <tr>
            <td style="padding: 0 20px 20px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fff8e6; border-radius: 12px; border: 1px solid #ffd93d;">
                <tr>
                  <td style="padding: 20px;">
                    <h4 style="margin: 0 0 12px; color: #856404; font-size: 14px; font-weight: 700;">Important Instructions:</h4>
                    <ul style="margin: 0; padding-left: 18px; color: #8a6d3b; font-size: 13px; line-height: 1.8;">
                      <li>1 person per ticket</li>
                      <li>Arrive 15 mins before your batch time for smooth check-in</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 25px 20px; text-align: center;">
              <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 15px;">We look forward to seeing you!</p>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 5px;">Best Regards,</p>
              <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 5px;">Gaurav</p>
              <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 5px;">+91 8851492209</p>
              <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 5px;">Team Suprans</p>
              <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0;">cs@suprans.in</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;
    }
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Event Ticket - Suprans</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #F34147 0%, #d63031 100%); padding: 30px 20px; text-align: center;">
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td align="center">
                    <div style="width: 50px; height: 50px; background-color: rgba(255,255,255,0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
                      <span style="font-size: 28px; color: #ffffff;">⚡</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 2px;">SUPRANS</h1>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Your Gateway to Global Business</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          ${isTest ? `
          <!-- Test Banner -->
          <tr>
            <td style="background-color: #fff3cd; padding: 12px 20px; text-align: center; border-bottom: 1px solid #ffc107;">
              <p style="margin: 0; color: #856404; font-size: 14px; font-weight: 600;">[TEST EMAIL] This is a preview of the actual email</p>
            </td>
          </tr>
          ` : ''}
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 25px 20px 15px;">
              <p style="color: #333; font-size: 16px; margin: 0 0 10px;">Dear <strong>${attendeeName}</strong>,</p>
              <p style="color: #666; font-size: 15px; margin: 0; line-height: 1.6;">
                Greetings from Team Suprans! Your registration for <strong style="color: #F34147;">${eventName}</strong> is confirmed.
              </p>
            </td>
          </tr>
          
          <!-- QR Code & Ticket Section -->
          <tr>
            <td style="padding: 0 20px 20px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 2px;">Your Event Pass</p>
                    <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 10px; font-weight: 700;">${ticketId}</h2>
                    <p style="color: #ffffff; font-size: 16px; margin: 0 0 15px; font-weight: 600; background: ${ticketCount > 1 ? 'linear-gradient(135deg, #F34147 0%, #d63031 100%)' : 'rgba(255,255,255,0.15)'}; padding: 8px 16px; border-radius: 20px; display: inline-block;">
                      ${ticketCount > 1 ? `${ticketCount} Tickets (${ticketCount} persons)` : '1 Ticket (1 person)'}
                    </p>
                    ${qrCode ? `
                    <div style="background-color: #ffffff; padding: 12px; border-radius: 8px; display: inline-block; margin-bottom: 12px;">
                      <img src="${qrCode}" alt="QR Code" style="width: 120px; height: 120px; display: block;">
                    </div>
                    <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin: 0;">Scan at registration desk for quick check-in</p>
                    ` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Event Details -->
          <tr>
            <td style="padding: 0 20px 20px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fafafa; border-radius: 12px; border: 1px solid #eee;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="color: #F34147; font-size: 16px; margin: 0 0 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Event Details</h3>
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Date</p>
                          <p style="margin: 3px 0 0; color: #333; font-size: 15px; font-weight: 600;">${eventDate}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Venue</p>
                          <p style="margin: 3px 0 0; color: #333; font-size: 15px; font-weight: 600;">${venue}</p>
                          <p style="margin: 3px 0 0; color: #666; font-size: 14px;">${venueAddress}</p>
                          <p style="margin: 8px 0 0;">
                            <a href="${mapsLink}" style="color: #F34147; font-size: 14px; text-decoration: none;">View on Google Maps</a>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Hotel Contact</p>
                          <p style="margin: 3px 0 0; color: #333; font-size: 15px; font-weight: 600;">${venuePhone}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Hotel Image -->
          <tr>
            <td style="padding: 0 20px 20px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                <tr>
                  <td>
                    <img src="${hotelImageUrl}" alt="Radisson Blu Plaza Delhi Airport" style="width: 100%; height: auto; display: block;">
                    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 18px 20px;">
                      <p style="margin: 0; color: #F34147; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Event Venue</p>
                      <p style="margin: 6px 0 0; color: #ffffff; font-size: 18px; font-weight: 700;">Radisson Blu Plaza</p>
                      <p style="margin: 4px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Delhi Airport | 5 Star Luxury Hotel</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Schedule -->
          <tr>
            <td style="padding: 0 20px 20px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fafafa; border-radius: 12px; border: 1px solid #eee;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="color: #F34147; font-size: 16px; margin: 0 0 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Event Schedule</h3>
                    <table role="presentation" style="width: 100%;">
                      <tr>
                        <td style="padding: 10px 15px; background-color: #fff; border-radius: 8px; margin-bottom: 8px; display: block;">
                          <span style="color: #F34147; font-weight: 700; font-size: 14px;">8:30 AM - 10:00 AM</span>
                          <span style="color: #333; font-size: 14px; margin-left: 10px;">Registration & Breakfast</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 15px; background-color: #fff; border-radius: 8px; margin-bottom: 8px; display: block; margin-top: 8px;">
                          <span style="color: #F34147; font-weight: 700; font-size: 14px;">10:00 AM</span>
                          <span style="color: #333; font-size: 14px; margin-left: 10px;">Event Begins</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 15px; background-color: #fff; border-radius: 8px; margin-bottom: 8px; display: block; margin-top: 8px;">
                          <span style="color: #F34147; font-weight: 700; font-size: 14px;">1:30 PM</span>
                          <span style="color: #333; font-size: 14px; margin-left: 10px;">Lunch</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 15px; background-color: #fff; border-radius: 8px; display: block; margin-top: 8px;">
                          <span style="color: #F34147; font-weight: 700; font-size: 14px;">3:00 - 3:30 PM</span>
                          <span style="color: #333; font-size: 14px; margin-left: 10px;">Event Closes</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Important Instructions -->
          <tr>
            <td style="padding: 0 20px 20px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fff8e6; border-radius: 12px; border: 1px solid #ffd93d;">
                <tr>
                  <td style="padding: 20px;">
                    <h4 style="margin: 0 0 12px; color: #856404; font-size: 14px; font-weight: 700;">Important Instructions:</h4>
                    <ul style="margin: 0; padding-left: 18px; color: #8a6d3b; font-size: 13px; line-height: 1.8;">
                      <li>1 person per ticket</li>
                      <li>First Come First Served (FCFS) seating</li>
                      <li>Hi-Tea and Lunch included</li>
                      <li>Arrive 30 mins before event start for smooth check-in</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 25px 20px; text-align: center;">
              <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0 0 5px;">We look forward to seeing you!</p>
              <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 8px;">Best Regards,</p>
              <p style="color: #ffffff; font-size: 15px; font-weight: 600; margin: 0 0 5px;">Gaurav</p>
              <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 5px;">Team Suprans</p>
              <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 0 0 15px;">+91 8851492209 | cs@suprans.in</p>
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="padding: 0 10px;">
                    <a href="https://suprans.in" style="color: rgba(255,255,255,0.6); font-size: 13px; text-decoration: none;">suprans.in</a>
                  </td>
                  <td style="padding: 0 10px; color: rgba(255,255,255,0.3);">|</td>
                  <td style="padding: 0 10px;">
                    <a href="mailto:cs@suprans.in" style="color: rgba(255,255,255,0.6); font-size: 13px; text-decoration: none;">cs@suprans.in</a>
                  </td>
                </tr>
              </table>
              <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 20px 0 0;">© 2026 Suprans. All rights reserved.</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  // Send bulk email to all event attendees - personalized per attendee
  app.post("/api/events/:eventId/send-bulk-email", requireAuth, async (req, res, next) => {
    try {
      const { getUncachableResendClient } = await import('./resend');
      const { format } = await import('date-fns');
      
      const event = await storage.getEvent(req.params.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const attendees = await storage.getEventAttendees(req.params.eventId);
      const attendeesWithEmail = attendees.filter(a => a.email);
      
      if (attendeesWithEmail.length === 0) {
        return res.status(400).json({ message: "No attendees have email addresses" });
      }

      // Use authoritative event data from database, not client
      const eventName = event.name;
      const eventDate = format(new Date(event.date), "EEEE, MMMM d, yyyy");
      const venue = event.venue || "Hotel Radisson Blu Plaza Delhi Airport | 5 Star";
      const venueAddress = event.venueAddress || "Near NH 8, Block R, Mahipalpur Extension, Mahipalpur, New Delhi, Delhi 110037";
      const venuePhone = "+91 11 4250 0500";
      const mapsLink = "https://maps.app.goo.gl/bvxYw1wNXas1G4TF9";

      const { client, fromEmail } = await getUncachableResendClient();
      
      let sent = 0;
      let failed = 0;
      const errors: string[] = [];

      // Send personalized emails in batches
      const batchSize = 10;
      for (let i = 0; i < attendeesWithEmail.length; i += batchSize) {
        const batch = attendeesWithEmail.slice(i, i + batchSize);
        
        const promises = batch.map(async (attendee) => {
          const ticketId = attendee.ticketId || "PENDING";
          
          // Generate QR code on demand if missing
          let qrCode = attendee.ticketQr;
          if (!qrCode && ticketId !== "PENDING") {
            const QRCode = await import('qrcode');
            const qrData = JSON.stringify({
              ticketId: ticketId,
              name: attendee.name,
              eventId: req.params.eventId
            });
            qrCode = await QRCode.default.toDataURL(qrData, {
              width: 200,
              margin: 2,
              color: { dark: '#000000', light: '#ffffff' }
            });
          }
          
          const personalizedHtml = generateEventEmailHtml({
            attendeeName: attendee.name,
            ticketId,
            ticketCount: attendee.ticketCount || 1,
            eventName,
            eventDate,
            venue,
            venueAddress,
            venuePhone,
            mapsLink,
            qrCode: qrCode || undefined,
            isTest: false,
            eventType: event.type || '',
            slotTime: attendee.slotTime || undefined
          });

          // IBS events have simpler text version
          const textContent = event.type === 'ibs' 
            ? `Hello ${attendee.name}!\n\nYour ticket for ${eventName} is confirmed.\n\nNumber of Tickets: ${attendee.ticketCount || 1}\nDate: ${eventDate}\n\nYour Batch: ${attendee.slotTime || 'To be assigned'}\nPlease arrive 15 minutes before your batch timing.\n\nVenue: Radisson Blu Plaza\n${venueAddress}\nPhone: ${venuePhone}\n\nImportant Instructions:\n- 1 person per ticket\n- Arrive 15 mins before your batch time for smooth check-in\n\nWe look forward to seeing you!\n\nBest Regards,\nGaurav\n+91 8851492209\nTeam Suprans\ncs@suprans.in`
            : `Your ticket for ${eventName} is confirmed. Ticket ID: ${ticketId}. Event Date: ${eventDate}. Venue: ${venue}, ${venueAddress}`;

          try {
            await client.emails.send({
              from: fromEmail || 'Suprans <noreply@suprans.in>',
              to: attendee.email!,
              subject: `Your Ticket for ${eventName} - ${eventDate}`,
              html: personalizedHtml,
              text: textContent
            });
            sent++;
          } catch (error: any) {
            failed++;
            errors.push(`${attendee.email}: ${error.message}`);
          }
        });
        
        await Promise.all(promises);
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < attendeesWithEmail.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      res.json({
        message: `Sent ${sent} emails successfully${failed > 0 ? `, ${failed} failed` : ''}`,
        success: failed === 0,
        sent,
        failed,
        errors
      });
    } catch (error: any) {
      console.error('Bulk email error:', error);
      res.status(500).json({ message: error.message || "Failed to send emails" });
    }
  });

  // Send bulk SMS to all event attendees - personalized per attendee
  app.post("/api/events/:eventId/send-bulk-sms", requireAuth, async (req, res, next) => {
    try {
      const { sendBulkSms } = await import('./twilio');
      const { format } = await import('date-fns');
      
      const event = await storage.getEvent(req.params.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const attendees = await storage.getEventAttendees(req.params.eventId);
      const attendeesWithPhone = attendees.filter(a => a.phone);
      
      if (attendeesWithPhone.length === 0) {
        return res.status(400).json({ message: "No attendees have phone numbers" });
      }

      // Use authoritative event data from database
      const eventName = event.name;
      const eventDate = format(new Date(event.date), "EEEE, MMMM d, yyyy");
      const venue = event.venue || "Hotel Details & Contact";
      const venueAddress = event.venueAddress || "Near NH 8, Block R, Mahipalpur Extension, Mahipalpur, New Delhi, Delhi 110037";

      // Build personalized messages
      const recipients = attendeesWithPhone.map(attendee => {
        const ticketId = attendee.ticketId || "PENDING";
        const message = `Dear ${attendee.name},

Greetings from Team Suprans!

Your registration for ${eventName} is confirmed.

Ticket ID: ${ticketId}
Date: ${eventDate}
Venue: ${venue}
Address: ${venueAddress}

Event Schedule:
- 9:00 AM - Registration & Breakfast
- 10:30 AM - Event Begins
- 1:30 PM - Lunch
- 5:00 PM - Event Closes

Please show this message at the registration desk.

Team Suprans`;

        return { phone: attendee.phone!, message };
      });

      const result = await sendBulkSms(recipients);

      res.json({
        message: `Sent ${result.sent} SMS messages successfully${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
        success: result.failed === 0,
        ...result
      });
    } catch (error: any) {
      console.error('Bulk SMS error:', error);
      res.status(500).json({ message: error.message || "Failed to send SMS messages" });
    }
  });

  // Send bulk WhatsApp to all event attendees - personalized per attendee
  app.post("/api/events/:eventId/send-bulk-whatsapp", requireAuth, async (req, res, next) => {
    try {
      const { sendBulkWhatsApp } = await import('./twilio');
      const { format } = await import('date-fns');
      
      const event = await storage.getEvent(req.params.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const attendees = await storage.getEventAttendees(req.params.eventId);
      const attendeesWithPhone = attendees.filter(a => a.phone);
      
      if (attendeesWithPhone.length === 0) {
        return res.status(400).json({ message: "No attendees have phone numbers" });
      }

      // Use authoritative event data from database
      const eventName = event.name;
      const eventDate = format(new Date(event.date), "EEEE, MMMM d, yyyy");
      const venue = event.venue || "Hotel Details & Contact";
      const venueAddress = event.venueAddress || "Near NH 8, Block R, Mahipalpur Extension, Mahipalpur, New Delhi, Delhi 110037";

      // Build personalized messages
      const recipients = attendeesWithPhone.map(attendee => {
        const ticketId = attendee.ticketId || "PENDING";
        const ticketCount = attendee.ticketCount || 1;
        const message = `Hello ${attendee.name}!

Your ticket for *${eventName}* is confirmed.

*Ticket ID:* ${ticketId}
*Number of Tickets:* ${ticketCount}
*Date:* ${eventDate}

*Venue:* Radisson Blu Plaza
${venueAddress}
Phone: +91 11 4250 0500
Google Maps: https://maps.app.goo.gl/bvxYw1wNXas1G4TF9

*Event Schedule:*
• 8:30 AM - 10:00 AM: Registration & Breakfast
• 10:00 AM: Event Begins
• 1:30 PM: Lunch
• 3:00-3:30 PM: Event Closes

*Important Instructions:*
• 1 person per ticket
• First Come First Served (FCFS) seating
• Hi-Tea and Lunch included
• Arrive 30 mins before event start for smooth check-in

We look forward to seeing you!

Best Regards,
Gaurav
Team Suprans
+91 8851492209
cs@suprans.in`;

        return { phone: attendee.phone!, message };
      });

      const result = await sendBulkWhatsApp(recipients);

      res.json({
        message: `Sent ${result.sent} WhatsApp messages successfully${result.failed > 0 ? `, ${result.failed} failed` : ''}`,
        success: result.failed === 0,
        ...result
      });
    } catch (error: any) {
      console.error('Bulk WhatsApp error:', error);
      res.status(500).json({ message: error.message || "Failed to send WhatsApp messages" });
    }
  });

  // Test send endpoints - send to a single recipient for preview/testing
  app.post("/api/events/:eventId/test-email", requireAuth, async (req, res, next) => {
    try {
      const { getUncachableResendClient } = await import('./resend');
      const { format } = await import('date-fns');
      
      const { testEmail } = req.body;
      if (!testEmail) {
        return res.status(400).json({ message: "Test email address is required" });
      }

      const event = await storage.getEvent(req.params.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const eventName = event.name;
      const eventDate = format(new Date(event.date), "EEEE, MMMM d, yyyy");
      const venue = event.venue || "Hotel Radisson Blu Plaza Delhi Airport | 5 Star";
      const venueAddress = event.venueAddress || "Near NH 8, Block R, Mahipalpur Extension, Mahipalpur, New Delhi, Delhi 110037";
      const venuePhone = "+91 11 4250 0500";
      const mapsLink = "https://maps.app.goo.gl/bvxYw1wNXas1G4TF9";

      const { client, fromEmail } = await getUncachableResendClient();
      
      // Sample QR code for test preview
      const sampleQrCode = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAXNSR0IArs4c6QAABk5JREFUeF7t3UFu4zAQRdH0/Q+dXgRIAmQWFimKP5/rVBYEv15Rtvz9+fn5/OMPAgQC/xIQkH9x+CICPwICAuEDAYEAAY+ADwQEAgT+2/DL5+fnH/7vfyOQP8r/r9X/E/D7H9v/AJO/fwLy8xOQ+xN5+XIA8nP9AHJ/Ii9fDkB+rh9A7k/k5csJyPP1A0h8Il9fAYDE9/ryFQTkefsAEp/I11cAIPG9vnwFAXne/r/6bxfKZ/1bBDL+UgGJ+/7yFR4Akl8QgMQn8vUVAEh8ry9fQUCetw8g8Yl8fQUAEt/ry1cQkOftA0h8Il9fAYDE9/ryFQTkefufur8d/9+O/11H/vz76xdA8gvyzzsAkJ+f9O8/CUj8+n35CgIkfn2+fIUHgOQX5Mn7ACS+51+/ggCJ7/nlKwiQ+J5/+fJPAJJfkI/2A5D4nn/9CgIkvueXrwBA4nv+9cs/AWR/2n0fJP9z/+ELtZ8LoP7/2f5L/Y8/v34BJL8g/7yDT/+rDZDnHwCA5BfkXP9CQJ5vAEDiE/n6CgIkvteXr9B+rk/tXwjI8/YBJD6Rr68AQOKefvnyAvJz/QASX5AvX0FAftYPIPGJfHmF9vP8BUh+5P8B8vP/+fkBJL7gz1dIQH6ud2j/vgMguVz+ov0AcndLAuJHfn4AuT+Ru5dvP9dfgORH/m0Hb/8BvfvE35+kf99xeR0gfx8g/+3IAJJekX/4+hMOH/w//uH/5vf3j4D8rAeQ+xN5+XJ/cnn/B///mADyH50HJP4DP/w/xvyfA/0DyP2JvHy5AUl8ogD5+wDy9xHy3w4NIPmRB0h+Qv/1ywHys/4A5P5EXr6cgDxfv0+2P6D8n/qP/u8A8v8A+W8hAfm/AfLfQgLycwNI/IJ8+nJq/2n/1H/+owLI8wkAJL4gn76cgDxfvy8CicuJX5F//3ID8vOD+/S+BpL8fv/l/8h+IPF9evhK7fctgP//r+L/7xcAknwJ/l+o/X8e4OH/7B9++g9A8jvzzzsA+fkl9O/fvH/7+u0PoN0n7rrXe23/7f//JCDx9+Dj1weQ/2+yQ9c/gORH/l+A/H2A/LdDtyT/+gMC8vMD+O+nFZDk+0FAfu4DIPcn8vLlBOT5+gEkPpGvr6D2vy3v/38EJL8i778WkH9M4O+z5Bf8zxdqT/5bkH8A+e8AyX9IH76agPw+QPRzh34LCMjPjwCQ+xO5f7kH2n8E5P5EXr6cgDxfP4DEJ/L1FQTk5/oBJL4gX16h/bwfIPf/dPLf5fvvdwBJfsE//fwOIPGJvH8F9f/c+rT+ESTxhfr69QASX/D3r6D+X4fvt+L/3p//+W9D/nsMkOT75O9Xar9E/v8PAiQ+EYD8fQfG/5qF9i8t/75T+0T+46tZ8n8A+e8Ayfe5R9c/guQn8s87AJLfl/uvdx9D/icQX6hv34eA5Bf8n/9bIL7wH97V/i2A/D6Q/DtW+7cAZT8X/f0Akv9A+vtB8n8IyP87EUDyE/n06wPy8wPIt0e//eS+f6+A/P4D5L8F9X+Q/IH+6Qn/80/x6Z8g8YF8+noD8vN+gNyf6P0rtH+R/P/zRwT+54nqf6Tp/6kJJPl9eP967V8k/4cn8v61AHl/or9f8e59vwPI/13JH+rP/4GAPHxK8gv+n0f5p/9APkX59x3f6xP/h4D+7qH/hyN+QZ7+v78H5NMvEvf9ACT+p4NvwOT/9G/9f/wEyT9Svvv67ecJyH8L/fy3A5BPP84ASX7B/+0KD/8X/8hv/B+e+PT/9e8g+T81/+vA/u0GAfn9BsjdD+yH/xD4u2UA+ecl/vAfQuJHJH+1/0Dt30i+CSTJn9z/+E7tE/12/wCQn/v/l4f/g/9e/n/5L/+HP/T/8v/+/Z8B8vdPkv9L8s87AJL8K+rfLwEg/x0g+Y+S/16s/b//+wFJfKHevUJ7zX/e/31/gPwfAnJ/onevICD3J3L3cv8l8P/xJD/yJyD+dMnHr+9Hyv8hIF/+f0pyQ/LvxP/1D/+fMd+C/N+x+ov/x/2v/+EfGvntE/0m8OQ/Gv87IM+/jx5+/5MA+ff+3+8AkPy+/PMOgOR36N3rD8jdj+zb/wmIf5N49w4AkrzzFy8vIA//j/Dvf/v/BSLaLbcWuLHsAAAAAElFTkSuQmCC";
      
      const personalizedHtml = generateEventEmailHtml({
        attendeeName: "[Sample Attendee]",
        ticketId: "SBC-TEST-001",
        ticketCount: 3, // Sample with 3 tickets to show multi-ticket display
        eventName,
        eventDate,
        venue,
        venueAddress,
        venuePhone,
        mapsLink,
        qrCode: sampleQrCode,
        isTest: true
      });

      const emailResult = await client.emails.send({
        from: fromEmail || 'Suprans <noreply@suprans.in>',
        to: testEmail,
        subject: `[TEST] Your Ticket for ${eventName} - ${eventDate}`,
        html: personalizedHtml,
        text: `[TEST EMAIL] Your ticket for ${eventName} is confirmed. Event Date: ${eventDate}. Venue: ${venue}, ${venueAddress}`
      });

      console.log('Resend API response:', JSON.stringify(emailResult, null, 2));
      console.log('From email used:', fromEmail);

      if (emailResult.error) {
        return res.status(400).json({ 
          message: `Failed to send: ${emailResult.error.message || JSON.stringify(emailResult.error)}`, 
          success: false,
          error: emailResult.error
        });
      }

      res.json({ 
        message: `Test email sent to ${testEmail}`, 
        success: true,
        emailId: emailResult.data?.id,
        fromEmail: fromEmail
      });
    } catch (error: any) {
      console.error('Test email error:', error);
      res.status(500).json({ message: error.message || "Failed to send test email" });
    }
  });

  app.post("/api/events/:eventId/test-sms", requireAuth, async (req, res, next) => {
    try {
      const { sendSms } = await import('./twilio');
      const { format } = await import('date-fns');
      
      const { testPhone } = req.body;
      if (!testPhone) {
        return res.status(400).json({ message: "Test phone number is required" });
      }

      const event = await storage.getEvent(req.params.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const eventName = event.name;
      const eventDate = format(new Date(event.date), "EEEE, MMMM d, yyyy");
      const venue = event.venue || "Hotel Details & Contact";
      const venueAddress = event.venueAddress || "Near NH 8, Block R, Mahipalpur Extension, Mahipalpur, New Delhi, Delhi 110037";

      const message = `[TEST SMS]

Dear [Attendee Name],

Your registration for ${eventName} is confirmed.

Ticket ID: [TICKET-ID]
Date: ${eventDate}
Venue: ${venue}
Address: ${venueAddress}

Event Schedule:
- 9:00 AM - Registration & Breakfast
- 10:30 AM - Event Begins
- 1:30 PM - Lunch
- 5:00 PM - Event Closes

Team Suprans`;

      await sendSms({ to: testPhone, message });

      res.json({ message: `Test SMS sent to ${testPhone}`, success: true });
    } catch (error: any) {
      console.error('Test SMS error:', error);
      res.status(500).json({ message: error.message || "Failed to send test SMS" });
    }
  });

  app.post("/api/events/:eventId/test-whatsapp", requireAuth, async (req, res, next) => {
    try {
      const { sendWhatsApp } = await import('./twilio');
      const { format } = await import('date-fns');
      
      const { testPhone } = req.body;
      if (!testPhone) {
        return res.status(400).json({ message: "Test phone number is required" });
      }

      const event = await storage.getEvent(req.params.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const eventName = event.name;
      const eventDate = format(new Date(event.date), "EEEE, MMMM d, yyyy");
      const venue = event.venue || "Hotel Details & Contact";
      const venueAddress = event.venueAddress || "Near NH 8, Block R, Mahipalpur Extension, Mahipalpur, New Delhi, Delhi 110037";

      const message = `[TEST MESSAGE]

Hello [Attendee Name]!

Your ticket for *${eventName}* is confirmed.

*Ticket ID:* [TICKET-ID]
*Number of Tickets:* 1
*Date:* ${eventDate}

*Venue:* Radisson Blu Plaza
${venueAddress}
Phone: +91 11 4250 0500
Google Maps: https://maps.app.goo.gl/bvxYw1wNXas1G4TF9

*Event Schedule:*
• 8:30 AM - 10:00 AM: Registration & Breakfast
• 10:00 AM: Event Begins
• 1:30 PM: Lunch
• 3:00-3:30 PM: Event Closes

*Important Instructions:*
• 1 person per ticket
• First Come First Served (FCFS) seating
• Hi-Tea and Lunch included
• Arrive 30 mins before event start for smooth check-in

We look forward to seeing you!

Best Regards,
Gaurav
Team Suprans
+91 8851492209
cs@suprans.in`;

      await sendWhatsApp({ to: testPhone, message });

      res.json({ message: `Test WhatsApp message sent to ${testPhone}`, success: true });
    } catch (error: any) {
      console.error('Test WhatsApp error:', error);
      res.status(500).json({ message: error.message || "Failed to send test WhatsApp message" });
    }
  });

  // Get message templates/preview for an event
  app.get("/api/events/:eventId/message-templates", requireAuth, async (req, res, next) => {
    try {
      const { format } = await import('date-fns');
      
      const event = await storage.getEvent(req.params.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const eventName = event.name;
      const eventDate = format(new Date(event.date), "EEEE, MMMM d, yyyy");
      const venue = event.venue || "Hotel Details & Contact";
      const venueAddress = event.venueAddress || "Near NH 8, Block R, Mahipalpur Extension, Mahipalpur, New Delhi, Delhi 110037";
      const venuePhone = "+91 11 4250 0500";
      const mapsLink = "https://maps.app.goo.gl/bvxYw1wNXas1G4TF9";

      const smsTemplate = `Dear [Attendee Name],

Greetings from Team Suprans!

Your registration for ${eventName} is confirmed.

Ticket ID: [TICKET-ID]
Number of Tickets: [TICKET-COUNT]
Date: ${eventDate}
Venue: Radisson Blu Plaza
Address: ${venueAddress}

Event Schedule:
- 8:30 AM - Registration & Breakfast
- 10:00 AM - Event Begins
- 1:30 PM - Lunch
- 3:00-3:30 PM - Event Closes

Important: 1 person per ticket. FCFS seating. Arrive 30 mins early.

Best Regards,
Gaurav, Team Suprans
+91 8851492209`;

      const whatsappTemplate = `Hello [Attendee Name]!

Your ticket for *${eventName}* is confirmed.

*Ticket ID:* [TICKET-ID]
*Number of Tickets:* [TICKET-COUNT]
*Date:* ${eventDate}

*Venue:* Radisson Blu Plaza
${venueAddress}
Phone: ${venuePhone}
Google Maps: ${mapsLink}

*Event Schedule:*
• 8:30 AM - 10:00 AM: Registration & Breakfast
• 10:00 AM: Event Begins
• 1:30 PM: Lunch
• 3:00-3:30 PM: Event Closes

*Important Instructions:*
• 1 person per ticket
• First Come First Served (FCFS) seating
• Hi-Tea and Lunch included
• Arrive 30 mins before event start for smooth check-in

We look forward to seeing you!

Best Regards,
Gaurav
Team Suprans
+91 8851492209
cs@suprans.in`;

      const emailSubject = `Your Ticket for ${eventName} - ${eventDate}`;
      const emailPreview = `
Dear [Attendee Name],

Greetings from Team Suprans!

Your registration for ${eventName} is confirmed.

TICKET DETAILS:
- Ticket ID: [TICKET-ID]
- Number of Tickets: [TICKET-COUNT]
- Name: [Attendee Name]
- Event Date: ${eventDate}

VENUE DETAILS:
- Radisson Blu Plaza
- ${venueAddress}
- Phone: ${venuePhone}
- Google Maps: ${mapsLink}

EVENT SCHEDULE:
- 8:30 AM - 10:00 AM: Registration & Breakfast
- 10:00 AM: Event Begins
- 1:30 PM: Lunch
- 3:00-3:30 PM: Event Closes

IMPORTANT INSTRUCTIONS:
- 1 person per ticket
- First Come First Served (FCFS) seating
- Hi-Tea and Lunch included
- Arrive 30 mins before event start for smooth check-in

We look forward to seeing you!

Best Regards,
Gaurav
Team Suprans
+91 8851492209
cs@suprans.in`;

      res.json({
        sms: smsTemplate,
        whatsapp: whatsappTemplate,
        emailSubject,
        emailPreview,
        eventDetails: {
          name: eventName,
          date: eventDate,
          venue,
          venueAddress,
          venuePhone,
          mapsLink
        }
      });
    } catch (error: any) {
      console.error('Get templates error:', error);
      res.status(500).json({ message: error.message || "Failed to get templates" });
    }
  });

  // Event Hotels
  app.get("/api/events/:eventId/hotels", requireAuth, async (req, res, next) => {
    try {
      const hotels = await storage.getEventHotels(req.params.eventId);
      res.json(hotels);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/events/:eventId/hotels", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertEventHotelSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
      });
      const hotel = await storage.createEventHotel(parsed);
      res.status(201).json(hotel);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/events/:eventId/hotels/:id", requireAuth, async (req, res, next) => {
    try {
      const hotel = await storage.updateEventHotel(req.params.id, req.body);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel booking not found" });
      }
      res.json(hotel);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/events/:eventId/hotels/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteEventHotel(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Hotel booking not found" });
      }
      res.json({ message: "Hotel booking deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Event Flights
  app.get("/api/events/:eventId/flights", requireAuth, async (req, res, next) => {
    try {
      const flights = await storage.getEventFlights(req.params.eventId);
      res.json(flights);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/events/:eventId/flights", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertEventFlightSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
      });
      const flight = await storage.createEventFlight(parsed);
      res.status(201).json(flight);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/events/:eventId/flights/:id", requireAuth, async (req, res, next) => {
    try {
      const flight = await storage.updateEventFlight(req.params.id, req.body);
      if (!flight) {
        return res.status(404).json({ message: "Flight booking not found" });
      }
      res.json(flight);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/events/:eventId/flights/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteEventFlight(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Flight booking not found" });
      }
      res.json({ message: "Flight booking deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Event Creatives
  app.get("/api/events/:eventId/creatives", requireAuth, async (req, res, next) => {
    try {
      const creatives = await storage.getEventCreatives(req.params.eventId);
      res.json(creatives);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/events/:eventId/creatives", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertEventCreativeSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
      });
      const creative = await storage.createEventCreative(parsed);
      res.status(201).json(creative);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/events/:eventId/creatives/:id", requireAuth, async (req, res, next) => {
    try {
      const creative = await storage.updateEventCreative(req.params.id, req.body);
      if (!creative) {
        return res.status(404).json({ message: "Creative not found" });
      }
      res.json(creative);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/events/:eventId/creatives/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteEventCreative(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Creative not found" });
      }
      res.json({ message: "Creative deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Event Packing Items
  app.get("/api/events/:eventId/packing", requireAuth, async (req, res, next) => {
    try {
      const items = await storage.getEventPackingItems(req.params.eventId);
      res.json(items);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/events/:eventId/packing", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertEventPackingItemSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
      });
      const item = await storage.createEventPackingItem(parsed);
      res.status(201).json(item);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/events/:eventId/packing/:id", requireAuth, async (req, res, next) => {
    try {
      const item = await storage.updateEventPackingItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ message: "Packing item not found" });
      }
      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/events/:eventId/packing/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteEventPackingItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Packing item not found" });
      }
      res.json({ message: "Packing item deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Event Communications
  app.get("/api/events/:eventId/communications", requireAuth, async (req, res, next) => {
    try {
      const comms = await storage.getEventCommunications(req.params.eventId);
      res.json(comms);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/events/:eventId/communications", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertEventCommunicationSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
      });
      const comm = await storage.createEventCommunication(parsed);
      res.status(201).json(comm);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/events/:eventId/communications/:id", requireAuth, async (req, res, next) => {
    try {
      const comm = await storage.updateEventCommunication(req.params.id, req.body);
      if (!comm) {
        return res.status(404).json({ message: "Communication not found" });
      }
      res.json(comm);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/events/:eventId/communications/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteEventCommunication(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Communication not found" });
      }
      res.json({ message: "Communication deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Event Presentations
  app.get("/api/events/:eventId/presentations", requireAuth, async (req, res, next) => {
    try {
      const presentations = await storage.getEventPresentations(req.params.eventId);
      res.json(presentations);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/events/:eventId/presentations", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertEventPresentationSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
      });
      const presentation = await storage.createEventPresentation(parsed);
      res.status(201).json(presentation);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/events/:eventId/presentations/:id", requireAuth, async (req, res, next) => {
    try {
      const presentation = await storage.updateEventPresentation(req.params.id, req.body);
      if (!presentation) {
        return res.status(404).json({ message: "Presentation not found" });
      }
      res.json(presentation);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/events/:eventId/presentations/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteEventPresentation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Presentation not found" });
      }
      res.json({ message: "Presentation deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Event Team Contacts Routes
  app.get("/api/events/:eventId/team-contacts", requireAuth, async (req, res, next) => {
    try {
      const contacts = await storage.getEventTeamContacts(req.params.eventId);
      res.json(contacts);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/events/:eventId/team-contacts", requireAuth, async (req, res, next) => {
    try {
      const contact = await storage.createEventTeamContact({
        ...req.body,
        eventId: req.params.eventId,
      });
      res.status(201).json(contact);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/events/:eventId/team-contacts/:id", requireAuth, async (req, res, next) => {
    try {
      const contact = await storage.updateEventTeamContact(req.params.id, req.body);
      if (!contact) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json(contact);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/events/:eventId/team-contacts/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteEventTeamContact(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Contact not found" });
      }
      res.json({ message: "Contact deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Venue Comparisons Routes
  app.get("/api/venues", requireAuth, async (req, res, next) => {
    try {
      const city = req.query.city as string | undefined;
      const venues = await storage.getVenueComparisons(city);
      res.json(venues);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/venues/:id", requireAuth, async (req, res, next) => {
    try {
      const venue = await storage.getVenueComparison(req.params.id);
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      res.json(venue);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/venues", requireAuth, async (req, res, next) => {
    try {
      const venue = await storage.createVenueComparison(req.body);
      res.status(201).json(venue);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/venues/:id", requireAuth, async (req, res, next) => {
    try {
      const venue = await storage.updateVenueComparison(req.params.id, req.body);
      if (!venue) {
        return res.status(404).json({ message: "Venue not found" });
      }
      res.json(venue);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/venues/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteVenueComparison(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Venue not found" });
      }
      res.json({ message: "Venue deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Event Vendors Routes
  app.get("/api/events/:eventId/vendors", requireAuth, async (req, res, next) => {
    try {
      const vendors = await storage.getEventVendors(req.params.eventId);
      res.json(vendors);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/events/:eventId/vendors", requireAuth, async (req, res, next) => {
    try {
      const vendor = await storage.createEventVendor({
        ...req.body,
        eventId: req.params.eventId
      });
      res.status(201).json(vendor);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/events/:eventId/vendors/:id", requireAuth, async (req, res, next) => {
    try {
      const vendor = await storage.updateEventVendor(req.params.id, req.body);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/events/:eventId/vendors/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteEventVendor(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json({ message: "Vendor deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Event Vendor Items Routes
  app.get("/api/vendors/:vendorId/items", requireAuth, async (req, res, next) => {
    try {
      const items = await storage.getEventVendorItems(req.params.vendorId);
      res.json(items);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/vendors/:vendorId/items", requireAuth, async (req, res, next) => {
    try {
      const item = await storage.createEventVendorItem({
        ...req.body,
        vendorId: req.params.vendorId
      });
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/vendors/:vendorId/items/:id", requireAuth, async (req, res, next) => {
    try {
      const item = await storage.updateEventVendorItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/vendors/:vendorId/items/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteEventVendorItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Team Members routes
  app.get("/api/team-members", requireAuth, async (req, res, next) => {
    try {
      const { teamId } = req.query;
      if (!teamId || typeof teamId !== 'string') {
        return res.status(400).json({ message: "teamId is required" });
      }
      const members = await storage.getTeamMembers(teamId);
      // Fetch user details for each member
      const membersWithUsers = await Promise.all(
        members.map(async (member) => {
          const user = await storage.getUser(member.userId);
          return { ...member, user };
        })
      );
      res.json(membersWithUsers.filter(m => m.user));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/team-members", requireAuth, async (req, res, next) => {
    try {
      const member = await storage.createTeamMember(req.body);
      res.status(201).json(member);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/team-members/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteTeamMember(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Team member not found" });
      }
      res.json({ message: "Team member removed successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Channel routes
  app.get("/api/channels", requireAuth, async (req, res, next) => {
    try {
      const channels = await storage.getChannels();
      res.json(channels);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/channels/team/:teamId", requireAuth, async (req, res, next) => {
    try {
      let channel = await storage.getChannelByTeamId(req.params.teamId);
      // Auto-create channel if it doesn't exist
      if (!channel) {
        channel = await storage.createChannel({
          teamId: req.params.teamId,
          name: req.params.teamId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: `Team channel for ${req.params.teamId}`
        });
      }
      res.json(channel);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/channels/:channelId/messages", requireAuth, async (req, res, next) => {
    try {
      const messages = await storage.getChannelMessages(req.params.channelId);
      // Fetch user details for each message
      const messagesWithUsers = await Promise.all(
        messages.map(async (msg) => {
          const user = await storage.getUser(msg.userId);
          return { ...msg, user };
        })
      );
      res.json(messagesWithUsers);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/channels/:channelId/messages", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const { content, attachmentUrl, attachmentType, attachmentName } = req.body;
      
      if (!content && !attachmentUrl) {
        return res.status(400).json({ message: "content or attachment is required" });
      }
      
      const message = await storage.createChannelMessage({
        channelId: req.params.channelId,
        userId: user.id,
        content: content || "",
        attachmentUrl,
        attachmentType,
        attachmentName
      });
      // Return with user details
      const messageWithUser = { ...message, user };
      res.status(201).json(messageWithUser);
    } catch (error) {
      next(error);
    }
  });

  // ========== DIRECT MESSAGE ROUTES ==========

  // Get all users for chat (individuals list)
  app.get("/api/chat/users", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as User;
      const allUsers = await storage.getAllUsers();
      // Exclude current user from the list
      const usersExcludingSelf = allUsers.filter(u => u.id !== currentUser.id);
      res.json(usersExcludingSelf);
    } catch (error) {
      next(error);
    }
  });

  // Get current user's direct message conversations
  app.get("/api/direct-messages/conversations", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const conversations = await storage.getDirectMessageConversations(user.id);
      // Enrich with user details and last message
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId = conv.user1Id === user.id ? conv.user2Id : conv.user1Id;
          const otherUser = await storage.getUser(otherUserId);
          const messages = await storage.getDirectMessages(conv.id);
          const lastMessage = messages[messages.length - 1];
          const unreadCount = messages.filter(m => !m.isRead && m.senderId !== user.id).length;
          return {
            ...conv,
            otherUser,
            lastMessage,
            unreadCount
          };
        })
      );
      res.json(enrichedConversations);
    } catch (error) {
      next(error);
    }
  });

  // Get or create a conversation with another user
  app.post("/api/direct-messages/conversations", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const { otherUserId } = req.body;
      if (!otherUserId) {
        return res.status(400).json({ message: "otherUserId is required" });
      }
      const conversation = await storage.getOrCreateDirectMessageConversation(user.id, otherUserId);
      const otherUser = await storage.getUser(otherUserId);
      res.json({ ...conversation, otherUser });
    } catch (error) {
      next(error);
    }
  });

  // Get messages in a conversation
  app.get("/api/direct-messages/conversations/:conversationId/messages", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const { conversationId } = req.params;
      
      // Mark messages as read
      await storage.markDirectMessagesAsRead(conversationId, user.id);
      
      const messages = await storage.getDirectMessages(conversationId);
      // Enrich with sender details
      const enrichedMessages = await Promise.all(
        messages.map(async (msg) => {
          const sender = await storage.getUser(msg.senderId);
          return { ...msg, sender };
        })
      );
      res.json(enrichedMessages);
    } catch (error) {
      next(error);
    }
  });

  // Send a direct message
  app.post("/api/direct-messages/conversations/:conversationId/messages", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const { conversationId } = req.params;
      const { content, attachmentUrl, attachmentType, attachmentName } = req.body;
      
      if (!content && !attachmentUrl) {
        return res.status(400).json({ message: "content or attachment is required" });
      }
      
      const message = await storage.createDirectMessage({
        conversationId,
        senderId: user.id,
        content: content || "",
        attachmentUrl,
        attachmentType,
        attachmentName
      });
      
      const messageWithSender = { ...message, sender: user };
      res.status(201).json(messageWithSender);
    } catch (error) {
      next(error);
    }
  });

  // Get unread message count
  app.get("/api/direct-messages/unread-count", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const count = await storage.getUnreadMessageCount(user.id);
      res.json({ count });
    } catch (error) {
      next(error);
    }
  });

  // ========== HR PORTAL ROUTES ==========

  // HR Employees
  app.get("/api/hr/employees", requireAuth, async (req, res, next) => {
    try {
      const { officeUnit, role, status, isSalesTeam } = req.query;
      const employees = await storage.getHrEmployees({
        officeUnit: officeUnit as string,
        role: role as string,
        status: status as string,
        isSalesTeam: isSalesTeam === 'true' ? true : isSalesTeam === 'false' ? false : undefined
      });
      res.json(employees);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/hr/employees/:id", requireAuth, async (req, res, next) => {
    try {
      const employee = await storage.getHrEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/hr/employees", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertHrEmployeeSchema.parse(req.body);
      const employee = await storage.createHrEmployee(parsed);
      res.status(201).json(employee);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/hr/employees/:id", requireAuth, async (req, res, next) => {
    try {
      const employee = await storage.updateHrEmployee(req.params.id, req.body);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/hr/employees/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const success = await storage.deleteHrEmployee(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json({ message: "Employee deleted" });
    } catch (error) {
      next(error);
    }
  });

  // Employee Documents
  app.get("/api/hr/employees/:employeeId/documents", requireAuth, async (req, res, next) => {
    try {
      const documents = await storage.getEmployeeDocuments(req.params.employeeId);
      res.json(documents);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/hr/employees/:employeeId/documents", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertEmployeeDocumentSchema.parse({
        ...req.body,
        employeeId: req.params.employeeId
      });
      const document = await storage.createEmployeeDocument(parsed);
      res.status(201).json(document);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.delete("/api/hr/documents/:id", requireAuth, async (req, res, next) => {
    try {
      const success = await storage.deleteEmployeeDocument(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json({ message: "Document deleted" });
    } catch (error) {
      next(error);
    }
  });

  // Assets
  app.get("/api/hr/assets", requireAuth, async (req, res, next) => {
    try {
      const { category, status, location } = req.query;
      const assets = await storage.getAssets({
        category: category as string,
        status: status as string,
        location: location as string
      });
      res.json(assets);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/hr/assets/:id", requireAuth, async (req, res, next) => {
    try {
      const asset = await storage.getAsset(req.params.id);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/hr/assets", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset(parsed);
      res.status(201).json(asset);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/hr/assets/:id", requireAuth, async (req, res, next) => {
    try {
      const asset = await storage.updateAsset(req.params.id, req.body);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/hr/assets/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const success = await storage.deleteAsset(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json({ message: "Asset deleted" });
    } catch (error) {
      next(error);
    }
  });

  // Asset Assignments
  app.get("/api/hr/assets/:assetId/assignments", requireAuth, async (req, res, next) => {
    try {
      const assignments = await storage.getAssetAssignments(req.params.assetId);
      res.json(assignments);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/hr/employees/:employeeId/assets", requireAuth, async (req, res, next) => {
    try {
      const assignments = await storage.getEmployeeAssets(req.params.employeeId);
      res.json(assignments);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/hr/assets/:assetId/assign", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertAssetAssignmentSchema.parse({
        ...req.body,
        assetId: req.params.assetId
      });
      const assignment = await storage.createAssetAssignment(parsed);
      // Update asset status and current assignee
      await storage.updateAsset(req.params.assetId, {
        status: 'assigned',
        currentAssigneeId: req.body.employeeId
      });
      res.status(201).json(assignment);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.post("/api/hr/assets/:assetId/return", requireAuth, async (req, res, next) => {
    try {
      // Find current assignment and mark as returned
      const assignments = await storage.getAssetAssignments(req.params.assetId);
      const currentAssignment = assignments.find(a => !a.returnedDate);
      if (currentAssignment) {
        await storage.updateAssetAssignment(currentAssignment.id, {
          returnedDate: new Date(),
          condition: req.body.condition || 'good'
        });
      }
      // Update asset status
      await storage.updateAsset(req.params.assetId, {
        status: 'available',
        currentAssigneeId: null
      });
      res.json({ message: "Asset returned" });
    } catch (error) {
      next(error);
    }
  });

  // Asset Maintenance
  app.get("/api/hr/assets/:assetId/maintenance", requireAuth, async (req, res, next) => {
    try {
      const maintenance = await storage.getAssetMaintenance(req.params.assetId);
      res.json(maintenance);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/hr/assets/:assetId/maintenance", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertAssetMaintenanceSchema.parse({
        ...req.body,
        assetId: req.params.assetId
      });
      const maintenance = await storage.createAssetMaintenance(parsed);
      // Update asset status if repair
      if (req.body.type === 'repair' && req.body.status === 'in_progress') {
        await storage.updateAsset(req.params.assetId, { status: 'repair' });
      }
      res.status(201).json(maintenance);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  app.patch("/api/hr/maintenance/:id", requireAuth, async (req, res, next) => {
    try {
      const maintenance = await storage.updateAssetMaintenance(req.params.id, req.body);
      if (!maintenance) {
        return res.status(404).json({ message: "Maintenance record not found" });
      }
      res.json(maintenance);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/hr/maintenance/:id", requireAuth, async (req, res, next) => {
    try {
      const success = await storage.deleteAssetMaintenance(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Maintenance record not found" });
      }
      res.json({ message: "Maintenance record deleted" });
    } catch (error) {
      next(error);
    }
  });

  // ========== HR Attendance Routes ==========
  
  // Get attendance by date (for HR dashboard)
  app.get("/api/hr/attendance", requireAuth, async (req, res, next) => {
    try {
      const dateParam = req.query.date as string;
      const date = dateParam ? new Date(dateParam) : new Date();
      const records = await storage.getAttendanceByDate(date);
      res.json(records);
    } catch (error) {
      next(error);
    }
  });

  // Get attendance for a specific employee
  app.get("/api/hr/employees/:employeeId/attendance", requireAuth, async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      let records;
      if (startDate && endDate) {
        records = await storage.getAttendanceByDateRange(
          req.params.employeeId,
          new Date(startDate as string),
          new Date(endDate as string)
        );
      } else {
        records = await storage.getAttendanceByEmployee(req.params.employeeId);
      }
      res.json(records);
    } catch (error) {
      next(error);
    }
  });

  // Create single attendance record
  app.post("/api/hr/attendance", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const parsed = insertAttendanceSchema.parse({
        ...req.body,
        markedBy: user.id
      });
      const record = await storage.createAttendance(parsed);
      res.status(201).json(record);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  // Bulk create attendance records (for marking all employees at once)
  app.post("/api/hr/attendance/bulk", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const records = req.body.records.map((r: any) => ({
        ...insertAttendanceSchema.parse(r),
        markedBy: user.id
      }));
      const created = await storage.bulkCreateAttendance(records);
      res.status(201).json(created);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  // Update attendance record
  app.patch("/api/hr/attendance/:id", requireAuth, async (req, res, next) => {
    try {
      const record = await storage.updateAttendance(req.params.id, req.body);
      if (!record) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      res.json(record);
    } catch (error) {
      next(error);
    }
  });

  // Delete attendance record
  app.delete("/api/hr/attendance/:id", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const success = await storage.deleteAttendance(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      res.json({ message: "Attendance record deleted" });
    } catch (error) {
      next(error);
    }
  });

  // ========== HR Leave Requests Routes ==========
  
  // Get all leave requests (HR admin view)
  app.get("/api/hr/leave-requests", requireAuth, async (req, res, next) => {
    try {
      const { status, employeeId } = req.query;
      let requests;
      if (status) {
        requests = await storage.getLeaveRequestsByStatus(status as string);
      } else if (employeeId) {
        requests = await storage.getLeaveRequestsByEmployee(employeeId as string);
      } else {
        requests = await storage.getLeaveRequests();
      }
      res.json(requests);
    } catch (error) {
      next(error);
    }
  });

  // Get single leave request
  app.get("/api/hr/leave-requests/:id", requireAuth, async (req, res, next) => {
    try {
      const request = await storage.getLeaveRequest(req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      res.json(request);
    } catch (error) {
      next(error);
    }
  });

  // Create leave request (employee submits)
  app.post("/api/hr/leave-requests", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertLeaveRequestSchema.parse(req.body);
      const request = await storage.createLeaveRequest(parsed);
      res.status(201).json(request);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromError(error).toString() });
      }
      next(error);
    }
  });

  // Update leave request (for approval/denial by HR)
  app.patch("/api/hr/leave-requests/:id", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const updates: any = { ...req.body };
      
      // If approving or denying, set the approver info
      if (req.body.status === 'approved' || req.body.status === 'denied') {
        updates.approvedBy = user.id;
        updates.processedAt = new Date();
      }
      
      const request = await storage.updateLeaveRequest(req.params.id, updates);
      if (!request) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      res.json(request);
    } catch (error) {
      next(error);
    }
  });

  // Delete leave request
  app.delete("/api/hr/leave-requests/:id", requireAuth, async (req, res, next) => {
    try {
      const success = await storage.deleteLeaveRequest(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Leave request not found" });
      }
      res.json({ message: "Leave request deleted" });
    } catch (error) {
      next(error);
    }
  });

  // ========== User-Scoped Routes (For Employee Self-Service) ==========
  
  // Get current user's leave requests
  app.get("/api/hr/my-leave-requests", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const requests = await storage.getLeaveRequestsByEmployee(user.id);
      res.json(requests);
    } catch (error) {
      next(error);
    }
  });

  // Get current user's attendance records
  app.get("/api/hr/my-attendance", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const records = await storage.getAttendanceByEmployee(user.id);
      res.json(records);
    } catch (error) {
      next(error);
    }
  });

  // ========== HR Job Openings Routes ==========
  
  // Get all job openings
  app.get("/api/hr/job-openings", requireAuth, async (req, res, next) => {
    try {
      const { status } = req.query;
      let openings;
      if (status) {
        openings = await storage.getJobOpeningsByStatus(status as string);
      } else {
        openings = await storage.getJobOpenings();
      }
      res.json(openings);
    } catch (error) {
      next(error);
    }
  });

  // Get single job opening
  app.get("/api/hr/job-openings/:id", requireAuth, async (req, res, next) => {
    try {
      const opening = await storage.getJobOpening(req.params.id);
      if (!opening) {
        return res.status(404).json({ message: "Job opening not found" });
      }
      res.json(opening);
    } catch (error) {
      next(error);
    }
  });

  // Create job opening
  app.post("/api/hr/job-openings", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertJobOpeningSchema.parse(req.body);
      const opening = await storage.createJobOpening(parsed);
      res.status(201).json(opening);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: fromError(error).message });
      }
      next(error);
    }
  });

  // Update job opening
  app.patch("/api/hr/job-openings/:id", requireAuth, async (req, res, next) => {
    try {
      const partialSchema = insertJobOpeningSchema.partial();
      const parsed = partialSchema.parse(req.body);
      const opening = await storage.updateJobOpening(req.params.id, parsed);
      if (!opening) {
        return res.status(404).json({ message: "Job opening not found" });
      }
      res.json(opening);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: fromError(error).message });
      }
      next(error);
    }
  });

  // Delete job opening
  app.delete("/api/hr/job-openings/:id", requireAuth, async (req, res, next) => {
    try {
      const success = await storage.deleteJobOpening(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Job opening not found" });
      }
      res.json({ message: "Job opening deleted" });
    } catch (error) {
      next(error);
    }
  });

  // ========== HR Job Portals Routes ==========
  
  // Get all job portals
  app.get("/api/hr/job-portals", requireAuth, async (req, res, next) => {
    try {
      const portals = await storage.getJobPortals();
      res.json(portals);
    } catch (error) {
      next(error);
    }
  });

  // Get single job portal
  app.get("/api/hr/job-portals/:id", requireAuth, async (req, res, next) => {
    try {
      const portal = await storage.getJobPortal(req.params.id);
      if (!portal) {
        return res.status(404).json({ message: "Job portal not found" });
      }
      res.json(portal);
    } catch (error) {
      next(error);
    }
  });

  // Create job portal
  app.post("/api/hr/job-portals", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertJobPortalSchema.parse(req.body);
      const portal = await storage.createJobPortal(parsed);
      res.status(201).json(portal);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: fromError(error).message });
      }
      next(error);
    }
  });

  // Update job portal
  app.patch("/api/hr/job-portals/:id", requireAuth, async (req, res, next) => {
    try {
      const partialSchema = insertJobPortalSchema.partial();
      const parsed = partialSchema.parse(req.body);
      const portal = await storage.updateJobPortal(req.params.id, parsed);
      if (!portal) {
        return res.status(404).json({ message: "Job portal not found" });
      }
      res.json(portal);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: fromError(error).message });
      }
      next(error);
    }
  });

  // Delete job portal
  app.delete("/api/hr/job-portals/:id", requireAuth, async (req, res, next) => {
    try {
      const success = await storage.deleteJobPortal(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Job portal not found" });
      }
      res.json({ message: "Job portal deleted" });
    } catch (error) {
      next(error);
    }
  });

  // Update last accessed time for a portal
  app.post("/api/hr/job-portals/:id/accessed", requireAuth, async (req, res, next) => {
    try {
      const portal = await storage.updateJobPortal(req.params.id, { lastAccessed: new Date() });
      if (!portal) {
        return res.status(404).json({ message: "Job portal not found" });
      }
      res.json(portal);
    } catch (error) {
      next(error);
    }
  });

  // ============== CANDIDATES ==============
  
  // Get all candidates with optional filters
  app.get("/api/hr/candidates", requireAuth, async (req, res, next) => {
    try {
      const { status, source, appliedFor } = req.query;
      const filters: { status?: string; source?: string; appliedFor?: string } = {};
      if (status && typeof status === 'string') filters.status = status;
      if (source && typeof source === 'string') filters.source = source;
      if (appliedFor && typeof appliedFor === 'string') filters.appliedFor = appliedFor;
      
      const candidateList = await storage.getCandidates(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(candidateList);
    } catch (error) {
      next(error);
    }
  });

  // Get single candidate
  app.get("/api/hr/candidates/:id", requireAuth, async (req, res, next) => {
    try {
      const candidate = await storage.getCandidate(req.params.id);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      next(error);
    }
  });

  // Create candidate
  app.post("/api/hr/candidates", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertCandidateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).toString() });
      }
      const candidate = await storage.createCandidate(parsed.data);
      res.status(201).json(candidate);
    } catch (error) {
      next(error);
    }
  });

  // Update candidate
  app.patch("/api/hr/candidates/:id", requireAuth, async (req, res, next) => {
    try {
      const candidate = await storage.updateCandidate(req.params.id, req.body);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      next(error);
    }
  });

  // Delete candidate
  app.delete("/api/hr/candidates/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteCandidate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      res.json({ message: "Candidate deleted" });
    } catch (error) {
      next(error);
    }
  });

  // ============== CANDIDATE CALLS ==============
  
  // Get calls for a candidate
  app.get("/api/hr/candidates/:id/calls", requireAuth, async (req, res, next) => {
    try {
      const calls = await storage.getCandidateCalls(req.params.id);
      res.json(calls);
    } catch (error) {
      next(error);
    }
  });

  // Get recent calls across all candidates
  app.get("/api/hr/calls/recent", requireAuth, async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const calls = await storage.getRecentCalls(limit);
      res.json(calls);
    } catch (error) {
      next(error);
    }
  });

  // Create call log for a candidate
  app.post("/api/hr/candidates/:id/calls", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertCandidateCallSchema.safeParse({
        ...req.body,
        candidateId: req.params.id
      });
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).toString() });
      }
      const call = await storage.createCandidateCall(parsed.data);
      res.status(201).json(call);
    } catch (error) {
      next(error);
    }
  });

  // Update call log
  app.patch("/api/hr/calls/:id", requireAuth, async (req, res, next) => {
    try {
      const call = await storage.updateCandidateCall(req.params.id, req.body);
      if (!call) {
        return res.status(404).json({ message: "Call not found" });
      }
      res.json(call);
    } catch (error) {
      next(error);
    }
  });

  // Delete call log
  app.delete("/api/hr/calls/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteCandidateCall(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Call not found" });
      }
      res.json({ message: "Call deleted" });
    } catch (error) {
      next(error);
    }
  });

  // ============== HR TEMPLATES ==============
  
  // Get all HR templates with optional filters
  app.get("/api/hr/templates", requireAuth, async (req, res, next) => {
    try {
      const { category, type } = req.query;
      const filters: { category?: string; type?: string } = {};
      if (category && typeof category === 'string') filters.category = category;
      if (type && typeof type === 'string') filters.type = type;
      
      const templateList = await storage.getHrTemplates(Object.keys(filters).length > 0 ? filters : undefined);
      res.json(templateList);
    } catch (error) {
      next(error);
    }
  });

  // Get single HR template
  app.get("/api/hr/templates/:id", requireAuth, async (req, res, next) => {
    try {
      const template = await storage.getHrTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      next(error);
    }
  });

  // Create HR template
  app.post("/api/hr/templates", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertHrTemplateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).toString() });
      }
      const template = await storage.createHrTemplate(parsed.data);
      res.status(201).json(template);
    } catch (error) {
      next(error);
    }
  });

  // Update HR template
  app.patch("/api/hr/templates/:id", requireAuth, async (req, res, next) => {
    try {
      const template = await storage.updateHrTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      next(error);
    }
  });

  // Delete HR template
  app.delete("/api/hr/templates/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteHrTemplate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json({ message: "Template deleted" });
    } catch (error) {
      next(error);
    }
  });

  // Increment template usage
  app.post("/api/hr/templates/:id/use", requireAuth, async (req, res, next) => {
    try {
      await storage.incrementHrTemplateUsage(req.params.id);
      res.json({ message: "Usage incremented" });
    } catch (error) {
      next(error);
    }
  });


  // ============== INTERVIEWS ==============
  
  // Get all interviews (filter by 'upcoming' or 'past')
  app.get("/api/hr/interviews", requireAuth, async (req, res, next) => {
    try {
      const { filter } = req.query;
      const validFilter = filter === 'upcoming' || filter === 'past' ? filter : undefined;
      const interviewList = await storage.getInterviews(validFilter);
      res.json(interviewList);
    } catch (error) {
      next(error);
    }
  });

  // Get single interview
  app.get("/api/hr/interviews/:id", requireAuth, async (req, res, next) => {
    try {
      const interview = await storage.getInterview(req.params.id);
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      res.json(interview);
    } catch (error) {
      next(error);
    }
  });

  // Create interview
  app.post("/api/hr/interviews", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertInterviewSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).toString() });
      }
      const interview = await storage.createInterview(parsed.data);
      res.status(201).json(interview);
    } catch (error) {
      next(error);
    }
  });

  // Bulk create interviews
  app.post("/api/hr/interviews/bulk", requireAuth, async (req, res, next) => {
    try {
      const { interviews: interviewsData } = req.body;
      if (!Array.isArray(interviewsData)) {
        return res.status(400).json({ message: "interviews must be an array" });
      }
      const result = await storage.bulkCreateInterviews(interviewsData);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  // Update interview
  app.patch("/api/hr/interviews/:id", requireAuth, async (req, res, next) => {
    try {
      const interview = await storage.updateInterview(req.params.id, req.body);
      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      res.json(interview);
    } catch (error) {
      next(error);
    }
  });

  // Delete interview
  app.delete("/api/hr/interviews/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteInterview(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Interview not found" });
      }
      res.json({ message: "Interview deleted" });
    } catch (error) {
      next(error);
    }
  });

  // ============================================================================
  // FAIRE WHOLESALE API ROUTES
  // ============================================================================

  // Faire Stores
  app.get("/api/faire/stores", requireAuth, async (req, res, next) => {
    try {
      const stores = await storage.getFaireStores();
      res.json(stores);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/faire/stores/:id", requireAuth, async (req, res, next) => {
    try {
      const store = await storage.getFaireStore(req.params.id);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      res.json(store);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/faire/stores", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertFaireStoreSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).message });
      }
      const store = await storage.createFaireStore(parsed.data);
      res.status(201).json(store);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/faire/stores/:id", requireAuth, async (req, res, next) => {
    try {
      const store = await storage.updateFaireStore(req.params.id, req.body);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      res.json(store);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/faire/stores/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteFaireStore(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Store not found" });
      }
      res.json({ message: "Store deleted" });
    } catch (error) {
      next(error);
    }
  });

  // Faire Suppliers
  app.get("/api/faire/suppliers", requireAuth, async (req, res, next) => {
    try {
      const suppliers = await storage.getFaireSuppliers();
      res.json(suppliers);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/faire/suppliers/:id", requireAuth, async (req, res, next) => {
    try {
      const supplier = await storage.getFaireSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/faire/suppliers", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertFaireSupplierSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).message });
      }
      const supplier = await storage.createFaireSupplier(parsed.data);
      res.status(201).json(supplier);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/faire/suppliers/:id", requireAuth, async (req, res, next) => {
    try {
      const supplier = await storage.updateFaireSupplier(req.params.id, req.body);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/faire/suppliers/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteFaireSupplier(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json({ message: "Supplier deleted" });
    } catch (error) {
      next(error);
    }
  });

  // Faire Products
  app.get("/api/faire/products", requireAuth, async (req, res, next) => {
    try {
      const products = await storage.getFaireProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/faire/products/:id", requireAuth, async (req, res, next) => {
    try {
      const product = await storage.getFaireProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/faire/products", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertFaireProductSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).message });
      }
      const product = await storage.createFaireProduct(parsed.data);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/faire/products/:id", requireAuth, async (req, res, next) => {
    try {
      const product = await storage.updateFaireProduct(req.params.id, req.body);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/faire/products/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteFaireProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted" });
    } catch (error) {
      next(error);
    }
  });

  // Faire Orders
  app.get("/api/faire/orders", requireAuth, async (req, res, next) => {
    try {
      const orders = await storage.getFaireOrders();
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/faire/orders/:id", requireAuth, async (req, res, next) => {
    try {
      const order = await storage.getFaireOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/faire/orders/:id", requireAuth, async (req, res, next) => {
    try {
      const order = await storage.updateFaireOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  // Faire Shipments
  app.get("/api/faire/shipments", requireAuth, async (req, res, next) => {
    try {
      const shipments = await storage.getFaireShipments();
      res.json(shipments);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/faire/shipments", requireAuth, async (req, res, next) => {
    try {
      const shipment = await storage.createFaireShipment(req.body);
      res.status(201).json(shipment);
    } catch (error) {
      next(error);
    }
  });

  // ============================================================================
  // LLC CLIENTS API ROUTES
  // ============================================================================

  // LLC Banks
  app.get("/api/llc/banks", requireAuth, async (req, res, next) => {
    try {
      const banks = await storage.getLLCBanks();
      res.json(banks);
    } catch (error) {
      next(error);
    }
  });

  // LLC Clients
  app.get("/api/llc/clients", requireAuth, async (req, res, next) => {
    try {
      const clients = await storage.getLLCClients();
      res.json(clients);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/llc/clients/:id", requireAuth, async (req, res, next) => {
    try {
      const client = await storage.getLLCClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/llc/clients", requireAuth, async (req, res, next) => {
    try {
      const parsed = insertLLCClientSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).message });
      }
      const client = await storage.createLLCClient(parsed.data);
      res.status(201).json(client);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/llc/clients/:id", requireAuth, async (req, res, next) => {
    try {
      const client = await storage.updateLLCClient(req.params.id, req.body);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/llc/clients/:id", requireAuth, async (req, res, next) => {
    try {
      const deleted = await storage.deleteLLCClient(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json({ message: "Client deleted" });
    } catch (error) {
      next(error);
    }
  });

  // LLC Client Documents
  app.get("/api/llc/clients/:clientId/documents", requireAuth, async (req, res, next) => {
    try {
      const documents = await storage.getLLCClientDocuments(req.params.clientId);
      res.json(documents);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/llc/clients/:clientId/documents", requireAuth, async (req, res, next) => {
    try {
      const document = await storage.createLLCClientDocument({
        ...req.body,
        clientId: req.params.clientId,
      });
      res.status(201).json(document);
    } catch (error) {
      next(error);
    }
  });

  // LLC Client Timeline
  app.get("/api/llc/clients/:clientId/timeline", requireAuth, async (req, res, next) => {
    try {
      const timeline = await storage.getLLCClientTimeline(req.params.clientId);
      res.json(timeline);
    } catch (error) {
      next(error);
    }
  });

  // Website Content API
  app.get("/api/website-content", async (req, res) => {
    const content = await storage.getWebsiteContent();
    res.json(content);
  });

  app.get("/api/website-content/:section", async (req, res) => {
    const content = await storage.getWebsiteContentBySection(req.params.section);
    res.json(content);
  });

  app.get("/api/public/website-content", async (req, res) => {
    const content = await storage.getWebsiteContent();
    const grouped: Record<string, Record<string, any>> = {};
    for (const item of content) {
      if (!grouped[item.section]) grouped[item.section] = {};
      grouped[item.section][item.key] = item.value;
    }
    res.json(grouped);
  });

  app.patch("/api/website-content", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== 'superadmin') {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const { section, key, value } = req.body;
    if (!section || !key || value === undefined) {
      return res.status(400).json({ message: "section, key, and value are required" });
    }
    const result = await storage.upsertWebsiteContent(section, key, value, (req.user as any).id);
    res.json(result);
  });

  // ============== PAYMENT REQUESTS (Collect Payment) ==============

  const createPaymentRequestSchema = z.object({
    customerName: z.string().min(1, "Customer name is required"),
    customerEmail: z.string().email().optional().or(z.literal("")),
    customerPhone: z.string().optional(),
    amount: z.number().positive("Amount must be positive"),
    currency: z.string().default("INR"),
    description: z.string().min(1, "Description is required"),
    receivingCompany: z.string().default("Startup Squad Pvt Ltd"),
    methods: z.array(z.enum(["upi_qr", "bank_details", "razorpay_link"])).min(1, "Select at least one method"),
    referenceId: z.string().optional(),
    notes: z.string().optional(),
  });

  app.get("/api/payment-requests", requireAuth, async (req, res, next) => {
    try {
      const requests = await storage.getPaymentRequests();
      res.json(requests);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/payment-requests/:id", requireAuth, async (req, res, next) => {
    try {
      const request = await storage.getPaymentRequest(req.params.id);
      if (!request) return res.status(404).json({ message: "Payment request not found" });
      res.json(request);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/payment-requests", requireAuth, async (req, res, next) => {
    try {
      const parsed = createPaymentRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).toString() });
      }
      const data = parsed.data;
      const user = req.user as User;

      const requestData: any = {
        customerName: data.customerName,
        customerEmail: data.customerEmail || null,
        customerPhone: data.customerPhone || null,
        amount: String(data.amount),
        currency: data.currency,
        description: data.description,
        receivingCompany: data.receivingCompany,
        methods: data.methods,
        referenceId: data.referenceId || null,
        notes: data.notes || null,
        createdBy: user.id,
        createdByName: user.name,
        status: "pending",
      };

      if (data.receivingCompany === "Startup Squad Pvt Ltd") {
        requestData.upiAddress = "8059153883@pthdfc";
        requestData.bankAccountNo = "9306566900";
      }

      if (data.methods.includes("razorpay_link")) {
        try {
          const Razorpay = (await import('razorpay')).default;
          const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
          });

          const linkPayload: any = {
            amount: Math.round(data.amount * 100),
            currency: data.currency || "INR",
            description: data.description,
            notify: { sms: false, email: false },
            notes: {
              created_by: user.name,
              created_by_email: user.email,
            },
          };

          if (data.customerName || data.customerEmail || data.customerPhone) {
            linkPayload.customer = {};
            if (data.customerName) linkPayload.customer.name = data.customerName;
            if (data.customerEmail) linkPayload.customer.email = data.customerEmail;
            if (data.customerPhone) linkPayload.customer.contact = data.customerPhone;
          }

          if (data.referenceId) linkPayload.reference_id = data.referenceId;

          const link = await razorpay.paymentLink.create(linkPayload);
          requestData.razorpayLinkId = link.id;
          requestData.razorpayLinkUrl = link.short_url;
          requestData.razorpayLinkStatus = link.status;
        } catch (rzpError: any) {
          console.error("Razorpay link creation failed:", rzpError.message);
        }
      }

      const result = await storage.createPaymentRequest(requestData);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  const updatePaymentStatusSchema = z.object({
    status: z.enum(["pending", "paid", "cancelled"]),
  });

  app.patch("/api/payment-requests/:id", requireAuth, async (req, res, next) => {
    try {
      const parsed = updatePaymentStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Only status updates are allowed (pending, paid, cancelled)" });
      }
      const updates: any = { status: parsed.data.status };
      if (parsed.data.status === "paid") updates.paidAt = new Date();
      const result = await storage.updatePaymentRequest(req.params.id, updates);
      if (!result) return res.status(404).json({ message: "Payment request not found" });
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  const uploadScreenshotSchema = z.object({
    screenshotUrl: z.string().min(1, "Screenshot URL is required"),
    note: z.string().optional(),
  });

  app.post("/api/payment-requests/:id/upload-screenshot", requireAuth, async (req, res, next) => {
    try {
      const parsed = uploadScreenshotSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: fromError(parsed.error).toString() });
      }

      const result = await storage.updatePaymentRequest(req.params.id, {
        paymentScreenshotUrl: parsed.data.screenshotUrl,
        paymentProofNote: parsed.data.note || null,
        status: "paid",
        paidAt: new Date() as any,
      });
      if (!result) return res.status(404).json({ message: "Payment request not found" });
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/payment-requests/:id", requireAuth, async (req, res, next) => {
    try {
      const success = await storage.deletePaymentRequest(req.params.id);
      if (!success) return res.status(404).json({ message: "Payment request not found" });
      res.json({ message: "Deleted" });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/seed-website-content", requireAuth, requireRole("superadmin"), async (req, res, next) => {
    try {
      const { seedWebsiteContent } = await import("./seed-website-content");
      await seedWebsiteContent(storage);
      res.json({ message: "Website content seeded successfully" });
    } catch (error) {
      next(error);
    }
  });

  // ============== SCHEDULING & BOOKING SYSTEM ==============

  // --- Booking Types ---
  const createBookingTypeSchema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    duration: z.number().int().positive().default(30),
    color: z.string().optional(),
    price: z.number().int().min(0).default(0),
    currency: z.string().default("INR"),
    location: z.string().optional(),
    bufferBefore: z.number().int().min(0).default(0),
    bufferAfter: z.number().int().min(0).default(10),
    maxBookingsPerDay: z.number().int().positive().optional(),
    requiresApproval: z.boolean().default(false),
    isActive: z.boolean().default(true),
  });

  app.get("/api/booking-types", requireAuth, async (req, res, next) => {
    try {
      const userId = req.query.userId as string | undefined;
      const types = await storage.getBookingTypes(userId);
      res.json(types);
    } catch (error) { next(error); }
  });

  app.get("/api/booking-types/:id", requireAuth, async (req, res, next) => {
    try {
      const bt = await storage.getBookingType(req.params.id);
      if (!bt) return res.status(404).json({ message: "Booking type not found" });
      res.json(bt);
    } catch (error) { next(error); }
  });

  app.post("/api/booking-types", requireAuth, async (req, res, next) => {
    try {
      const parsed = createBookingTypeSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: fromError(parsed.error).toString() });
      const user = req.user as User;
      const result = await storage.createBookingType({ ...parsed.data, userId: user.id });
      res.json(result);
    } catch (error) { next(error); }
  });

  app.patch("/api/booking-types/:id", requireAuth, async (req, res, next) => {
    try {
      const parsed = createBookingTypeSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: fromError(parsed.error).toString() });
      const user = req.user as User;
      const existing = await storage.getBookingType(req.params.id);
      if (!existing) return res.status(404).json({ message: "Booking type not found" });
      if (existing.userId !== user.id && user.role !== "superadmin") {
        return res.status(403).json({ message: "Not authorized to update this booking type" });
      }
      const result = await storage.updateBookingType(req.params.id, parsed.data);
      res.json(result);
    } catch (error) { next(error); }
  });

  app.delete("/api/booking-types/:id", requireAuth, async (req, res, next) => {
    try {
      const user = req.user as User;
      const existing = await storage.getBookingType(req.params.id);
      if (!existing) return res.status(404).json({ message: "Booking type not found" });
      if (existing.userId !== user.id && user.role !== "superadmin") {
        return res.status(403).json({ message: "Not authorized to delete this booking type" });
      }
      const success = await storage.deleteBookingType(req.params.id);
      res.json({ message: "Deleted" });
    } catch (error) { next(error); }
  });

  // --- Availability ---
  app.get("/api/availability/schedules", requireAuth, async (req, res, next) => {
    try {
      const userId = (req.query.userId as string) || (req.user as User).id;
      const schedules = await storage.getAvailabilitySchedules(userId);
      res.json(schedules);
    } catch (error) { next(error); }
  });

  const setAvailabilitySchema = z.object({
    schedules: z.array(z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string(),
      endTime: z.string(),
      isActive: z.boolean().default(true),
    })),
  });

  app.put("/api/availability/schedules", requireAuth, async (req, res, next) => {
    try {
      const parsed = setAvailabilitySchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: fromError(parsed.error).toString() });
      const userId = (req.user as User).id;
      const result = await storage.setAvailabilitySchedules(userId, parsed.data.schedules.map(s => ({ ...s, userId })));
      res.json(result);
    } catch (error) { next(error); }
  });

  app.get("/api/availability/overrides", requireAuth, async (req, res, next) => {
    try {
      const userId = (req.query.userId as string) || (req.user as User).id;
      const overrides = await storage.getAvailabilityOverrides(userId, req.query.from as string, req.query.to as string);
      res.json(overrides);
    } catch (error) { next(error); }
  });

  const createOverrideSchema = z.object({
    date: z.string(),
    isAvailable: z.boolean().default(false),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    reason: z.string().optional(),
  });

  app.post("/api/availability/overrides", requireAuth, async (req, res, next) => {
    try {
      const parsed = createOverrideSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: fromError(parsed.error).toString() });
      const userId = (req.user as User).id;
      const result = await storage.createAvailabilityOverride({ ...parsed.data, userId });
      res.json(result);
    } catch (error) { next(error); }
  });

  app.delete("/api/availability/overrides/:id", requireAuth, async (req, res, next) => {
    try {
      const success = await storage.deleteAvailabilityOverride(req.params.id);
      if (!success) return res.status(404).json({ message: "Override not found" });
      res.json({ message: "Deleted" });
    } catch (error) { next(error); }
  });

  // --- Bookings (authenticated) ---
  app.get("/api/bookings", requireAuth, async (req, res, next) => {
    try {
      const options: any = {};
      if (req.query.hostUserId) options.hostUserId = req.query.hostUserId;
      if (req.query.status) options.status = req.query.status;
      if (req.query.from) options.from = req.query.from;
      if (req.query.to) options.to = req.query.to;
      const bookings = await storage.getBookings(options);
      res.json(bookings);
    } catch (error) { next(error); }
  });

  app.get("/api/bookings/:id", requireAuth, async (req, res, next) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      res.json(booking);
    } catch (error) { next(error); }
  });

  const updateBookingSchema = z.object({
    status: z.enum(["confirmed", "completed", "cancelled", "no_show", "rescheduled"]).optional(),
    internalNotes: z.string().optional(),
    cancellationReason: z.string().optional(),
    meetingLink: z.string().optional(),
  });

  app.patch("/api/bookings/:id", requireAuth, async (req, res, next) => {
    try {
      const parsed = updateBookingSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: fromError(parsed.error).toString() });
      const user = req.user as User;
      const existing = await storage.getBooking(req.params.id);
      if (!existing) return res.status(404).json({ message: "Booking not found" });
      if (existing.hostUserId !== user.id && user.role !== "superadmin") {
        return res.status(403).json({ message: "Not authorized to update this booking" });
      }
      const updates: any = { ...parsed.data };
      if (parsed.data.status === "completed") updates.completedAt = new Date();
      const result = await storage.updateBooking(req.params.id, updates);
      res.json(result);
    } catch (error) { next(error); }
  });

  // --- Public Booking Endpoints (no auth) ---
  app.get("/api/public/booking-types/:slug", async (req, res, next) => {
    try {
      const bt = await storage.getBookingTypeBySlug(req.params.slug);
      if (!bt) return res.status(404).json({ message: "Booking type not found" });
      const host = await storage.getUser(bt.userId);
      res.json({
        ...bt,
        hostName: host?.name || "Team Member",
        hostAvatar: host?.avatar || null,
        hostEmail: host?.email || null,
      });
    } catch (error) { next(error); }
  });

  app.get("/api/public/availability/:slug/:date", async (req, res, next) => {
    try {
      const { slug, date } = req.params;
      const bt = await storage.getBookingTypeBySlug(slug);
      if (!bt) return res.status(404).json({ message: "Booking type not found" });

      const dayOfWeek = new Date(date + "T12:00:00Z").getUTCDay();
      const schedules = await storage.getAvailabilitySchedules(bt.userId);
      const daySchedule = schedules.filter(s => s.dayOfWeek === dayOfWeek && s.isActive);

      const overrides = await storage.getAvailabilityOverrides(bt.userId, date, date);
      const override = overrides[0];

      if (override && !override.isAvailable) {
        return res.json({ slots: [], blocked: true, reason: override.reason });
      }

      let timeRanges: { start: string; end: string }[] = [];
      if (override && override.isAvailable && override.startTime && override.endTime) {
        timeRanges = [{ start: override.startTime, end: override.endTime }];
      } else {
        timeRanges = daySchedule.map(s => ({ start: s.startTime, end: s.endTime }));
      }

      if (timeRanges.length === 0) {
        return res.json({ slots: [], blocked: false });
      }

      const existingBookings = await storage.getBookingsForSlotCheck(bt.userId, date);
      const duration = bt.duration;
      const bufferBefore = bt.bufferBefore || 0;
      const bufferAfter = bt.bufferAfter || 0;
      const slots: string[] = [];

      for (const range of timeRanges) {
        const [startH, startM] = range.start.split(":").map(Number);
        const [endH, endM] = range.end.split(":").map(Number);
        let currentMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        while (currentMinutes + duration <= endMinutes) {
          const slotStart = `${String(Math.floor(currentMinutes / 60)).padStart(2, "0")}:${String(currentMinutes % 60).padStart(2, "0")}`;
          const slotEndMin = currentMinutes + duration;
          const slotEnd = `${String(Math.floor(slotEndMin / 60)).padStart(2, "0")}:${String(slotEndMin % 60).padStart(2, "0")}`;

          const slotStartDt = new Date(`${date}T${slotStart}:00+05:30`);
          const slotEndDt = new Date(`${date}T${slotEnd}:00+05:30`);
          const bufferStartDt = new Date(slotStartDt.getTime() - bufferBefore * 60000);
          const bufferEndDt = new Date(slotEndDt.getTime() + bufferAfter * 60000);

          const hasConflict = existingBookings.some(b => {
            const bStart = new Date(b.startTime);
            const bEnd = new Date(b.endTime);
            return bufferStartDt < bEnd && bufferEndDt > bStart;
          });

          if (!hasConflict && slotStartDt > new Date()) {
            slots.push(slotStart);
          }

          currentMinutes += duration + bufferAfter;
        }
      }

      if (bt.maxBookingsPerDay) {
        const todayCount = existingBookings.length;
        if (todayCount >= bt.maxBookingsPerDay) {
          return res.json({ slots: [], blocked: true, reason: "Max bookings reached for this day" });
        }
      }

      res.json({ slots, blocked: false });
    } catch (error) { next(error); }
  });

  const publicCreateBookingSchema = z.object({
    customerName: z.string().min(1),
    customerEmail: z.string().email(),
    customerPhone: z.string().optional(),
    date: z.string(),
    time: z.string(),
    customerNotes: z.string().optional(),
  });

  app.post("/api/public/book/:slug", async (req, res, next) => {
    try {
      const parsed = publicCreateBookingSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: fromError(parsed.error).toString() });
      const { slug } = req.params;
      const { customerName, customerEmail, customerPhone, date, time, customerNotes } = parsed.data;

      const bt = await storage.getBookingTypeBySlug(slug);
      if (!bt) return res.status(404).json({ message: "Booking type not found" });

      const startTime = new Date(`${date}T${time}:00+05:30`);
      const endTime = new Date(startTime.getTime() + bt.duration * 60000);

      if (startTime <= new Date()) {
        return res.status(400).json({ message: "Cannot book a time in the past" });
      }

      const crypto = await import("crypto");
      const cancelToken = crypto.randomBytes(32).toString("hex");

      const booking = await storage.createBooking({
        bookingTypeId: bt.id,
        hostUserId: bt.userId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        startTime,
        endTime,
        status: bt.requiresApproval ? "pending" : "confirmed",
        customerNotes: customerNotes || null,
        cancelToken,
        meetingLink: null,
        internalNotes: null,
        cancellationReason: null,
        rescheduledFromId: null,
        paymentRequestId: null,
        completedAt: null,
      });

      const host = await storage.getUser(bt.userId);

      res.json({
        ...booking,
        bookingType: bt,
        hostName: host?.name || "Team Member",
      });
    } catch (error) { next(error); }
  });

  app.get("/api/public/booking/:id", async (req, res, next) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      const bt = await storage.getBookingType(booking.bookingTypeId);
      const host = await storage.getUser(booking.hostUserId);
      res.json({
        ...booking,
        bookingType: bt,
        hostName: host?.name || "Team Member",
        hostAvatar: host?.avatar || null,
      });
    } catch (error) { next(error); }
  });

  app.post("/api/public/booking/:id/cancel", async (req, res, next) => {
    try {
      const { cancelToken, reason } = req.body;
      const booking = await storage.getBooking(req.params.id);
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.cancelToken !== cancelToken) return res.status(403).json({ message: "Invalid cancel token" });
      if (booking.status === "cancelled") return res.status(400).json({ message: "Already cancelled" });

      const result = await storage.updateBooking(req.params.id, {
        status: "cancelled",
        cancellationReason: reason || "Cancelled by customer",
      });
      res.json(result);
    } catch (error) { next(error); }
  });

  async function verifyTeamAccess(userId: string, teamId: string | undefined): Promise<boolean> {
    if (!teamId) return true;
    const user = await storage.getUser(userId);
    if (user?.role === 'superadmin') return true;
    const userTeams = await storage.getUserTeams(userId);
    return userTeams.some(t => t.teamId === teamId);
  }

  // ========== CONTACTS ==========

  app.get("/api/contacts", requireAuth, async (req, res, next) => {
    try {
      const { category, team_id, search } = req.query;
      const currentUser = req.user as User;
      let teamId = team_id as string | undefined;
      if (teamId) {
        if (!(await verifyTeamAccess(currentUser.id, teamId))) {
          return res.status(403).json({ message: "Access denied to this team" });
        }
      } else if (currentUser.role !== 'superadmin') {
        const userTeams = await storage.getUserTeams(currentUser.id);
        if (userTeams.length > 0) teamId = userTeams[0].teamId;
      }
      const contacts = await storage.getContacts({
        category: category as string,
        teamId,
        search: search as string,
      });
      res.json(contacts);
    } catch (error) { next(error); }
  });

  app.get("/api/contacts/:id", requireAuth, async (req, res, next) => {
    try {
      const contact = await storage.getContact(req.params.id);
      if (!contact) return res.status(404).json({ message: "Contact not found" });
      const currentUser = req.user as User;
      if (!(await verifyTeamAccess(currentUser.id, contact.teamId))) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(contact);
    } catch (error) { next(error); }
  });

  app.post("/api/contacts", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as User;
      if (req.body.teamId && !(await verifyTeamAccess(currentUser.id, req.body.teamId))) {
        return res.status(403).json({ message: "Access denied to this team" });
      }
      const parsed = insertContactSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: fromError(parsed.error).message });
      const contact = await storage.createContact(parsed.data);
      await storage.createAuditLog({ action: "create", entityType: "contact", entityId: contact.id, userId: currentUser.id, details: { name: contact.name } });
      res.status(201).json(contact);
    } catch (error) { next(error); }
  });

  app.patch("/api/contacts/:id", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as User;
      const existing = await storage.getContact(req.params.id);
      if (!existing) return res.status(404).json({ message: "Contact not found" });
      if (!(await verifyTeamAccess(currentUser.id, existing.teamId))) {
        return res.status(403).json({ message: "Access denied" });
      }
      const contact = await storage.updateContact(req.params.id, req.body);
      if (!contact) return res.status(404).json({ message: "Contact not found" });
      await storage.createAuditLog({ action: "update", entityType: "contact", entityId: contact.id, userId: currentUser.id, details: { name: contact.name } });
      res.json(contact);
    } catch (error) { next(error); }
  });

  app.delete("/api/contacts/:id", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as User;
      const existing = await storage.getContact(req.params.id);
      if (!existing) return res.status(404).json({ message: "Contact not found" });
      if (!(await verifyTeamAccess(currentUser.id, existing.teamId))) {
        return res.status(403).json({ message: "Access denied" });
      }
      const ok = await storage.deleteContact(req.params.id);
      if (!ok) return res.status(404).json({ message: "Contact not found" });
      await storage.createAuditLog({ action: "delete", entityType: "contact", entityId: req.params.id, userId: currentUser.id });
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  // ========== DEALS ==========

  app.get("/api/deals", requireAuth, async (req, res, next) => {
    try {
      const { stage, assigned_to, team_id } = req.query;
      const currentUser = req.user as User;
      if (team_id && !(await verifyTeamAccess(currentUser.id, team_id as string))) {
        return res.status(403).json({ message: "Access denied to this team" });
      }
      const deals = await storage.getDeals({
        stage: stage as string,
        assignedTo: assigned_to as string,
        teamId: team_id as string,
      });
      res.json(deals);
    } catch (error) { next(error); }
  });

  app.get("/api/deals/:id", requireAuth, async (req, res, next) => {
    try {
      const deal = await storage.getDeal(req.params.id);
      if (!deal) return res.status(404).json({ message: "Deal not found" });
      const currentUser = req.user as User;
      if (!(await verifyTeamAccess(currentUser.id, deal.teamId))) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(deal);
    } catch (error) { next(error); }
  });

  app.post("/api/deals", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as User;
      if (req.body.teamId && !(await verifyTeamAccess(currentUser.id, req.body.teamId))) {
        return res.status(403).json({ message: "Access denied to this team" });
      }
      const parsed = insertDealSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: fromError(parsed.error).message });
      const deal = await storage.createDeal(parsed.data);
      await storage.createAuditLog({ action: "create", entityType: "deal", entityId: deal.id, userId: currentUser.id, details: { name: deal.name, value: deal.value } });
      res.status(201).json(deal);
    } catch (error) { next(error); }
  });

  app.patch("/api/deals/:id", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as User;
      const existing = await storage.getDeal(req.params.id);
      if (!existing) return res.status(404).json({ message: "Deal not found" });
      if (!(await verifyTeamAccess(currentUser.id, existing.teamId))) {
        return res.status(403).json({ message: "Access denied" });
      }
      const deal = await storage.updateDeal(req.params.id, req.body);
      if (!deal) return res.status(404).json({ message: "Deal not found" });
      await storage.createAuditLog({ action: "update", entityType: "deal", entityId: deal.id, userId: currentUser.id, details: { name: deal.name } });
      res.json(deal);
    } catch (error) { next(error); }
  });

  app.delete("/api/deals/:id", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as User;
      const existing = await storage.getDeal(req.params.id);
      if (!existing) return res.status(404).json({ message: "Deal not found" });
      if (!(await verifyTeamAccess(currentUser.id, existing.teamId))) {
        return res.status(403).json({ message: "Access denied" });
      }
      const ok = await storage.deleteDeal(req.params.id);
      if (!ok) return res.status(404).json({ message: "Deal not found" });
      await storage.createAuditLog({ action: "delete", entityType: "deal", entityId: req.params.id, userId: currentUser.id });
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  // ========== APPOINTMENTS ==========

  app.get("/api/appointments", requireAuth, async (req, res, next) => {
    try {
      const { assigned_to, team_id, status } = req.query;
      const currentUser = req.user as User;
      if (team_id && !(await verifyTeamAccess(currentUser.id, team_id as string))) {
        return res.status(403).json({ message: "Access denied to this team" });
      }
      const appointments = await storage.getAppointments({
        assignedTo: assigned_to as string,
        teamId: team_id as string,
        status: status as string,
      });
      res.json(appointments);
    } catch (error) { next(error); }
  });

  app.get("/api/appointments/:id", requireAuth, async (req, res, next) => {
    try {
      const appt = await storage.getAppointment(req.params.id);
      if (!appt) return res.status(404).json({ message: "Appointment not found" });
      const currentUser = req.user as User;
      if (!(await verifyTeamAccess(currentUser.id, appt.teamId))) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(appt);
    } catch (error) { next(error); }
  });

  app.post("/api/appointments", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as User;
      if (req.body.teamId && !(await verifyTeamAccess(currentUser.id, req.body.teamId))) {
        return res.status(403).json({ message: "Access denied to this team" });
      }
      const parsed = insertAppointmentSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: fromError(parsed.error).message });
      const appt = await storage.createAppointment(parsed.data);
      await storage.createAuditLog({ action: "create", entityType: "appointment", entityId: appt.id, userId: currentUser.id, details: { title: appt.title } });
      res.status(201).json(appt);
    } catch (error) { next(error); }
  });

  app.patch("/api/appointments/:id", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as User;
      const existing = await storage.getAppointment(req.params.id);
      if (!existing) return res.status(404).json({ message: "Appointment not found" });
      if (!(await verifyTeamAccess(currentUser.id, existing.teamId))) {
        return res.status(403).json({ message: "Access denied" });
      }
      const appt = await storage.updateAppointment(req.params.id, req.body);
      if (!appt) return res.status(404).json({ message: "Appointment not found" });
      await storage.createAuditLog({ action: "update", entityType: "appointment", entityId: appt.id, userId: currentUser.id, details: { title: appt.title } });
      res.json(appt);
    } catch (error) { next(error); }
  });

  app.delete("/api/appointments/:id", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as User;
      const existing = await storage.getAppointment(req.params.id);
      if (!existing) return res.status(404).json({ message: "Appointment not found" });
      if (!(await verifyTeamAccess(currentUser.id, existing.teamId))) {
        return res.status(403).json({ message: "Access denied" });
      }
      const ok = await storage.deleteAppointment(req.params.id);
      if (!ok) return res.status(404).json({ message: "Appointment not found" });
      await storage.createAuditLog({ action: "delete", entityType: "appointment", entityId: req.params.id, userId: currentUser.id });
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  // ========== TICKETS ==========

  app.get("/api/tickets", requireAuth, async (req, res, next) => {
    try {
      const { status, assigned_to, reported_by, team_id } = req.query;
      const currentUser = req.user as User;
      if (team_id && !(await verifyTeamAccess(currentUser.id, team_id as string))) {
        return res.status(403).json({ message: "Access denied to this team" });
      }
      const tickets = await storage.getTickets({
        status: status as string,
        assignedTo: assigned_to as string,
        reportedBy: reported_by as string,
        teamId: team_id as string,
      });
      res.json(tickets);
    } catch (error) { next(error); }
  });

  app.get("/api/tickets/:id", requireAuth, async (req, res, next) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) return res.status(404).json({ message: "Ticket not found" });
      const currentUser = req.user as User;
      if (!(await verifyTeamAccess(currentUser.id, ticket.teamId))) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(ticket);
    } catch (error) { next(error); }
  });

  app.get("/api/tickets/:id/activity", requireAuth, async (req, res, next) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) return res.status(404).json({ message: "Ticket not found" });
      const currentUser = req.user as User;
      if (!(await verifyTeamAccess(currentUser.id, ticket.teamId))) {
        return res.status(403).json({ message: "Access denied" });
      }
      const logs = await storage.getAuditLogs({
        entityType: "ticket",
        entityId: req.params.id,
      });
      res.json(logs);
    } catch (error) { next(error); }
  });

  app.post("/api/tickets", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as User;
      if (req.body.teamId && !(await verifyTeamAccess(currentUser.id, req.body.teamId))) {
        return res.status(403).json({ message: "Access denied to this team" });
      }
      const ticketCount = (await storage.getTickets()).length;
      const ticketCode = `TKT-${String(ticketCount + 1).padStart(4, '0')}`;
      const parsed = insertTicketSchema.safeParse({ ...req.body, ticketCode, reportedBy: currentUser.id });
      if (!parsed.success) return res.status(400).json({ message: fromError(parsed.error).message });
      const ticket = await storage.createTicket(parsed.data);
      await storage.createAuditLog({ action: "create", entityType: "ticket", entityId: ticket.id, userId: currentUser.id, details: { title: ticket.title, ticketCode } });
      res.status(201).json(ticket);
    } catch (error) { next(error); }
  });

  app.patch("/api/tickets/:id", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as User;
      const existing = await storage.getTicket(req.params.id);
      if (!existing) return res.status(404).json({ message: "Ticket not found" });
      if (!(await verifyTeamAccess(currentUser.id, existing.teamId))) {
        return res.status(403).json({ message: "Access denied" });
      }
      const ticket = await storage.updateTicket(req.params.id, req.body);
      if (!ticket) return res.status(404).json({ message: "Ticket not found" });
      await storage.createAuditLog({ action: "update", entityType: "ticket", entityId: ticket.id, userId: currentUser.id, details: { title: ticket.title, status: ticket.status } });
      res.json(ticket);
    } catch (error) { next(error); }
  });

  app.delete("/api/tickets/:id", requireAuth, async (req, res, next) => {
    try {
      const currentUser = req.user as User;
      const existing = await storage.getTicket(req.params.id);
      if (!existing) return res.status(404).json({ message: "Ticket not found" });
      if (!(await verifyTeamAccess(currentUser.id, existing.teamId))) {
        return res.status(403).json({ message: "Access denied" });
      }
      const ok = await storage.deleteTicket(req.params.id);
      if (!ok) return res.status(404).json({ message: "Ticket not found" });
      await storage.createAuditLog({ action: "delete", entityType: "ticket", entityId: req.params.id, userId: currentUser.id });
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  // ========== AUDIT LOGS ==========

  app.get("/api/audit-logs", requireAuth, requireRole('superadmin'), async (req, res, next) => {
    try {
      const { entity_type, user_id, limit } = req.query;
      const logs = await storage.getAuditLogs({
        entityType: entity_type as string,
        userId: user_id as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(logs);
    } catch (error) { next(error); }
  });

  // ========== ADMIN USER MANAGEMENT ==========

  app.get("/api/admin/users", requireAuth, requireRole('superadmin'), async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      const sanitized = users.map((user: User) => {
        const { password: _pw, ...rest } = user;
        return rest;
      });
      res.json(sanitized);
    } catch (error) { next(error); }
  });

  app.patch("/api/admin/users/:id", requireAuth, requireRole('superadmin'), async (req, res, next) => {
    try {
      const { role, isActive } = req.body;
      const updates: Record<string, any> = {};
      if (role !== undefined) updates.role = role;
      if (isActive !== undefined) updates.isActive = isActive;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) return res.status(404).json({ message: "User not found" });
      await storage.createAuditLog({ action: "update", entityType: "user", entityId: user.id, userId: (req as any).user.id, details: { role: user.role, targetUser: user.name } });
      res.json(user);
    } catch (error) { next(error); }
  });

  // ========== NOTIFICATIONS ==========

  app.get("/api/notifications", requireAuth, async (req, res, next) => {
    try {
      const notifications = await storage.getNotifications((req as any).user.id);
      res.json(notifications);
    } catch (error) { next(error); }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res, next) => {
    try {
      const notifications = await storage.getNotifications((req as any).user.id);
      const owns = notifications.some(n => n.id === req.params.id);
      if (!owns) return res.status(403).json({ message: "Forbidden" });
      await storage.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  app.patch("/api/notifications/read-all", requireAuth, async (req, res, next) => {
    try {
      await storage.markAllNotificationsRead((req as any).user.id);
      res.json({ success: true });
    } catch (error) { next(error); }
  });

  return httpServer;
}
