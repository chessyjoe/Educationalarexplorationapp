import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 transition-all duration-75",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 active:bg-destructive",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 active:bg-accent/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 active:bg-accent/70",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80",
        neumorphic: "bg-primary text-primary-foreground font-semibold shadow-[0_8px_0_rgba(0,0,0,0.15),0_12px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_0_rgba(0,0,0,0.15),0_15px_25px_rgba(0,0,0,0.15)] active:shadow-[0_4px_0_rgba(0,0,0,0.1),0_6px_12px_rgba(0,0,0,0.08)] active:translate-y-1",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3 rounded-[1.5rem]",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5 rounded-[1.2rem]",
        lg: "h-14 px-8 has-[>svg]:px-6 rounded-[1.5rem]",
        icon: "size-9 rounded-[1.2rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
