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
  Facebook,
  Instagram,
  Twitter,
  LinkedIn,
  YouTube,
  WhatsApp 
} from "@mui/icons-material";

function FooterLink({ href, children }) {
  const theme = useTheme();
  const brand = theme.palette.brand;

  return (
    <Typography
      component={Link}
      href={href}
      sx={{
        display: "block",
        mt: 1.5,
        textDecoration: "none",
        color: brand.textMuted,
        fontSize: { xs: "0.875rem", sm: "0.9375rem" },
        fontWeight: 400,
        letterSpacing: 0.3,
        transition: "all 0.2s ease",
        position: "relative",
        width: "fit-content",
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
      spacing={1.5}
      sx={{
        mt: 1.5,
        alignItems: "flex-start",
      }}
    >
      <Icon
        sx={{
          fontSize: 20,
          color: brand.primary,
          mt: 0.2,
        }}
      />
      <Typography
        sx={{
          color: brand.textMuted,
          fontSize: { xs: "0.875rem", sm: "0.9375rem" },
          lineHeight: 1.6,
          letterSpacing: 0.2,
        }}
      >
        {children}
      </Typography>
    </Stack>
  );
}

export default function Footer() {
  const theme = useTheme();
  const brand = theme.palette.brand;
  const logoSrc =
    theme.palette.mode != "dark"
      ? "/sharq_logo_light.png"
      : "/sharq_logo_dark.png";

  const socialLinks = [
    // { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com/sharqlabel", label: "Instagram" },
    // { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    // { icon: LinkedIn, href: "https://linkedin.com", label: "LinkedIn" },
    // { icon: YouTube, href: "https://youtube.com", label: "YouTube" },
    { icon: WhatsApp,href: "https://wa.me/917678294158",label: "WhatsApp"},
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
        height: "3px",
        background: `linear-gradient(90deg, ${brand.gradientStart}, ${brand.gradientEnd})`,
      },
    }}
  >
    <Container maxWidth="lg">
        <Box sx={{ py: { xs: 6, md: 8 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  maxWidth: { xs: "100%", md: 320 },
                }}
              >
              <Box sx={{ mb: 1.5 }}>
                <Image
                  src={logoSrc}
                  alt="Sharq Label"
                  width={180}
                  height={60}
                  style={{
                    width: "auto",
                    height: "52px",
                    objectFit: "contain",
                  }}
                />
              </Box>

              <Typography
                variant="subtitle2"
                sx={{
                  letterSpacing: 3,
                  color: brand.primary,
                  fontWeight: 300,
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  mb: 2.5,
                }}
              >
                BORN TO BE DIFFERENT
              </Typography>

              <Typography
                sx={{
                  color: brand.textMuted,
                  fontSize: { xs: "0.9375rem", sm: "1rem" },
                  lineHeight: 1.7,
                  mb: 3,
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
                    fontSize: "0.875rem",
                    mb: 1.5,
                    letterSpacing: 0.5,
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
                        width: 40,
                        height: 40,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: brand.primary,
                          color: "#FFFFFF",
                          transform: "translateY(-3px)",
                          boxShadow: `0 4px 12px ${brand.primary}40`,
                        },
                      }}
                    >
                      <social.icon sx={{ fontSize: 20 }} />
                    </IconButton>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Grid>

          {/* SHOP */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography sx={{ fontWeight: 600, color: brand.text, mb: 2 }}>
              Shop
            </Typography>
            <FooterLink href="/shop">All Products</FooterLink>
            <FooterLink href="/shirts">Shirts</FooterLink>
            <FooterLink href="/tees">T-Shirts</FooterLink>
            <FooterLink href="/new-arrivals">New Arrivals</FooterLink>
            <FooterLink href="/collection">Collections</FooterLink>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography sx={{ fontWeight: 600, color: brand.text, mb: 2 }}>
              Company
            </Typography>
            <FooterLink href="/about">About Us</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/faq">FAQ</FooterLink>
          </Grid>

          {/* POLICIES */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography sx={{ fontWeight: 600, color: brand.text, mb: 2 }}>
              Policies
            </Typography>
            <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
            <FooterLink href="/terms">Terms & Conditions</FooterLink>
            <FooterLink href="/shipping">Shipping Policy</FooterLink>
            <FooterLink href="/returns">Returns & Refunds</FooterLink>
          </Grid>

          <Grid item xs={12} sm={8} md={2}>
            <Typography sx={{ fontWeight: 600, color: brand.text, mb: 2 }}>
              Contact Us
            </Typography>
            <ContactItem icon={LocationOnOutlined}>
                D-102, Ace Platinum, ZETA-1,
                <br />
              Greater Noida, India
            </ContactItem>
            <ContactItem icon={PhoneOutlined}>
              <Box
                component="a"
                href="tel:+917678294158"
                sx={{
                  color: "inherit",
                  textDecoration: "none",
                    "&:hover": {
                      color: brand.primary,
                    },
                }}
              >
                +91 7678294158
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
          py: { xs: 3, md: 4 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography sx={{ color: brand.textMuted, fontSize: "0.85rem" }}>
          Copyright {new Date().getFullYear()} Sharq Label. All Rights Reserved.
        </Typography>

        <Stack direction="row" spacing={3}>
          <Typography component={Link} href="/privacy-policy">
            Privacy
          </Typography>
          <Typography component={Link} href="/terms">
            Terms
          </Typography>
        </Stack>
      </Box>
    </Container>
  </Box>
);
}
