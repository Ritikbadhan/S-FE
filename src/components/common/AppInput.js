"use client";

import { forwardRef } from "react";
import { TextField } from "@mui/material";

const AppInput = forwardRef(function AppInput(
  { variant = "outlined", fullWidth = true, ...props },
  ref
) {
  return <TextField ref={ref} variant={variant} fullWidth={fullWidth} {...props} />;
});

export default AppInput;
