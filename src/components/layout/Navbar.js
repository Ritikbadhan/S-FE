"use client";

import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Box,
  Badge,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Avatar,
  Typography,
  Stack,
} from "@mui/material";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";

import { useContext, useState } from "react";
import { ColorModeContext } from "../../context/ThemeContext";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { isAdminUser } from "@/lib/authRole";

export default function Navbar() {
  const { toggleColorMode, mode } = useContext(ColorModeContext);
  const theme = useTheme();
  const brand = theme.palette.brand;
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const canSeeAdmin = Boolean(isAuthenticated && isAdminUser(user));

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    router.push("/");
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  // Navigation Links
  const navLinks = [
    { label: "Shop", href: "/shop" },
    { label: "Collection", href: "/collection" },
    { label: "New Arrivals", href: "/new-arrivals" },
  ];

  const navLinkStyle = {
    position: "relative",
    fontSize: { xs: "0.9375rem", md: "1rem" },
    fontWeight: 500,
    textTransform: "none",
    letterSpacing: 0.5,
    px: { xs: 1.5, md: 2 },
    py: 1,
    color: brand.text,
    transition: "all 0.3s ease",
    "&::after": {
      content: '""',
      position: "absolute",
      width: 0,
      height: "2px",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: brand.primary,
      transition: "width 0.3s ease",
    },
    "&:hover": {
      color: brand.primary,
      backgroundColor: brand.borderSoft,
      "&::after": {
        width: "70%",
      },
    },
  };

  const iconButtonStyle = {
    color: brand.text,
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: brand.borderSoft,
      transform: "scale(1.05)",
      color: brand.primary,
    },
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: "blur(14px)",
          background: brand.navGlass,
          borderBottom: `1px solid ${brand.borderSoft}`,
          boxShadow: brand.shadowCard,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            sx={{
              justifyContent: "space-between",
              py: { xs: 0.5, md: 1 },
              px: { xs: 0, sm: 1.5 },
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                transition: "transform 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <Link href="/">
                <Image
                  src={
                    mode != "dark"
                      ? "/sharq_logo_light.png"
                      : "/sharq_logo_dark.png"
                  }
                  alt="Sharq Label"
                  width={156}
                  height={52}
                  style={{
                    cursor: "pointer",
                    height: 48,
                    width: "auto",
                    objectFit: "contain",
                  }}
                />
              </Link>
            </Box>

            {/* Desktop Navigation */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                gap: 0.5,
                alignItems: "center",
              }}
            >
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  component={Link}
                  href={link.href}
                  sx={navLinkStyle}
                >
                  {link.label}
                </Button>
              ))}
            </Box>

            {/* Right Section */}
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1 } }}>
              {/* Wishlist - Hidden on small mobile */}
              <IconButton
                component={Link}
                href="/wishlist"
                sx={{
                  ...iconButtonStyle,
                  display: { xs: "none", sm: "flex" },
                }}
                aria-label="wishlist"
              >
                <Badge
                  badgeContent={0}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.65rem",
                      minWidth: "18px",
                      height: "18px",
                    },
                  }}
                >
                  <FavoriteBorderIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
                </Badge>
              </IconButton>

              {/* Cart */}
              <IconButton
                component={Link}
                href="/cart"
                sx={iconButtonStyle}
                aria-label="shopping cart"
              >
                <Badge
                  badgeContent={0}
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.65rem",
                      minWidth: "18px",
                      height: "18px",
                    },
                  }}
                >
                  <ShoppingBagOutlinedIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
                </Badge>
              </IconButton>

              {/* Desktop Auth Buttons */}
              {!isMobile && (
                <>
                  {isAuthenticated ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}>
                      <Button
                        component={Link}
                        href="/account"
                        startIcon={<PersonOutlineIcon />}
                        sx={{
                          ...navLinkStyle,
                          backgroundColor: brand.borderSoft,
                          borderRadius: "24px",
                          px: 2.5,
                          "&:hover": {
                            backgroundColor: brand.primary,
                            color: "#FFFFFF",
                            "&::after": {
                              width: 0,
                            },
                          },
                        }}
                      >
                        {user?.name?.toUpperCase().split(" ")[0]}
                      </Button>

                      {canSeeAdmin && (
                        <Button
                          component={Link}
                          href="/admin"
                          startIcon={<AdminPanelSettingsOutlinedIcon />}
                          sx={{
                            ...navLinkStyle,
                            color: brand.primary,
                            "&:hover": {
                              color: brand.hover,
                            },
                          }}
                        >
                          Admin
                        </Button>
                      )}

                      <IconButton
                        onClick={() => setOpenLogoutDialog(true)}
                        sx={iconButtonStyle}
                        aria-label="logout"
                      >
                        <LogoutOutlinedIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", gap: 1, ml: 1 }}>
                      <Button
                        component={Link}
                        href="/login"
                        startIcon={<LoginOutlinedIcon />}
                        sx={{
                          ...navLinkStyle,
                          borderRadius: "24px",
                        }}
                      >
                        Login
                      </Button>
                      <Button
                        component={Link}
                        href="/signup"
                        variant="contained"
                        startIcon={<PersonAddOutlinedIcon />}
                        sx={{
                          borderRadius: "24px",
                          px: 2.5,
                          py: 1,
                          textTransform: "none",
                          fontWeight: 600,
                          letterSpacing: 0.5,
                          background: `linear-gradient(135deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
                          boxShadow: brand.shadowButton,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: brand.shadowCardStrong,
                            background: `linear-gradient(135deg, ${brand.gradientEnd}, ${brand.gradientStart})`,
                          },
                        }}
                      >
                        Sign Up
                      </Button>
                    </Box>
                  )}
                </>
              )}

              {/* Theme Toggle */}
              <IconButton
                onClick={toggleColorMode}
                sx={{
                  ...iconButtonStyle,
                  ml: { xs: 0, md: 1 },
                }}
                aria-label="toggle theme"
              >
                {mode === "dark" ? (
                  <LightModeIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
                ) : (
                  <DarkModeIcon sx={{ fontSize: { xs: 22, md: 24 } }} />
                )}
              </IconButton>

              {/* Mobile Menu Button */}
              <IconButton
                onClick={() => setMobileMenuOpen(true)}
                sx={{
                  ...iconButtonStyle,
                  display: { xs: "flex", md: "none" },
                }}
                aria-label="open menu"
              >
                <MenuIcon sx={{ fontSize: { xs: 26, sm: 28 } }} />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        PaperProps={{
          sx: {
            width: { xs: "85%", sm: 340 },
            maxWidth: "100%",
            background: brand.surface,
            borderLeft: `1px solid ${brand.borderSoft}`,
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Drawer Header */}
          <Box
            sx={{
              p: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${brand.border}`,
              background: `linear-gradient(135deg, ${brand.primary}10, ${brand.hover}10)`,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: brand.text,
                letterSpacing: 1,
              }}
            >
              Menu
            </Typography>
            <IconButton
              onClick={handleMobileMenuClose}
              sx={{
                color: brand.text,
                "&:hover": {
                  backgroundColor: brand.borderSoft,
                  transform: "rotate(90deg)",
                },
                transition: "transform 0.3s ease",
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* User Info Section */}
          {isAuthenticated && (
            <Box
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${brand.gradientStart}15, ${brand.gradientEnd}15)`,
                borderBottom: `1px solid ${brand.borderSoft}`,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    background: `linear-gradient(135deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
                    fontSize: "1.5rem",
                    fontWeight: 600,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: brand.text,
                      mb: 0.5,
                    }}
                  >
                    {user?.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: brand.textMuted,
                      fontSize: "0.75rem",
                    }}
                  >
                    {user?.email}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Navigation Links */}
          <List sx={{ flex: 1, py: 2 }}>
            {navLinks.map((link) => (
              <ListItem key={link.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={link.href}
                  onClick={handleMobileMenuClose}
                  sx={{
                    py: 1.75,
                    px: 3,
                    transition: "all 0.2s ease",
                    borderLeft: `3px solid transparent`,
                    "&:hover": {
                      backgroundColor: brand.borderSoft,
                      borderLeftColor: brand.primary,
                      pl: 4,
                    },
                  }}
                >
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: "1rem",
                      letterSpacing: 0.5,
                      color: brand.text,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}

            <Divider sx={{ my: 2, mx: 2, borderColor: brand.border }} />

            {/* Wishlist Link for Mobile */}
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/wishlist"
                onClick={handleMobileMenuClose}
                sx={{
                  py: 1.75,
                  px: 3,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: brand.borderSoft,
                    pl: 4,
                  },
                }}
              >
                <FavoriteBorderIcon
                  sx={{ mr: 2, color: brand.primary, fontSize: 22 }}
                />
                <ListItemText
                  primary="Wishlist"
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: "1rem",
                    color: brand.text,
                  }}
                />
                <Badge badgeContent={0} color="error" />
              </ListItemButton>
            </ListItem>

            {/* Cart Link for Mobile */}
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/cart"
                onClick={handleMobileMenuClose}
                sx={{
                  py: 1.75,
                  px: 3,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: brand.borderSoft,
                    pl: 4,
                  },
                }}
              >
                <ShoppingBagOutlinedIcon
                  sx={{ mr: 2, color: brand.primary, fontSize: 22 }}
                />
                <ListItemText
                  primary="Cart"
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: "1rem",
                    color: brand.text,
                  }}
                />
                <Badge badgeContent={0} color="error" />
                </ListItemButton>
              </ListItem>

            <Divider sx={{ my: 2, mx: 2, borderColor: brand.border }} />

            {/* Auth Links */}
            {isAuthenticated ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    href="/account"
                    onClick={handleMobileMenuClose}
                    sx={{
                      py: 1.75,
                      px: 3,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: brand.borderSoft,
                        pl: 4,
                      },
                    }}
                  >
                    <PersonOutlineIcon
                      sx={{ mr: 2, color: brand.primary, fontSize: 22 }}
                    />
                    <ListItemText
                      primary="My Account"
                      primaryTypographyProps={{
                        fontWeight: 500,
                        fontSize: "1rem",
                        color: brand.text,
                      }}
                    />
                  </ListItemButton>
                </ListItem>

                {canSeeAdmin && (
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      href="/admin"
                      onClick={handleMobileMenuClose}
                      sx={{
                        py: 1.75,
                        px: 3,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: brand.borderSoft,
                          pl: 4,
                        },
                      }}
                    >
                      <AdminPanelSettingsOutlinedIcon
                        sx={{ mr: 2, color: brand.primary, fontSize: 22 }}
                      />
                      <ListItemText
                        primary="Admin Panel"
                        primaryTypographyProps={{
                          fontWeight: 500,
                          fontSize: "1rem",
                          color: brand.text,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )}

                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      handleMobileMenuClose();
                      setOpenLogoutDialog(true);
                    }}
                    sx={{
                      py: 1.75,
                      px: 3,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: `${brand.error}20`,
                        pl: 4,
                      },
                    }}
                  >
                    <LogoutOutlinedIcon
                      sx={{ mr: 2, color: brand.error, fontSize: 22 }}
                    />
                    <ListItemText
                      primary="Logout"
                      primaryTypographyProps={{
                        fontWeight: 500,
                        fontSize: "1rem",
                        color: brand.error,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </>
            ) : (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    href="/login"
                    onClick={handleMobileMenuClose}
                    sx={{
                      py: 1.75,
                      px: 3,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: brand.borderSoft,
                        pl: 4,
                      },
                    }}
                  >
                    <LoginOutlinedIcon
                      sx={{ mr: 2, color: brand.primary, fontSize: 22 }}
                    />
                    <ListItemText
                      primary="Login"
                      primaryTypographyProps={{
                        fontWeight: 500,
                        fontSize: "1rem",
                        color: brand.text,
                      }}
                    />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding sx={{ px: 2, mt: 1 }}>
                  <Button
                    component={Link}
                    href="/signup"
                    fullWidth
                    variant="contained"
                    onClick={handleMobileMenuClose}
                    startIcon={<PersonAddOutlinedIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: "24px",
                      textTransform: "none",
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      background: `linear-gradient(135deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
                      boxShadow: brand.shadowButton,
                    }}
                  >
                    Sign Up
                  </Button>
                </ListItem>
              </>
            )}
          </List>

          {/* Footer */}
          <Box
            sx={{
              p: 2.5,
              borderTop: `1px solid ${brand.border}`,
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: brand.textMuted,
                fontSize: "0.75rem",
                letterSpacing: 0.3,
              }}
            >
              © 2024 Sharq Label. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Drawer>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: brand.surface,
            border: `1px solid ${brand.borderSoft}`,
            boxShadow: brand.shadowCardStrong,
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            color: brand.text,
            fontSize: "1.25rem",
            pb: 1,
          }}
        >
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              color: brand.textMuted,
              fontSize: "0.9375rem",
              lineHeight: 1.6,
            }}
          >
            Are you sure you want to logout from your account?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setOpenLogoutDialog(false)}
            sx={{
              textTransform: "none",
              borderRadius: "24px",
              px: 3,
              color: brand.text,
              "&:hover": {
                backgroundColor: brand.borderSoft,
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setOpenLogoutDialog(false);
              await handleLogout();
            }}
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: "24px",
              px: 3,
              background: `linear-gradient(135deg, ${brand.error}, ${brand.error}CC)`,
              "&:hover": {
                background: `linear-gradient(135deg, ${brand.error}DD, ${brand.error}BB)`,
              },
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
