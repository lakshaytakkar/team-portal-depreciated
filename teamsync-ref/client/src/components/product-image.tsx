import { useState } from "react";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: "w-6 h-6",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const iconSizeMap = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

export function ProductImage({ src, alt, size = "sm", className }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0",
          sizeMap[size],
          className,
        )}
        title={alt}
      >
        <Package className={cn("text-gray-400", iconSizeMap[size])} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        "rounded-lg object-cover shrink-0 bg-gray-100",
        sizeMap[size],
        className,
      )}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}
