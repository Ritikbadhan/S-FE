"use client";

import Link from "next/link";
import { Box, Button, Container, Typography, Stack } from "@mui/material";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reviews", label: "Reviews" },
];

export default function AdminShell({ title, children }) {
  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      {/* PAGE TITLE */}
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 700,
        }}
      >
        {title}
      </Typography>

      {/* NAVIGATION */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          mb: 4,
          flexWrap: "wrap",
        }}
      >
        {links.map((item) => (
          <Button
            key={item.href}
            component={Link}
            href={item.href}
            variant="outlined"
            size="small"
          >
            {item.label}
          </Button>
        ))}
      </Stack>

      {/* PAGE CONTENT */}
      <Box sx={{ width: "100%" }}>{children}</Box>
    </Container>
  );
}