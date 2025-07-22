import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Badge } from "./badge"
import { cn } from "@repo/design-system/lib/utils"

const statusBadgeVariants = cva("", {
  variants: {
    status: {
      // Campaign statuses
      draft: "bg-muted text-muted-foreground border-muted",
      active: "bg-success/10 text-success border-success/20 dark:bg-success/20 dark:text-success dark:border-success/30",
      paused: "bg-warning/10 text-warning border-warning/20 dark:bg-warning/20 dark:text-warning dark:border-warning/30",
      completed: "bg-info/10 text-info border-info/20 dark:bg-info/20 dark:text-info dark:border-info/30",
      archived: "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30",
      
      // Content statuses
      ready: "bg-success/10 text-success border-success/20 dark:bg-success/20 dark:text-success dark:border-success/30",
      published: "bg-success/10 text-success border-success/20 dark:bg-success/20 dark:text-success dark:border-success/30",
      
      // Schedule statuses
      pending: "bg-warning/10 text-warning border-warning/20 dark:bg-warning/20 dark:text-warning dark:border-warning/30",
      publishing: "bg-info/10 text-info border-info/20 dark:bg-info/20 dark:text-info dark:border-info/30",
      failed: "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30",
      cancelled: "bg-muted text-muted-foreground border-muted",
    },
  },
  defaultVariants: {
    status: "draft",
  },
})

interface StatusBadgeProps
  extends React.ComponentProps<typeof Badge>,
    VariantProps<typeof statusBadgeVariants> {
  status: NonNullable<VariantProps<typeof statusBadgeVariants>["status"]>
}

function StatusBadge({ className, status, children, ...props }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusBadgeVariants({ status }), className)}
      {...props}
    >
      {children || status}
    </Badge>
  )
}

export { StatusBadge, statusBadgeVariants }