"use client";

import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  TableContainer,
  Typography,
  useTheme,
} from "@mui/material";

export function AdminStatCard({ label, value, icon, tone = "primary", meta, progress }) {
  const theme = useTheme();
  const color = theme.palette[tone]?.main || theme.palette.primary.main;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: 180,
        borderRadius: "15px",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        bgcolor: "background.paper",
        overflow: "hidden",
        position: "relative",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
        },
      }}
    >
      <Stack spacing={2} sx={{ height: "100%", position: "relative", zIndex: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography
            sx={{
              fontSize: "0.75rem",
              fontWeight: 800,
              color: "text.secondary",
              textTransform: "uppercase",
            }}
          >
            {label}
          </Typography>
          {icon ? (
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "15px",
                display: "grid",
                placeItems: "center",
                color,
                bgcolor: `${color}18`,
              }}
            >
              {icon}
            </Box>
          ) : null}
        </Stack>

        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontFamily: theme.typography.fontFamilyBody,
              fontSize: { xs: "1.65rem", sm: "2rem" },
              fontWeight: 800,
              letterSpacing: 0,
            }}
          >
            {value}
          </Typography>
          {meta ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {meta}
            </Typography>
          ) : null}
        </Box>

        {typeof progress === "number" ? (
          <LinearProgress
            variant="determinate"
            value={Math.max(0, Math.min(100, progress))}
            sx={{
              height: 8,
              borderRadius: 99,
              bgcolor: `${color}16`,
              "& .MuiLinearProgress-bar": {
                bgcolor: color,
                borderRadius: 99,
              },
            }}
          />
        ) : null}
      </Stack>
    </Paper>
  );
}

export function AdminPanel({ title, action, children, sx }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "15px",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        bgcolor: "background.paper",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
        },
        ...sx,
      }}
    >
      {title || action ? (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          {title ? (
            <Typography sx={{ fontSize: "1.2rem", fontWeight: 700 }}>
              {title}
            </Typography>
          ) : null}
          {action}
        </Stack>
      ) : null}
      {children}
    </Paper>
  );
}

export function AdminTableWrap({ children, maxHeight }) {
  return (
    <TableContainer
      sx={{
        borderRadius: "15px",
        border: "1px solid rgba(0,0,0,0.06)",
        overflowX: "auto",
        maxHeight,
        "& .MuiTableHead-root .MuiTableCell-root": {
          position: "sticky",
          top: 0,
          zIndex: 2,
          bgcolor: "background.paper",
          height: 64,
          fontSize: "0.75rem",
          fontWeight: 800,
          textTransform: "uppercase",
          color: "text.secondary",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        },
        "& .MuiTableBody-root .MuiTableRow-root": {
          minHeight: 84,
          transition: "all 0.2s ease",
          "&:nth-of-type(even)": {
            bgcolor: "rgba(0,0,0,0.015)",
          },
          "&:hover": {
            bgcolor: "rgba(207,162,146,0.10)",
          },
        },
        "& .MuiTableCell-root": {
          py: 2,
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          fontSize: "0.9rem",
        },
      }}
    >
      {children}
    </TableContainer>
  );
}

export function StatusPill({ label, color = "default" }) {
  return <Chip size="small" label={label} color={color} sx={{ fontWeight: 700 }} />;
}
