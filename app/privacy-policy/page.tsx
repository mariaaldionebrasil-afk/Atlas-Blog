import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Breadcrumb from "../../components/Breadcrumb";
import siteConfig from "../../config/site.config";

const crumbs = [
  { label: "Home", href: "/" },
  { label: "Política de Privacidade", href: "/privacy-policy" },
];

export default function PrivacyPolicyPage() {
  const lastUpdated = "2025-07-01";

  return (
    <>
      <Header config={siteConfig} />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-10 w-full">
        <Breadcrumb crumbs={crumbs} />
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-gray-400">Última atualização: {lastUpdated}</p>

        <div className="mt-8 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Informações que coletamos</h2>
            <p>
              O {siteConfig.siteName} pode coletar informações não identificáveis automaticamente
              quando você visita o site, incluindo tipo de navegador, páginas visitadas, tempo de
              permanência e endereço IP. Essas informações são usadas exclusivamente para análise
              de tráfego e melhoria do conteúdo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Cookies e Google Analytics</h2>
            <p>
              Este site utiliza cookies — pequenos arquivos de texto armazenados no seu navegador
              — para melhorar a experiência de navegação e para fins de análise de audiência.
              Ao continuar navegando neste site, você concorda com o uso de cookies.
            </p>
            <p className="mt-2">
              Utilizamos o Google Analytics, um serviço de análise de audiência do Google LLC, que
              usa cookies para coletar informações sobre como os visitantes utilizam o site
              (páginas visitadas, tempo de permanência, origem do acesso, dispositivo, entre
              outros). Essas informações são tratadas de forma agregada e usadas exclusivamente
              para entender o comportamento de navegação e melhorar o conteúdo do site.
            </p>
            <p className="mt-2">
              Você pode configurar seu navegador para recusar cookies ou para alertá-lo quando
              cookies estiverem sendo enviados. Se fizer isso, algumas partes do site podem não
              funcionar corretamente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Publicidade — Google AdSense</h2>
            <p>
              Este site utiliza o Google AdSense, um serviço de publicidade prestado pelo Google LLC.
              O Google AdSense usa cookies e tecnologias similares para exibir anúncios relevantes
              com base nas suas visitas anteriores a este e a outros sites.
            </p>
            <p className="mt-2">
              O Google pode usar as informações coletadas para personalizar os anúncios exibidos
              para você. Você pode optar por não receber anúncios personalizados acessando as
              <a href="https://www.google.com/settings/ads" className="text-blue-600 hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                configurações de anúncios do Google
              </a>.
            </p>
            <p className="mt-2">
              Para mais informações sobre como o Google usa dados de parceiros que utilizam seus
              serviços, acesse:{" "}
              <a href="https://policies.google.com/technologies/partner-sites" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                policies.google.com/technologies/partner-sites
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Links de afiliados</h2>
            <p>
              Alguns artigos deste site podem conter links de afiliados. Isso significa que podemos
              receber uma comissão se você realizar uma compra através desses links, sem custo
              adicional para você. Sempre identificamos claramente quando um link é de afiliado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Compartilhamento de dados</h2>
            <p>
              Não vendemos, trocamos ou transferimos para terceiros suas informações pessoais
              identificáveis, exceto quando exigido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Contato</h2>
            <p>
              Se tiver dúvidas sobre esta Política de Privacidade, entre em contato pelo e-mail:{" "}
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
