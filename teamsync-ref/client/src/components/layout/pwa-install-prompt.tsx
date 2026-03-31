import { useState, useEffect } from "react";
import { X, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { cn } from "@/lib/utils";

export function PwaInstallPrompt() {
  const { canInstall, promptInstall, dismiss } = usePwaInstall();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (canInstall) {
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, [canInstall]);

  if (!canInstall) return null;

  const handleInstall = async () => {
    setVisible(false);
    await promptInstall();
  };

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(dismiss, 350);
  };

  return (
    <div
      data-testid="pwa-install-prompt"
      className={cn(
        "fixed bottom-5 right-5 z-50 w-72 rounded-2xl border bg-card shadow-xl",
        "transition-all duration-500 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      )}
    >
      <button
        onClick={handleDismiss}
        data-testid="pwa-dismiss"
        className="absolute right-3 top-3 rounded-md p-0.5 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="size-3.5" />
      </button>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3.5">
          <div
            className="size-11 rounded-xl shrink-0 flex items-center justify-center text-white font-black text-lg tracking-tight select-none"
            style={{ background: "linear-gradient(135deg, #1a3fc4 0%, #1860f0 100%)" }}
          >
            TS
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-tight">TeamSync Portal</p>
            <p className="text-xs text-muted-foreground mt-0.5">Install for quick desktop access</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleInstall}
            data-testid="pwa-install-btn"
            size="sm"
            className="flex-1 h-8 text-xs gap-1.5 rounded-lg text-white font-medium"
            style={{ background: "linear-gradient(135deg, #1a3fc4 0%, #1860f0 100%)" }}
          >
            <Monitor className="size-3.5" />
            Install App
          </Button>
          <Button
            onClick={handleDismiss}
            data-testid="pwa-nothnow-btn"
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground hover:text-foreground rounded-lg px-3"
          >
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
