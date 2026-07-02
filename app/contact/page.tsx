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

        <div className="mt-4 text-gray-700 leading-relaxed">
          <p>
            Para dúvidas, sugestões de pauta ou parcerias, fale conosco diretamente pelo e-mail:
          </p>
          <p className="mt-3">
            <a
              href={`mailto:contato@${siteConfig.domain}`}
              className="text-blue-600 font-medium hover:underline text-lg"
            >
              contato@{siteConfig.domain}
            </a>
          </p>
          <p className="mt-2 text-sm text-gray-500">Respondemos em até 2 dias úteis.</p>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Ou envie uma mensagem</h2>
          {/* Formulário sem backend — envio via Fase 2 */}
          <form className="space-y-5" action="#" method="POST">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Assunto
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Dúvida, sugestão ou parceria"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Mensagem
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Escreva sua mensagem aqui..."
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Enviar mensagem
            </button>
          </form>
          <p className="mt-4 text-xs text-gray-400">
            O envio automático do formulário estará disponível em breve.
          </p>
        </div>
      </main>
      <Footer config={siteConfig} />
    </>
  );
}
