import { useState } from "react";
import { Building2, Bell, Shield, Puzzle } from "lucide-react";

import { StatusBadge } from "@/components/ds/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import { Fade, Stagger, StaggerItem, PageTransition } from "@/components/ui/animated";
import { SiSlack, SiGoogle } from "react-icons/si";
import { CreditCard } from "lucide-react";
import { PageShell } from "@/components/layout";

const integrations = [
  {
    name: "Slack",
    description: "Send notifications and updates to Slack channels",
    icon: SiSlack,
    connected: true,
  },
  {
    name: "Google Workspace",
    description: "Sync calendars, contacts, and documents",
    icon: SiGoogle,
    connected: true,
  },
  {
    name: "Razorpay",
    description: "Process payments and manage billing",
    icon: CreditCard,
    connected: false,
  },
];

export default function AdminSettings() {
  const loading = useSimulatedLoading();

  const [companyName, setCompanyName] = useState("Lumin Technologies");
  const [timezone, setTimezone] = useState("asia-kolkata");
  const [language, setLanguage] = useState("en");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [passwordPolicy, setPasswordPolicy] = useState("strong");

  return (
    <PageShell>
      <PageTransition>
        {loading ? (
          <div className="flex flex-col gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-background p-6">
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-10 w-full mt-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Stagger staggerInterval={0.08} className="flex flex-col gap-6">
            <StaggerItem>
              <div className="rounded-lg border bg-background" data-testid="section-general">
                <div className="flex items-center gap-3 border-b px-6 py-4">
                  <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold font-heading">General</h3>
                    <p className="text-xs text-muted-foreground">Basic company and locale settings</p>
                  </div>
                </div>
                <div className="flex flex-col gap-5 p-6">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="company-name" className="text-sm font-medium">Company Name</Label>
                    <Input
                      id="company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      data-testid="input-company-name"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-medium">Timezone</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger data-testid="select-timezone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asia-kolkata">Asia/Kolkata (IST)</SelectItem>
                          <SelectItem value="america-new_york">America/New York (EST)</SelectItem>
                          <SelectItem value="europe-london">Europe/London (GMT)</SelectItem>
                          <SelectItem value="asia-tokyo">Asia/Tokyo (JST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-medium">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger data-testid="select-language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="ja">Japanese</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="rounded-lg border bg-background" data-testid="section-notifications">
                <div className="flex items-center gap-3 border-b px-6 py-4">
                  <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Bell className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold font-heading">Notifications</h3>
                    <p className="text-xs text-muted-foreground">Manage how you receive alerts and updates</p>
                  </div>
                </div>
                <div className="flex flex-col divide-y">
                  <div className="flex items-center justify-between gap-4 px-6 py-4">
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                      data-testid="switch-email-notifications"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 px-6 py-4">
                    <div>
                      <p className="text-sm font-medium">Push Notifications</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Receive browser push notifications</p>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                      data-testid="switch-push-notifications"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 px-6 py-4">
                    <div>
                      <p className="text-sm font-medium">Weekly Digest</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Get a summary email every Monday</p>
                    </div>
                    <Switch
                      checked={weeklyDigest}
                      onCheckedChange={setWeeklyDigest}
                      data-testid="switch-weekly-digest"
                    />
                  </div>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="rounded-lg border bg-background" data-testid="section-security">
                <div className="flex items-center gap-3 border-b px-6 py-4">
                  <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Shield className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold font-heading">Security</h3>
                    <p className="text-xs text-muted-foreground">Authentication and access control settings</p>
                  </div>
                </div>
                <div className="flex flex-col gap-5 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Require 2FA for all users</p>
                    </div>
                    <Switch
                      checked={twoFactorAuth}
                      onCheckedChange={setTwoFactorAuth}
                      data-testid="switch-2fa"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-medium">Session Timeout</Label>
                      <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                        <SelectTrigger data-testid="select-session-timeout">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-medium">Password Policy</Label>
                      <Select value={passwordPolicy} onValueChange={setPasswordPolicy}>
                        <SelectTrigger data-testid="select-password-policy">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                          <SelectItem value="strong">Strong (12+ mixed)</SelectItem>
                          <SelectItem value="strict">Strict (16+ with symbols)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="rounded-lg border bg-background" data-testid="section-integrations">
                <div className="flex items-center gap-3 border-b px-6 py-4">
                  <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Puzzle className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold font-heading">Integrations</h3>
                    <p className="text-xs text-muted-foreground">Connect third-party services</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
                  {integrations.map((integration) => {
                    const Icon = integration.icon;
                    return (
                      <div
                        key={integration.name}
                        className="flex flex-col gap-3 rounded-md border p-4"
                        data-testid={`integration-${integration.name.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-md bg-muted text-foreground">
                            <Icon className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{integration.name}</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{integration.description}</p>
                        <div className="mt-auto">
                          <StatusBadge
                            status={integration.connected ? "Connected" : "Connect"}
                            variant={integration.connected ? "success" : "neutral"}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </StaggerItem>
          </Stagger>
        )}
      </PageTransition>
    </PageShell>
  );
}
