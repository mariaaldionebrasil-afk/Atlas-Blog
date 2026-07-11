import type { SiteConfig } from "../lib/types";

const siteConfig: SiteConfig = {
  siteName: "Atlas Blog Demo",
  domain: "drviniciusazevedo.com.br",
  menu: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Reviews", href: "/reviews" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};

export default siteConfig;
