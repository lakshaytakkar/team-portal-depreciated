import type { ComponentProps } from "react"
import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

function PageSpinner({ className, label, ...props }: ComponentProps<"div"> & { label?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[200px] gap-3", className)} {...props}>
      <Spinner className="size-8" />
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  )
}

function InlineSpinner({ className, ...props }: ComponentProps<"span">) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)} {...props}>
      <Spinner className="size-3" />
    </span>
  )
}

export { Spinner, PageSpinner, InlineSpinner }
