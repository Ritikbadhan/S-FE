"use client";

import { useContext, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CategoryIcon from "@mui/icons-material/Category";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ReviewsIcon from "@mui/icons-material/Reviews";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { ColorModeContext } from "@/context/ThemeContext";

const sidebarWidth = 280;
const collapsedSidebarWidth = 84;

const navSections = [
  {
    label: "Main",
    items: [
      // { href: "/admin", label: "Dashboard", icon: DashboardIcon },
      { href: "/admin/products", label: "Products", icon: Inventory2Icon },
      { href: "/admin/categories", label: "Categories", icon: CategoryIcon },
      { href: "/admin/orders", label: "Orders", icon: ShoppingCartCheckoutIcon },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/inventory", label: "Inventory", icon: Inventory2Icon },
      { href: "/admin/users", label: "Customers", icon: PeopleAltIcon },
      { href: "/admin/reviews", label: "Reviews", icon: ReviewsIcon },
    ],
  },
];

const subtitles = {
  "Admin Dashboard": "A focused view of revenue, orders, catalog health, and recent activity.",
  Products: "Manage catalog quality, pricing, stock, and merchandising signals.",
  "Add Product": "Create a polished product listing with clear inventory metadata.",
  "Edit Product": "Tune product details, variants, imagery, and storefront visibility.",
  "Manage Orders": "Track fulfillment, payments, delivery status, and customer requests.",
  "Manage Categories": "Organize the storefront taxonomy and discovery paths.",
  "Inventory Management": "Monitor stock risk and keep variants ready to sell.",
  "Manage Users": "Review customer health, loyalty, and account status.",
  "Manage Reviews": "Moderate product feedback and surface useful social proof.",
};

function SidebarContent({ collapsed = false, onClose, onToggleCollapse }) {
  const pathname = usePathname();
  const theme = useTheme();

  const isActive = (href) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname?.startsWith(href);
  };

  return (
    <Stack
      sx={{
        height: "100%",
        p: collapsed ? 2 : 3,
        gap: 3,
        alignItems: collapsed ? "center" : "stretch",
        transition: "all 0.3s ease",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={collapsed ? "center" : "space-between"}
        sx={{ width: "100%" }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          justifyContent={collapsed ? "center" : "flex-start"}
          sx={{ minWidth: 0 }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              display:collapsed ? "none" : "grid",
              placeItems: "center",
              color: "#fff",
              fontWeight: 800,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            S
          </Box>
          <Box sx={{ display: collapsed ? "none" : "block", minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, lineHeight: 1 }}>
              Sharq Admin
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Commerce control
            </Typography>
          </Box>
        </Stack>

        {onClose ? (
          <IconButton onClick={onClose} aria-label="Close admin menu">
            <CloseIcon />
          </IconButton>
        ) : onToggleCollapse ? (
          <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right">
            <IconButton onClick={onToggleCollapse} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>

      <Stack spacing={collapsed ? 2 : 3} sx={{ flex: 1, minHeight: 0, width: "100%" }}>
        {navSections.map((section) => (
          <Stack key={section.label} spacing={1} alignItems={collapsed ? "center" : "stretch"}>
            <Typography
              variant="caption"
              sx={{
                px: 2,
                fontWeight: 800,
                color: "text.secondary",
                textTransform: "uppercase",
                display: collapsed ? "none" : "block",
              }}
            >
              {section.label}
            </Typography>

            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Tooltip
                  key={item.href}
                  title={collapsed ? item.label : ""}
                  placement="right"
                  disableHoverListener={!collapsed}
                >
                  <Box
                    component={Link}
                    href={item.href}
                    onClick={onClose}
                    sx={{
                      width: collapsed ? 52 : "100%",
                      height: 52,
                      borderRadius: "15px",
                      px: collapsed ? 0 : 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: collapsed ? "center" : "flex-start",
                      gap: 1.5,
                      position: "relative",
                      color: active ? "primary.dark" : "text.secondary",
                      bgcolor: active ? "rgba(207,162,146,0.14)" : "transparent",
                      fontWeight: active ? 800 : 650,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: collapsed ? "translateY(-2px)" : "translateX(4px)",
                        bgcolor: "rgba(207,162,146,0.10)",
                        color: "primary.dark",
                      },
                      "&::before": active
                        ? {
                            content: '""',
                            position: "absolute",
                            left: collapsed ? 6 : 0,
                            top: 12,
                            bottom: 12,
                            width: 4,
                            borderRadius: 99,
                            bgcolor: "primary.main",
                          }
                        : {},
                    }}
                  >
                    <Icon fontSize="small" />
                    <Typography
                      sx={{
                        display: collapsed ? "none" : "block",
                        fontWeight: "inherit",
                        fontSize: "0.92rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                </Tooltip>
              );
            })}
          </Stack>
        ))}
      </Stack>

     

     
    </Stack>
  );
}

export default function AdminShell({ title, subtitle, children }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const colorMode = useContext(ColorModeContext);
  const resolvedSubtitle = subtitle || subtitles[title] || "Manage your ecommerce operation.";
  const currentSidebarWidth = sidebarCollapsed ? collapsedSidebarWidth : sidebarWidth;

  const drawerPaperSx = useMemo(
    () => ({
      width: sidebarWidth,
      borderRight: "1px solid rgba(0,0,0,0.06)",
      bgcolor: "background.paper",
      backgroundImage: "none",
    }),
    [],
  );

  return (
    <Box
      className="admin-shell"
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        mt: { xs: -1, md: -2 },
      }}
    >
      <Box
        component="aside"
        sx={{
          display: { xs: "none", lg: "block" },
          position: "fixed",
          top: 0,
          left: 0,
          width: currentSidebarWidth,
          height: "100vh",
          zIndex: 1300,
          bgcolor: "background.paper",
          borderRight: "1px solid rgba(0,0,0,0.06)",
          transition: "width 0.3s ease",
        }}
      >
        <SidebarContent
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
        />
      </Box>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: drawerPaperSx }}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </Drawer>

      <Box sx={{ ml: { lg: `${currentSidebarWidth}px` }, minWidth: 0, transition: "margin-left 0.3s ease" }}>
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            minHeight: { xs: 72, md: 80 },
            px: { xs: 2, sm: 3 },
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            backdropFilter: "blur(12px)",
            bgcolor: "rgba(255,255,255,0.75)",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0 }}>
            {!isDesktop ? (
              <IconButton onClick={() => setMobileOpen(true)} aria-label="Open admin menu">
                <MenuIcon />
              </IconButton>
            ) : null}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                component="h1"
                sx={{
                  fontFamily: theme.typography.fontFamilyBody,
                  fontSize: { xs: "1.35rem", sm: "2rem" },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: 0,
                }}
              >
                {title}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{
                  display: { xs: "none", sm: "block" },
                  mt: 0.5,
                  fontSize: "0.9rem",
                  fontFamily: theme.typography.fontFamilyBody,
                }}
              >
                {resolvedSubtitle}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <TextField
              size="small"
              placeholder="Search admin..."
              sx={{
                display: { xs: "none", md: "block" },
                width: 260,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 4,
                  bgcolor: "background.paper",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          
           
          </Stack>
        </Box>

        <Box
          component="main"
          sx={{
            p: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: "column",
            gap: 3,
            fontFamily: theme.typography.fontFamilyBody,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
