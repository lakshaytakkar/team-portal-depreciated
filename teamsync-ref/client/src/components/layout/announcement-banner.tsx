import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AnnouncementBannerProps {
  message?: string;
  linkText?: string;
  onAction?: () => void;
}

export function AnnouncementBanner({
  message = "NEW: TeamSync 2.0 is here — streamlined HR management with powerful new features!",
  linkText,
  onAction,
}: AnnouncementBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem("announcement-dismissed") === "true"; } catch { return false; }
  });

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative flex w-full shrink-0 items-center justify-center bg-primary px-12 py-2.5 text-sm text-white"
          data-testid="announcement-banner"
        >
          <span className="font-medium text-center">{message}</span>
          {linkText && onAction && (
            <button
              onClick={onAction}
              className="ml-2 underline underline-offset-2 hover:opacity-80 font-semibold"
              data-testid="announcement-banner-link"
            >
              {linkText}
            </button>
          )}
          <button
            type="button"
            onClick={() => { setDismissed(true); try { sessionStorage.setItem("announcement-dismissed", "true"); } catch {} }}
            className="absolute right-3 flex items-center justify-center rounded p-1.5 hover:bg-white/15"
            aria-label="Dismiss announcement"
            data-testid="announcement-banner-close"
          >
            <X className="size-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
