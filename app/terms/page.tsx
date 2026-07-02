import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Breadcrumb from "../../components/Breadcrumb";
import siteConfig from "../../config/site.config";

const crumbs = [
  { label: "Home", href: "/" },
  { label: "Termos de Uso", href: "/terms" },
];

export default function TermsPage() {
  const lastUpdated = "2025-07-01";

  return (
    <>
      <Header config={siteConfig} />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-10 w-full">
        <Breadcrumb crumbs={crumbs} />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Termos de Uso</h1>
        <p className="mt-2 text-sm text-gray-400">Última atualização: {lastUpdated}</p>

        <div className="mt-8 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Aceitação dos termos</h2>
            <p>
              Ao acessar e usar o {siteConfig.siteName}, você concorda com estes Termos de Uso.
              Se não concordar com algum dos termos, por favor, não utilize este site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Uso do conteúdo</h2>
            <p>
              Todo o conteúdo publicado neste site — incluindo textos, imagens e outros materiais
              — é de propriedade do {siteConfig.siteName} ou de seus colaboradores e está protegido
              por direitos autorais. É permitido compartilhar links para os artigos, mas a reprodução
              total ou parcial do conteúdo sem autorização é proibida.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Isenção de responsabilidade</h2>
            <p>
              O conteúdo publicado neste site tem caráter exclusivamente informacional e educativo.
              Não constitui aconselhamento médico, financeiro ou jurídico. Antes de tomar qualquer
              decisão relacionada à saúde ou finanças, consulte um profissional habilitado.
            </p>
            <p className="mt-2">
              O {siteConfig.siteName} não se responsabiliza por decisões tomadas com base nas
              informações aqui publicadas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Links externos</h2>
            <p>
              Este site pode conter links para sites de terceiros. Esses links são fornecidos para
              sua conveniência e não implicam endosso do conteúdo desses sites. Não nos
              responsabilizamos pelo conteúdo ou pelas práticas de privacidade de sites externos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Alterações nos termos</h2>
            <p>
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento.
              Alterações entram em vigor imediatamente após publicação nesta página.
              O uso continuado do site após as alterações implica aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Contato</h2>
            <p>
              Para dúvidas sobre estes termos, entre em contato pelo e-mail:{" "}
              <a href={`mailto:contato@${siteConfig.domain}`} className="text-blue-600 hover:underline">
                contato@{siteConfig.domain}
              </a>.
            </p>
          </section>
        </div>
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
