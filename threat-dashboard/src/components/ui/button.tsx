import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-foreground shadow-lg shadow-black/50 hover:from-slate-800 hover:to-slate-950 active:scale-[0.98]",
        accent:
          "bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-black shadow-glow hover:from-emerald-400 hover:to-emerald-600",
        destructive:
          "bg-gradient-to-br from-red-600 to-red-800 text-white shadow-glow hover:from-red-500 hover:to-red-700",
        outline:
          "border border-white/30 bg-white/5 text-foreground hover:bg-white/10 hover:text-white",
      },
      size: {
        default: "h-16 px-6",
        xl: "h-32 px-8 text-2xl",
        icon: "h-32 w-32 rounded-3xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
