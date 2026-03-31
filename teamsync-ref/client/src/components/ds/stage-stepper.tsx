import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { StageDefinition } from "@shared/schema";

interface StageStepperProps {
  currentStage: number;
  stages: StageDefinition[];
  compact?: boolean;
  className?: string;
}

export function StageStepper({ currentStage, stages, compact = false, className }: StageStepperProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} data-testid="stage-stepper">
      {stages.map((stage, i) => {
        const isDone = stage.number < currentStage;
        const isCurrent = stage.number === currentStage;

        return (
          <div key={stage.id} className="flex items-center gap-1">
            {i > 0 && (
              <div
                className={cn(
                  "h-0.5 transition-colors",
                  compact ? "w-3" : "w-6",
                  isDone ? "bg-emerald-500" : isCurrent ? "bg-blue-400" : "bg-muted"
                )}
              />
            )}
            <div
              className={cn(
                "flex shrink-0 items-center justify-center rounded-full font-medium transition-colors",
                compact ? "size-5 text-[10px]" : "size-7 text-xs",
                isDone && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
                isCurrent && "bg-blue-100 text-blue-700 ring-2 ring-blue-400/40 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-500/40",
                !isDone && !isCurrent && "bg-muted text-muted-foreground"
              )}
              data-testid={`stage-step-${stage.number}`}
            >
              {isDone ? <Check className={compact ? "size-3" : "size-3.5"} /> : stage.number}
            </div>
            {!compact && (
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap hidden sm:inline",
                  isDone && "text-emerald-700 dark:text-emerald-300",
                  isCurrent && "text-blue-700 dark:text-blue-300",
                  !isDone && !isCurrent && "text-muted-foreground"
                )}
              >
                {stage.name}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface MiniStageStepperProps {
  currentStage: number;
  totalStages?: number;
  className?: string;
}

export function MiniStageStepper({ currentStage, totalStages = 7, className }: MiniStageStepperProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} data-testid="mini-stage-stepper">
      {Array.from({ length: totalStages }).map((_, i) => {
        const isDone = i < currentStage;
        const isCurrent = i === currentStage;

        return (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-colors",
              i === 0 || i === totalStages - 1 ? "w-2" : "w-3",
              isDone && "bg-emerald-500",
              isCurrent && "bg-blue-500",
              !isDone && !isCurrent && "bg-muted"
            )}
            data-testid={`mini-step-${i}`}
          />
        );
      })}
    </div>
  );
}
