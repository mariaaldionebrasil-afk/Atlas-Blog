import type { SiteConfig } from "../lib/types";
import { categories } from "../lib/mock-data";

const siteConfig: SiteConfig = {
  siteName: "Atlas Blog Demo",
  domain: "atlasblog.demo",
  menu: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Reviews", href: "/reviews" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  categories,
};

export default siteConfig;
