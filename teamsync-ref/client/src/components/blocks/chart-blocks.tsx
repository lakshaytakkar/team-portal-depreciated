import { type ElementType } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const DEFAULT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  description?: string;
  icon?: ElementType;
  className?: string;
}

export function MetricCard({
  label,
  value,
  trend,
  description,
  icon: Icon,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn("p-6 overflow-visible", className)}
      data-testid="metric-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p
            className="text-sm font-medium text-muted-foreground"
            data-testid="metric-card-label"
          >
            {label}
          </p>
          <p
            className="mt-2 text-3xl font-bold tracking-tight"
            data-testid="metric-card-value"
          >
            {value}
          </p>
          {(trend || description) && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-sm font-medium",
                    trend.direction === "up"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                  data-testid="metric-card-trend"
                >
                  {trend.direction === "up" ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}%
                </span>
              )}
              {description && (
                <span
                  className="text-sm text-muted-foreground"
                  data-testid="metric-card-description"
                >
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className="flex items-center justify-center h-10 w-10 rounded-lg bg-muted shrink-0"
            data-testid="metric-card-icon"
          >
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>
    </Card>
  );
}

export type ChartVariant =
  | "bar"
  | "column"
  | "line"
  | "area"
  | "scatter"
  | "pie"
  | "donut"
  | "rose";

export interface ChartBlockProps {
  title: string;
  subtitle?: string;
  variant: ChartVariant;
  data: any[];
  dataKeys: string[];
  colors?: string[];
  height?: number;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
}

function buildChartConfig(
  dataKeys: string[],
  colors: string[]
): ChartConfig {
  const config: ChartConfig = {};
  dataKeys.forEach((key, i) => {
    config[key] = {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      color: colors[i % colors.length],
    };
  });
  return config;
}

export function ChartBlock({
  title,
  subtitle,
  variant,
  data,
  dataKeys,
  colors = DEFAULT_COLORS,
  height = 300,
  className,
  showLegend = false,
  showGrid = true,
  showTooltip = true,
}: ChartBlockProps) {
  const chartConfig = buildChartConfig(dataKeys, colors);
  const isPie = variant === "pie" || variant === "donut" || variant === "rose";

  return (
    <Card
      className={cn("p-6 overflow-visible", className)}
      data-testid="chart-block"
    >
      <div className="mb-4">
        <h3
          className="text-sm font-medium"
          data-testid="chart-block-title"
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className="text-xs text-muted-foreground mt-0.5"
            data-testid="chart-block-subtitle"
          >
            {subtitle}
          </p>
        )}
      </div>
      {data.length === 0 ? (
        <div
          className="flex items-center justify-center text-sm text-muted-foreground"
          style={{ height }}
          data-testid="chart-block-empty"
        >
          No data available
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="w-full"
          style={{ height }}
          data-testid="chart-block-container"
        >
          {renderChart(variant, data, dataKeys, colors, showGrid, showTooltip, showLegend)}
        </ChartContainer>
      )}
    </Card>
  );
}

function renderChart(
  variant: ChartVariant,
  data: any[],
  dataKeys: string[],
  colors: string[],
  showGrid: boolean,
  showTooltip: boolean,
  showLegend: boolean
): React.ReactElement {
  switch (variant) {
    case "bar":
      return (
        <BarChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          {showTooltip && (
            <ChartTooltip content={<ChartTooltipContent />} />
          )}
          {showLegend && (
            <ChartLegend content={<ChartLegendContent />} />
          )}
          {dataKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={`var(--color-${key})`}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      );

    case "column":
      return (
        <BarChart data={data} layout="vertical">
          {showGrid && <CartesianGrid strokeDasharray="3 3" horizontal={false} />}
          <XAxis type="number" tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={80} />
          {showTooltip && (
            <ChartTooltip content={<ChartTooltipContent />} />
          )}
          {showLegend && (
            <ChartLegend content={<ChartLegendContent />} />
          )}
          {dataKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={`var(--color-${key})`}
              radius={[0, 4, 4, 0]}
            />
          ))}
        </BarChart>
      );

    case "line":
      return (
        <LineChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          {showTooltip && (
            <ChartTooltip content={<ChartTooltipContent />} />
          )}
          {showLegend && (
            <ChartLegend content={<ChartLegendContent />} />
          )}
          {dataKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={`var(--color-${key})`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      );

    case "area":
      return (
        <AreaChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          {showTooltip && (
            <ChartTooltip content={<ChartTooltipContent />} />
          )}
          {showLegend && (
            <ChartLegend content={<ChartLegendContent />} />
          )}
          {dataKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={`var(--color-${key})`}
              fill={`var(--color-${key})`}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      );

    case "scatter":
      return (
        <ScatterChart>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="x" type="number" tickLine={false} axisLine={false} name="x" />
          <YAxis dataKey="y" type="number" tickLine={false} axisLine={false} name="y" />
          {showTooltip && (
            <ChartTooltip content={<ChartTooltipContent />} />
          )}
          {showLegend && (
            <ChartLegend content={<ChartLegendContent />} />
          )}
          <Scatter
            data={data}
            fill={colors[0]}
          />
        </ScatterChart>
      );

    case "pie":
      return (
        <PieChart>
          {showTooltip && (
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          )}
          {showLegend && (
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
          )}
          <Pie
            data={data}
            dataKey={dataKeys[0] || "value"}
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="80%"
          >
            {data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      );

    case "donut":
      return (
        <PieChart>
          {showTooltip && (
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          )}
          {showLegend && (
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
          )}
          <Pie
            data={data}
            dataKey={dataKeys[0] || "value"}
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="50%"
            outerRadius="80%"
          >
            {data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      );

    case "rose":
      return (
        <PieChart>
          {showTooltip && (
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          )}
          {showLegend && (
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
          )}
          <Pie
            data={data}
            dataKey={dataKeys[0] || "value"}
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="80%"
          >
            {data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      );

    default:
      return (
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          {dataKeys.map((key, i) => (
            <Bar key={key} dataKey={key} fill={colors[i % colors.length]} />
          ))}
        </BarChart>
      );
  }
}
