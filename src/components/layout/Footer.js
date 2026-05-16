"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Box,
  Typography,
  Grid,
  Container,
  IconButton,
  Stack,
  Divider,
  useTheme,
} from "@mui/material";
import {
  EmailOutlined,
  PhoneOutlined,
  LocationOnOutlined,
  Instagram,
  WhatsApp,
} from "@mui/icons-material";
import { useIsMobile } from "@/hooks/useIsMobile";

function FooterLink({ href, children }) {
  const theme = useTheme();
  const brand = theme.palette.brand;

  return (
    <Typography
      component={Link}
      href={href}
      sx={{
        display: "block",
        mt: { xs: 0.8, md: 1.5 },
        textDecoration: "none",
        color: brand.textMuted,
        fontSize: { xs: "0.78rem", sm: "0.9rem" },
        fontWeight: 400,
        letterSpacing: 0.2,
        transition: "all 0.2s ease",
        position: "relative",
        width: "fit-content",
        lineHeight: 1.4,
        "&:hover": {
          color: brand.primary,
          transform: "translateX(4px)",
        },
      }}
    >
      {children}
    </Typography>
  );
}

function ContactItem({ icon: Icon, children }) {
  const theme = useTheme();
  const brand = theme.palette.brand;

  return (
    <Stack
      direction="row"
      spacing={{ xs: 1, md: 1.5 }}
      sx={{
        mt: { xs: 1, md: 1.5 },
        alignItems: "flex-start",
      }}
    >
      <Icon
        sx={{
          fontSize: { xs: 16, md: 20 },
          color: brand.primary,
          mt: 0.2,
        }}
      />

      <Typography
        sx={{
          color: brand.textMuted,
          fontSize: { xs: "0.78rem", sm: "0.9rem" },
          lineHeight: 1.5,
          letterSpacing: 0.2,
        }}
      >
        {children}
      </Typography>
    </Stack>
  );
}

