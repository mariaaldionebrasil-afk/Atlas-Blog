type FailedPublication = {
  network: 'FACEBOOK' | 'INSTAGRAM';
  errorMessage: string | null;
};

const networkLabel: Record<string, string> = {
  FACEBOOK: 'Facebook',
  INSTAGRAM: 'Instagram',
};

export function SocialPublishBadge({ failures }: { failures: FailedPublication[] }) {
  if (failures.length === 0) return null;

  const title = failures
    .map((f) => `${networkLabel[f.network] ?? f.network}: ${f.errorMessage ?? 'erro desconhecido'}`)
    .join(' | ');

  return (
    <span
      title={title}
      className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
    >
      ⚠ falha ao publicar em {failures.map((f) => networkLabel[f.network] ?? f.network).join(', ')}
    </span>
  );
}
