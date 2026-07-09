import { prisma } from './prisma';

const GRAPH_VERSION = 'v22.0';
const MAX_POLL_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 3000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function publishToInstagram(imageUrl: string, caption: string): Promise<string> {
  const igUserId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID!;
  const credential = await prisma.metaCredential.findUnique({ where: { id: 'singleton' } });
  if (!credential) {
    throw new Error('Nenhuma credencial Meta encontrada (MetaCredential singleton ausente).');
  }
  const accessToken = credential.instagramAccessToken;

  const createUrl = `https://graph.instagram.com/${GRAPH_VERSION}/${igUserId}/media`;
  const createBody = new URLSearchParams({
    image_url: imageUrl,
    caption,
    access_token: accessToken,
  });

  const createResponse = await fetch(createUrl, { method: 'POST', body: createBody });
  const createJson = await createResponse.json();

  if (!createResponse.ok || !createJson.id) {
    throw new Error(`Falha ao criar container de mídia no Instagram: ${JSON.stringify(createJson)}`);
  }

  const creationId = createJson.id as string;

  let status = '';
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const statusUrl = `https://graph.instagram.com/${GRAPH_VERSION}/${creationId}?fields=status_code&access_token=${encodeURIComponent(accessToken)}`;
    const statusResponse = await fetch(statusUrl);
    const statusJson = await statusResponse.json();

    if (!statusResponse.ok) {
      throw new Error(`Falha ao verificar status do container do Instagram: ${JSON.stringify(statusJson)}`);
    }

    status = statusJson.status_code;
    if (status === 'FINISHED') break;
    if (status === 'ERROR') {
      throw new Error(`Processamento do container do Instagram falhou: ${JSON.stringify(statusJson)}`);
    }

    await sleep(POLL_INTERVAL_MS);
  }

  if (status !== 'FINISHED') {
    throw new Error(`Tempo esgotado aguardando processamento do container do Instagram (último status: ${status}).`);
  }

  const publishUrl = `https://graph.instagram.com/${GRAPH_VERSION}/${igUserId}/media_publish`;
  const publishBody = new URLSearchParams({
    creation_id: creationId,
    access_token: accessToken,
  });

  const publishResponse = await fetch(publishUrl, { method: 'POST', body: publishBody });
  const publishJson = await publishResponse.json();

  if (!publishResponse.ok || !publishJson.id) {
    throw new Error(`Falha ao publicar mídia no Instagram: ${JSON.stringify(publishJson)}`);
  }

  return publishJson.id as string;
}
