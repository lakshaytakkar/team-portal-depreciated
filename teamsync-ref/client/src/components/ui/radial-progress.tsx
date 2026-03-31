import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { AnimatedNumber } from "./animated-number";

interface RadialProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  bgColor?: string;
  label: string;
  className?: string;
}

export function RadialProgress({
  value,
  max,
  size = 64,
  strokeWidth = 5,
  color,
  bgColor = "hsl(var(--muted))",
  label,
  className,
}: RadialProgressProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = max > 0 ? value / max : 0;
  const offset = circumference * (1 - percentage);

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className ?? ""}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          ref={ref}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={bgColor}
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={isInView ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedNumber
            value={value}
            className="text-sm font-semibold font-heading"
            duration={0.8}
          />
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
