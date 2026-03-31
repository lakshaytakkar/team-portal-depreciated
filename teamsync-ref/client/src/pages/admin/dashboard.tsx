import { useState } from "react";
import { Users, UserCheck, FileText, Activity, ArrowRight, Plus, Settings, BarChart3, Download, LogIn, Pencil, Trash2, Upload } from "lucide-react";
import { Link, useLocation } from "wouter";

import { teamMembers, activityLogs } from "@/lib/mock-data-admin";
import { reports } from "@/lib/mock-data-admin";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import {
  PageShell,
  HeroBanner,
  StatGrid,
  StatCard,
  SectionCard,
  SectionGrid,
} from "@/components/layout";
import { StatsCardSkeleton } from "@/components/ui/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityFeed, ButtonGrid } from "@/components/blocks";

const activityTypeConfig: Record<string, { icon: typeof Plus; color: string }> = {
  create: { icon: Plus, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950" },
  update: { icon: Pencil, color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950" },
  delete: { icon: Trash2, color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950" },
  login: { icon: LogIn, color: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800" },
  export: { icon: Upload, color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950" },
};

const quickActions = [
  { title: "Manage Team", description: "Add, edit, or remove team members", icon: Users, href: "/lbm/team" },
  { title: "System Settings", description: "Configure system preferences", icon: Settings, href: "/lbm/settings" },
  { title: "View Reports", description: "Access analytics and reports", icon: BarChart3, href: "/lbm/reports" },
  { title: "Export Data", description: "Download data in various formats", icon: Download, href: "/lbm/reports" },
];

function getRelativeTime(timestamp: string): string {
  const now = new Date("2025-02-27T15:00:00");
  const date = new Date(timestamp.replace(" ", "T"));
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function AdminDashboard() {
  const loading = useSimulatedLoading();
  const [, navigate] = useLocation();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const activeUsers = teamMembers.filter((m) => m.status === "active").length;

  return (
    <PageShell>
      <HeroBanner
        eyebrow={`${greeting}, Sneha Patel`}
        headline="LBM Lifestyle Admin"
        tagline="Wholesale & trade portal for lifestyle brand management"
        color="#673AB7"
        colorDark="#512d9e"
      />

      {loading ? (
        <StatGrid>
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </StatGrid>
      ) : (
        <StatGrid>
          <StatCard
            label="Total Users"
            value={teamMembers.length}
            trend={`${activeUsers} active`}
            icon={Users}
            iconBg="rgba(16, 185, 129, 0.1)"
            iconColor="#10b981"
          />
          <StatCard
            label="Active Users"
            value={activeUsers}
            trend="+2 this month"
            icon={UserCheck}
            iconBg="rgba(59, 130, 246, 0.1)"
            iconColor="#3b82f6"
          />
          <StatCard
            label="Reports Available"
            value={reports.length}
            trend="3 new this week"
            icon={FileText}
            iconBg="rgba(99, 102, 241, 0.1)"
            iconColor="#6366f1"
          />
          <StatCard
            label="System Uptime"
            value="99.8%"
            trend="Last 30 days"
            icon={Activity}
            iconBg="rgba(16, 185, 129, 0.1)"
            iconColor="#10b981"
          />
        </StatGrid>
      )}

      {loading ? (
        <SectionGrid>
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </SectionGrid>
      ) : (
        <SectionGrid>
          <SectionCard title="Recent Activity">
            <ActivityFeed
              items={activityLogs.map((log) => {
                const config = activityTypeConfig[log.type];
                return {
                  id: log.id,
                  actor: log.user,
                  text: `${log.action} ${log.target}`,
                  timeAgo: getRelativeTime(log.timestamp),
                  icon: config.icon,
                };
              })}
            />
          </SectionCard>

          <SectionCard title="Quick Actions">
            <ButtonGrid
              items={quickActions.map((action) => ({
                id: action.title.toLowerCase().replace(/\s+/g, "-"),
                icon: action.icon,
                iconBg: "hsl(var(--primary) / 0.1)",
                iconColor: "hsl(var(--primary))",
                label: action.title,
                description: action.description,
                onClick: () => navigate(action.href),
              }))}
              cols={2}
            />
          </SectionCard>
        </SectionGrid>
      )}
    </PageShell>
  );
}
