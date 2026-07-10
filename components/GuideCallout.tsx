import Link from "next/link";

type Props = {
  roundupTitle: string;
  roundupSlug: string;
};

export default function GuideCallout({ roundupTitle, roundupSlug }: Props) {
  return (
    <Link
      href={`/roundup/${roundupSlug}`}
      className="mb-6 block rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 hover:bg-blue-100"
    >
      Este artigo faz parte do nosso guia:{" "}
      <span className="font-semibold underline">{roundupTitle}</span>
    </Link>
  );
}
