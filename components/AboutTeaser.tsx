import Link from "next/link";

type Props = {
  siteName: string;
};

export default function AboutTeaser({ siteName }: Props) {
  return (
    <section className="mt-16 rounded-lg bg-gray-900 text-white px-8 py-10">
      <h2 className="text-xl font-bold mb-3">Quem está por trás do {siteName}?</h2>
      <p className="text-gray-300 leading-relaxed max-w-2xl">
        Somos uma equipe de jornalistas, educadores e especialistas que acreditam que boas decisões
        começam com informação honesta. Testamos os produtos que recomendamos, citamos as fontes que
        usamos e nunca aceitamos conteúdo patrocinado sem identificação clara.
      </p>
      <Link
        href="/about"
        className="mt-6 inline-block px-5 py-2.5 bg-white text-gray-900 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
      >
        Conheça nossa equipe →
      </Link>
    </section>
  );
}
