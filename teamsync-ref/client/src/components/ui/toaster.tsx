import { forwardRef } from "react";
import { useToast, type ToastItem, type ToastType } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const config: Record<ToastType, { icon: typeof CheckCircle2; bg: string; text: string; iconColor: string }> = {
  success: { icon: CheckCircle2, bg: "bg-emerald-50 dark:bg-emerald-950/60", text: "text-emerald-800 dark:text-emerald-200", iconColor: "text-emerald-600 dark:text-emerald-400" },
  error: { icon: AlertCircle, bg: "bg-red-50 dark:bg-red-950/60", text: "text-red-800 dark:text-red-200", iconColor: "text-red-600 dark:text-red-400" },
  info: { icon: Info, bg: "bg-blue-50 dark:bg-blue-950/60", text: "text-blue-800 dark:text-blue-200", iconColor: "text-blue-600 dark:text-blue-400" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50 dark:bg-amber-950/60", text: "text-amber-800 dark:text-amber-200", iconColor: "text-amber-600 dark:text-amber-400" },
};

const ToastCard = forwardRef<HTMLDivElement, { item: ToastItem; onDismiss: (id: string) => void }>(
  ({ item, onDismiss }, ref) => {
    const c = config[item.type];
    const Icon = c.icon;

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 80 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`group pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${c.bg}`}
        data-testid={`toast-${item.type}-${item.id}`}
      >
        <Icon className={`mt-0.5 size-4 shrink-0 ${c.iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${c.text}`}>{item.title}</p>
          {item.description && (
            <p className={`mt-0.5 text-xs ${c.text} opacity-80`}>{item.description}</p>
          )}
        </div>
        <button
          onClick={() => onDismiss(item.id)}
          className={`shrink-0 rounded-md p-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${c.text}`}
          data-testid={`button-toast-close-${item.id}`}
        >
          <X className="size-3.5" />
        </button>
      </motion.div>
    );
  }
);

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2" data-testid="toaster">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
