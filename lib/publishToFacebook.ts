import { prisma } from './prisma';

const GRAPH_VERSION = 'v23.0';

export async function publishToFacebook(
  imageUrl: string,
  caption: string,
  articleUrl: string
): Promise<string> {
  const pageId = process.env.FACEBOOK_PAGE_ID!;
  const credential = await prisma.metaCredential.findUnique({ where: { id: 'singleton' } });
  if (!credential) {
    throw new Error('Nenhuma credencial Meta encontrada (MetaCredential singleton ausente).');
  }

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/photos`;
  const body = new URLSearchParams({
    url: imageUrl,
    caption: `${caption}\n\n${articleUrl}`,
    access_token: credential.facebookPageAccessToken,
  });

  const response = await fetch(url, { method: 'POST', body });
  const json = await response.json();

  if (!response.ok || !json.post_id) {
    throw new Error(`Falha ao publicar no Facebook: ${JSON.stringify(json)}`);
  }

  return json.post_id as string;
}
