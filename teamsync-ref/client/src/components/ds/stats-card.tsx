import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";

interface SparklineData {
  values: number[];
  color?: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral" | "warning";
  icon: React.ReactNode;
  className?: string;
  sparkline?: SparklineData;
}

function Sparkline({ values, color = "currentColor" }: SparklineData) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const width = 80;
  const height = 24;
  const padding = 2;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="mt-1"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
        strokeDasharray="2 3"
      />
    </svg>
  );
}

export function StatsCard({ title, value, change, changeType = "neutral", icon, className, sparkline }: StatsCardProps) {
  const isNumeric = typeof value === "number";

  return (
    <div
      className={cn(
        "group rounded-lg border bg-background p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        className
      )}
      data-testid={`card-stat-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {isNumeric ? (
            <AnimatedNumber
              value={value}
              className="text-2xl font-semibold font-heading tracking-tight"
            />
          ) : (
            <span className="text-2xl font-semibold font-heading tracking-tight">{value}</span>
          )}
          {change && (
            <span
              className={cn(
                "text-xs font-medium",
                changeType === "positive" && "text-emerald-600 dark:text-emerald-400",
                changeType === "negative" && "text-red-600 dark:text-red-400",
                changeType === "warning" && "text-amber-600 dark:text-amber-400",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </span>
          )}
          {sparkline && (
            <Sparkline
              values={sparkline.values}
              color={sparkline.color}
            />
          )}
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/15">
          {icon}
        </div>
      </div>
    </div>
  );
}
