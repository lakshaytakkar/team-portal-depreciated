import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, useInView } from "motion/react";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatOptions?: Intl.NumberFormatOptions;
}

function AnimatedNumberInner({
  value,
  duration = 1.2,
  prefix = "",
  suffix = "",
  className,
  formatOptions,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState("0");

  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    duration: duration,
  });

  const display = useTransform(spring, (latest) => {
    const formatted = new Intl.NumberFormat(
      "en-US",
      formatOptions ?? { maximumFractionDigits: 0 }
    ).format(Math.round(latest));
    return formatted;
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  useEffect(() => {
    const unsubscribe = display.on("change", (v) => {
      setDisplayValue(v);
    });
    return unsubscribe;
  }, [display]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

export function AnimatedNumber(props: AnimatedNumberProps) {
  return <AnimatedNumberInner {...props} />;
}
