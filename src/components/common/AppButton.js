"use client";

import { forwardRef } from "react";
import { Button } from "@mui/material";

const AppButton = forwardRef(function AppButton(
  { children, variant = "contained", color = "primary", ...props },
  ref
) {
  return (
    <Button ref={ref} variant={variant} color={color} {...props}>
      {children}
    </Button>
  );
});

export default AppButton;
