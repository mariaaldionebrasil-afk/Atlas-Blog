import type { SiteConfig } from "../lib/types";

const siteConfig: SiteConfig = {
  siteName: "Blog Vinícius Azevedo",
  domain: "drviniciusazevedo.com.br",
  menu: [
    { label: "Início", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Avaliações", href: "/reviews" },
    { label: "Sobre", href: "/about" },
    { label: "Contato", href: "/contact" },
  ],
};

export default siteConfig;
