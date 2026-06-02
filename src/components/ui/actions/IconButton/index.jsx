import * as React from "react";
import { Button } from "../AppButton";

export const IconButton = React.forwardRef(({ label, children, ...props }, ref) => (
  <Button ref={ref} size="icon" aria-label={label} title={label} {...props}>
    {children}
  </Button>
));

IconButton.displayName = "IconButton";
