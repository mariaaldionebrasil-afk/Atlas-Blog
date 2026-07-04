type Props = {
  label: string;
  url: string;
};

export default function AffiliateButton({ label, url }: Props) {
  return (
    <a
      href={url}
      target="_blank"
      rel="sponsored nofollow"
      className="inline-block rounded-md bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-gray-800"
    >
      {label}
    </a>
  );
}
