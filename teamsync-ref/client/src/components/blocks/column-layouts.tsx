import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ColumnProps {
  children: ReactNode;
  className?: string;
  gap?: "sm" | "md" | "lg";
}

const gapClasses = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

export function TwoColumn({ children, className, gap = "md" }: ColumnProps) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2", gapClasses[gap], className)} data-testid="layout-two-column">
      {children}
    </div>
  );
}

export function ThreeColumn({ children, className, gap = "md" }: ColumnProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3", gapClasses[gap], className)} data-testid="layout-three-column">
      {children}
    </div>
  );
}

export function FourColumn({ children, className, gap = "md" }: ColumnProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", gapClasses[gap], className)} data-testid="layout-four-column">
      {children}
    </div>
  );
}

type AsymmetricRatio = "1:2" | "2:1" | "1:3" | "3:1" | "1:1:2" | "2:1:1" | "1:2:1";

interface AsymmetricColumnsProps {
  children: ReactNode;
  ratio: AsymmetricRatio;
  className?: string;
  gap?: "sm" | "md" | "lg";
}

const ratioClasses: Record<AsymmetricRatio, string> = {
  "1:2": "grid-cols-1 lg:grid-cols-[1fr_2fr]",
  "2:1": "grid-cols-1 lg:grid-cols-[2fr_1fr]",
  "1:3": "grid-cols-1 lg:grid-cols-[1fr_3fr]",
  "3:1": "grid-cols-1 lg:grid-cols-[3fr_1fr]",
  "1:1:2": "grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_2fr]",
  "2:1:1": "grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]",
  "1:2:1": "grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_2fr_1fr]",
};

export function AsymmetricColumns({ children, ratio, className, gap = "md" }: AsymmetricColumnsProps) {
  return (
    <div className={cn("grid", ratioClasses[ratio], gapClasses[gap], className)} data-testid={`layout-asymmetric-${ratio.replace(/:/g, "-")}`}>
      {children}
    </div>
  );
}
