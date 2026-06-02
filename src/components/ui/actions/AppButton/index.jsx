import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../../../lib/utils";
import { buttonVariants } from "./buttonVariants";

export const Button = React.forwardRef(({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    />
  );
});

Button.displayName = "Button";
