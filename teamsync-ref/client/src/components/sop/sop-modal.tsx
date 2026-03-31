import { AlertTriangle, BookOpen, PlayCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

export interface SopStep {
  n: number;
  title: string;
  body: string;
  warn?: string;
}

export interface SopConfig {
  title: string;
  description: string;
  steps: SopStep[];
  quickLink?: { label: string; url: string };
}

export interface TutorialConfig {
  title: string;
  description: string;
  videoUrl?: string;
  placeholderText?: string;
}

interface SopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: SopConfig;
  color: string;
}

export function SopModal({ open, onOpenChange, config, color }: SopModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen size={18} style={{ color }} /> {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {config.steps.map(step => (
            <div key={step.n} className="flex gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                style={{ background: color }}
              >
                {step.n}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-1">{step.title}</p>
                <p className="text-sm text-muted-foreground">{step.body}</p>
                {step.warn && (
                  <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5">
                    <AlertTriangle size={12} className="shrink-0 mt-0.5" /> {step.warn}
                  </div>
                )}
              </div>
            </div>
          ))}
          {config.quickLink && (
            <div className="border-t pt-3 flex items-center gap-2">
              <a
                href={config.quickLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                style={{ color }}
              >
                <ExternalLink size={13} /> {config.quickLink.label}
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: TutorialConfig;
  color: string;
}

export function TutorialModal({ open, onOpenChange, config, color }: TutorialModalProps) {
  const hasVideo = config.videoUrl && (config.videoUrl.includes("youtube") || config.videoUrl.includes("loom") || config.videoUrl.includes("youtu.be"));

  let embedUrl = "";
  if (config.videoUrl) {
    if (config.videoUrl.includes("youtube.com/watch")) {
      const id = new URL(config.videoUrl).searchParams.get("v");
      embedUrl = `https://www.youtube.com/embed/${id}`;
    } else if (config.videoUrl.includes("youtu.be/")) {
      const id = config.videoUrl.split("youtu.be/")[1]?.split("?")[0];
      embedUrl = `https://www.youtube.com/embed/${id}`;
    } else if (config.videoUrl.includes("loom.com/share")) {
      const id = config.videoUrl.split("/share/")[1]?.split("?")[0];
      embedUrl = `https://www.loom.com/embed/${id}`;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlayCircle size={18} style={{ color }} /> {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>
        <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center mt-2 overflow-hidden">
          {hasVideo && embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={config.title}
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <PlayCircle size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">{config.placeholderText || "Tutorial video coming soon"}</p>
              <p className="text-xs mt-1">Upload a Loom or YouTube link to embed here.</p>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} data-testid="btn-close-tutorial">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SopTutorialButtonsProps {
  onSopClick: () => void;
  onTutorialClick: () => void;
}

export function SopTutorialButtons({ onSopClick, onTutorialClick }: SopTutorialButtonsProps) {
  return (
    <>
      <Button variant="outline" size="sm" onClick={onSopClick} data-testid="btn-open-sop">
        <BookOpen size={14} className="mr-1.5" /> SOP
      </Button>
      <Button variant="outline" size="sm" onClick={onTutorialClick} data-testid="btn-open-tutorial">
        <PlayCircle size={14} className="mr-1.5" /> Tutorial
      </Button>
    </>
  );
}
