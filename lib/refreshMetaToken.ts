import { prisma } from './prisma';

const GRAPH_VERSION = 'v23.0';
const RENEWAL_THRESHOLD_MS = 10 * 24 * 60 * 60 * 1000;

export async function refreshFacebookUserToken(
  currentToken: string
): Promise<{ token: string; expiresAt: Date }> {
  const clientId = process.env.META_APP_ID!;
  const clientSecret = process.env.META_APP_SECRET!;
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${encodeURIComponent(currentToken)}`;

  const response = await fetch(url);
  const json = await response.json();

  if (!response.ok || !json.access_token) {
    throw new Error(`Falha ao renovar token de usuário do Facebook: ${JSON.stringify(json)}`);
  }

  const expiresInSeconds = typeof json.expires_in === 'number' ? json.expires_in : 60 * 24 * 60 * 60;
  return {
    token: json.access_token,
    expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
  };
}

export async function derivePageAccessToken(userToken: string): Promise<string> {
  const pageId = process.env.FACEBOOK_PAGE_ID!;
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/me/accounts?access_token=${encodeURIComponent(userToken)}`;

  const response = await fetch(url);
  const json = await response.json();

  if (!response.ok || !Array.isArray(json.data)) {
    throw new Error(`Falha ao buscar contas de Página do Facebook: ${JSON.stringify(json)}`);
  }

  const page = json.data.find((entry: { id: string }) => entry.id === pageId);
  if (!page?.access_token) {
    throw new Error(`Página ${pageId} não encontrada entre as contas administradas por este usuário.`);
  }

  return page.access_token as string;
}

export async function refreshInstagramToken(
  currentToken: string
): Promise<{ token: string; expiresAt: Date }> {
  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(currentToken)}`;

  const response = await fetch(url);
  const json = await response.json();

  if (!response.ok || !json.access_token) {
    throw new Error(`Falha ao renovar token do Instagram: ${JSON.stringify(json)}`);
  }

  const expiresInSeconds = typeof json.expires_in === 'number' ? json.expires_in : 60 * 24 * 60 * 60;
  return {
    token: json.access_token,
    expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
  };
}

export async function ensureMetaTokensFresh(): Promise<void> {
  const credential = await prisma.metaCredential.findUnique({ where: { id: 'singleton' } });
  if (!credential) {
    throw new Error('Nenhuma credencial Meta encontrada (MetaCredential singleton ausente).');
  }

  const now = Date.now();

  if (credential.facebookUserTokenExpiresAt.getTime() - now < RENEWAL_THRESHOLD_MS) {
    try {
      const { token, expiresAt } = await refreshFacebookUserToken(credential.facebookUserToken);
      const pageAccessToken = await derivePageAccessToken(token);
      await prisma.metaCredential.update({
        where: { id: 'singleton' },
        data: {
          facebookUserToken: token,
          facebookUserTokenExpiresAt: expiresAt,
          facebookPageAccessToken: pageAccessToken,
        },
      });
    } catch (err) {
      console.error('Falha ao renovar token do Facebook:', err);
    }
  }

  if (credential.instagramTokenExpiresAt.getTime() - now < RENEWAL_THRESHOLD_MS) {
    try {
      const { token, expiresAt } = await refreshInstagramToken(credential.instagramAccessToken);
      await prisma.metaCredential.update({
        where: { id: 'singleton' },
        data: { instagramAccessToken: token, instagramTokenExpiresAt: expiresAt },
      });
    } catch (err) {
      console.error('Falha ao renovar token do Instagram:', err);
    }
  }
}
