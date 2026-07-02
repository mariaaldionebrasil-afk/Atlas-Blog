import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Breadcrumb from "../../components/Breadcrumb";
import AuthorBio from "../../components/AuthorBio";
import { authors } from "../../lib/mock-data";
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

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Nossa missão</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              O {siteConfig.siteName} publica conteúdo informacional independente nas áreas de
              tecnologia, saúde e finanças pessoais, voltado para adultos brasileiros que buscam
              orientação prática e baseada em evidências para tomar melhores decisões no dia a dia.
            </p>
            <p>
              Não vendemos cursos, não aceitamos conteúdo patrocinado não identificado e não
              publicamos recomendações de produtos que não testamos. Quando usamos links de afiliados,
              isso é sempre declarado explicitamente no artigo.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Como produzimos o conteúdo</h2>
          <p className="text-gray-700 leading-relaxed">
            Cada artigo é pesquisado, redigido e revisado por um dos nossos colaboradores com
            formação ou experiência comprovada na área. Artigos de saúde seguem as recomendações
            de organismos como a OMS, Ministério da Saúde e publicações científicas revisadas por
            pares. Reviews de produtos passam por um período mínimo de uso real antes de serem
            publicados — não avaliamos produtos com base apenas em especificações técnicas.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quem escreve aqui</h2>
          <div className="space-y-6">
            {authors.map((author) => (
              <div key={author.slug} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-500">
                    {author.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{author.name}</p>
                    <p className="mt-2 text-gray-600 leading-relaxed">{author.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
