import * as React from "react";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative h-3 w-full overflow-hidden rounded-full bg-white/10", className)}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          indicatorClassName ?? "bg-gradient-to-r from-[#16f195] via-[#ffa500] to-[#ff4b4b]"
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
);

Progress.displayName = "Progress";

export { Progress };
