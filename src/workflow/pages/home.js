export const getHomePageContent = (isMobile) => ({
  image: {
    src: isMobile
      ? "/Home_mobile.png"
      : "/Home.jpg",
    alt: "SHARQ LABEL Hero Banner",
  },

  hero: {
    title: "SHARQ LABEL",
    eyebrow: "BORN TO BE DIFFERENT",
    subtitle: "Luxury Menswear Redefined",
    ctaLabel: "Explore Collection",
    ctaHref: "/collection",
  },
});