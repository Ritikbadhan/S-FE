"use client";

import { Tooltip } from "@mui/material";

export default function AppTooltip({ title, children, ...props }) {
  return (
    <Tooltip title={title || ""} disableHoverListener={!title} {...props}>
      {children}
    </Tooltip>
  );
}
