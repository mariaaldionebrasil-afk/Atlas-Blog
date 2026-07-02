import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Breadcrumb from "../../components/Breadcrumb";
import siteConfig from "../../config/site.config";

const crumbs = [
  { label: "Home", href: "/" },
  { label: "Sobre", href: "/about" },
];

export default function AboutPage() {
  return (
    <>
      <Header config={siteConfig} />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-10 w-full">
        <Breadcrumb crumbs={crumbs} />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Sobre o {siteConfig.siteName}</h1>
        <div className="mt-6 space-y-4 text-gray-700 leading-relaxed">
          <p>
            O {siteConfig.siteName} é um blog dedicado a produzir conteúdo informacional de
            qualidade nas áreas de tecnologia, saúde e finanças pessoais.
          </p>
          <p>
            Nossa missão é oferecer guias práticos, reviews honestos e artigos bem fundamentados
            para ajudar você a tomar decisões mais informadas no dia a dia.
          </p>
          <p>
            Todo o conteúdo é produzido com base em pesquisa, testes reais e curadoria criteriosa
            das fontes utilizadas.
          </p>
        </div>
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
