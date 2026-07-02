import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Breadcrumb from "../../components/Breadcrumb";
import siteConfig from "../../config/site.config";

const crumbs = [
  { label: "Home", href: "/" },
  { label: "Contato", href: "/contact" },
];

export default function ContactPage() {
  return (
    <>
      <Header config={siteConfig} />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-10 w-full">
        <Breadcrumb crumbs={crumbs} />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Contato</h1>
        <div className="mt-6 space-y-4 text-gray-700 leading-relaxed">
          <p>
            Para dúvidas, sugestões de pauta ou parcerias, entre em contato pelo e-mail abaixo.
          </p>
          <p>
            <a
              href={`mailto:contato@${siteConfig.domain}`}
              className="text-blue-600 hover:underline"
            >
              contato@{siteConfig.domain}
            </a>
          </p>
          <p className="text-sm text-gray-500">
            Respondemos em até 2 dias úteis.
          </p>
        </div>
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
