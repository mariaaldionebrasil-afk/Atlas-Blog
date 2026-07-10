type Props = {
  label: string;
  url: string;
  variant?: "primary" | "secondary";
};

export default function AffiliateButton({ label, url, variant = "primary" }: Props) {
  const styles =
    variant === "secondary"
      ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      : "bg-gray-900 text-white hover:bg-gray-800";

  return (
    <a
      href={url}
      target="_blank"
      rel="sponsored nofollow"
      className={`inline-block rounded-md px-4 py-2 text-center text-sm font-medium ${styles}`}
    >
      {label}
    </a>
  );
}