export default function Footer() {
  const isMobile = useIsMobile();
  const theme = useTheme();
  const brand = theme.palette.brand;

  const logoSrc =
    theme.palette.mode !== "dark"
      ? "/sharq_logo_light.png"
      : "/sharq_logo_dark.png";

  const socialLinks = [
    {
      icon: Instagram,
      href: "https://instagram.com/sharqlabel",
      label: "Instagram",
    },
    {
      icon: WhatsApp,
      href: "https://wa.me/918750728485",
      label: "WhatsApp",
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        background: `linear-gradient(to bottom, ${brand.bg} 0%, ${brand.surface} 100%)`,
        borderTop: `1px solid ${brand.border}`,
        position: "relative",
        overflow: "hidden",

        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
        },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            py: { xs: 3, md: 8 },
          }}
        >
          <Grid container spacing={{ xs: 2.5, md: 6 }}>
            {/* BRAND */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  maxWidth: { xs: "100%", md: 320 },
                }}
              >
                <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
                  <Image
                    src={logoSrc}
                    alt="Sharq Label"
                    width={180}
                    height={60}
                    style={{
                      width: "auto",
                      height: isMobile ? "40px" : "52px",
                      objectFit: "contain",
                    }}
                  />
                </Box>

                <Typography
                  variant="subtitle2"
                  sx={{
                    letterSpacing: { xs: 2, md: 3 },
                    color: brand.primary,
                    fontWeight: 300,
                    fontSize: { xs: "0.62rem", sm: "0.75rem" },
                    mb: { xs: 1.5, md: 2.5 },
                  }}
                >
                  BORN TO BE DIFFERENT
                </Typography>

                <Typography
                  sx={{
                    color: brand.textMuted,
                    fontSize: { xs: "0.82rem", sm: "1rem" },
                    lineHeight: { xs: 1.5, md: 1.7 },
                    mb: { xs: 2, md: 3 },
                    maxWidth: { xs: "95%", md: "100%" },
                  }}
                >
                  Elevate your style with our premium menswear collection.
                  Luxury shirts and tees crafted for the modern gentleman.
                </Typography>

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: brand.text,
                      fontSize: { xs: "0.8rem", md: "0.875rem" },
                      mb: 1,
                      letterSpacing: 0.4,
                    }}
                  >
                    Follow Us
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    {socialLinks.map((social) => (
                      <IconButton
                        key={social.label}
                        component="a"
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        sx={{
                          color: brand.textMuted,
                          backgroundColor: brand.borderSoft,
                          width: { xs: 34, md: 40 },
                          height: { xs: 34, md: 40 },
                          transition: "all 0.3s ease",

                          "&:hover": {
                            backgroundColor: brand.primary,
                            color: "#FFFFFF",
                            transform: "translateY(-2px)",
                            boxShadow: `0 4px 12px ${brand.primary}40`,
                          },
                        }}
                      >
                        <social.icon
                          sx={{
                            fontSize: { xs: 18, md: 20 },
                          }}
                        />
                      </IconButton>
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Grid>

            {/* SHOP */}
            <Grid item xs={6} sm={4} md={2}>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: brand.text,
                  mb: { xs: 1, md: 2 },
                  fontSize: { xs: "0.85rem", md: "1rem" },
                }}
              >
                Shop
              </Typography>

              <FooterLink href="/shop">All Products</FooterLink>
              <FooterLink href="/shirts">Shirts</FooterLink>
              <FooterLink href="/tees">T-Shirts</FooterLink>
              <FooterLink href="/new-arrivals">New Arrivals</FooterLink>
              <FooterLink href="/collection">Collections</FooterLink>
            </Grid>

            {/* COMPANY */}
            <Grid item xs={6} sm={4} md={2}>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: brand.text,
                  mb: { xs: 1, md: 2 },
                  fontSize: { xs: "0.85rem", md: "1rem" },
                }}
              >
                Company
              </Typography>

              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/faq">FAQ</FooterLink>
            </Grid>

            {/* POLICIES */}
            <Grid item xs={6} sm={4} md={2}>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: brand.text,
                  mb: { xs: 1, md: 2 },
                  fontSize: { xs: "0.85rem", md: "1rem" },
                }}
              >
                Policies
              </Typography>

              <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>

              <FooterLink href="/terms">Terms & Conditions</FooterLink>

              <FooterLink href="/shipping">Shipping Policy</FooterLink>

              <FooterLink href="/returns">Returns & Refunds</FooterLink>
            </Grid>

            {/* CONTACT */}
            <Grid item xs={12} sm={8} md={2}>
              <Typography
                sx={{
                  fontWeight: 600,
                  color: brand.text,
                  mb: { xs: 1, md: 2 },
                  fontSize: { xs: "0.85rem", md: "1rem" },
                }}
              >
                Contact Us
              </Typography>

              <ContactItem icon={LocationOnOutlined}>
                ZETA-1,
                {/* <br /> */}
                Greater Noida, India
              </ContactItem>

              <ContactItem icon={PhoneOutlined}>
                <Box
                  component="a"
                  href="tel:+918750728485"
                  sx={{
                    color: "inherit",
                    textDecoration: "none",

                    "&:hover": {
                      color: brand.primary,
                    },
                  }}
                >
                  +91 8750728485
                </Box>
              </ContactItem>

              <ContactItem icon={EmailOutlined}>
                <Box
                  component="a"
                  href="mailto:info@sharqlabel.com"
                  sx={{
                    color: "inherit",
                    textDecoration: "none",

                    "&:hover": {
                      color: brand.primary,
                    },
                  }}
                >
                  info@sharqlabel.com
                </Box>
              </ContactItem>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Divider sx={{ borderColor: brand.border }} />

      {/* BOTTOM SECTION */}
      <Container maxWidth="lg">
        <Box
          sx={{
            py: { xs: 2, md: 4 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: { xs: 1, md: 2 },
          }}
        >
          <Typography
            sx={{
              color: brand.textMuted,
              fontSize: { xs: "0.72rem", md: "0.85rem" },
              textAlign: "center",
            }}
          >
            Copyright {new Date().getFullYear()} Sharq Label. All Rights
            Reserved.
          </Typography>

          <Stack direction="row" spacing={{ xs: 2, md: 3 }}>
            <Typography
              component={Link}
              href="/privacy-policy"
              sx={{
                fontSize: { xs: "0.75rem", md: "0.85rem" },
              }}
            >
              Privacy
            </Typography>

            <Typography
              component={Link}
              href="/terms"
              sx={{
                fontSize: { xs: "0.75rem", md: "0.85rem" },
              }}
            >
              Terms
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
