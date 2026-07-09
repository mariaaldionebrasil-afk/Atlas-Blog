import { GoogleGenAI } from '@google/genai';

export type SocialNetwork = 'pinterest' | 'facebook' | 'instagram';

const networkGuidance: Record<SocialNetwork, string> = {
  pinterest:
    'Pinterest: legenda descritiva, rica em palavras-chave de busca (o Pinterest funciona como um motor de busca visual), tom informativo, no máximo 2-3 hashtags.',
  facebook:
    'Facebook: tom neutro e direto, frase de gancho curta no início, sem hashtags, convidando a pessoa a clicar no link para ler mais.',
  instagram:
    'Instagram: tom casual e envolvente, pode usar emojis com moderação, termine com 5 a 10 hashtags relevantes ao produto/tema, e finalize com uma chamada explícita tipo "Link na bio para ler o artigo completo!" — o Instagram não permite link clicável no post do feed, então essa chamada é obrigatória.',
};

export async function generateSocialCaption(
  title: string,
  summary: string,
  network: SocialNetwork
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_TEXT_API_KEY! });

  const prompt = `Escreva uma legenda para uma publicação de rede social divulgando este conteúdo:

Título: "${title}"
Resumo: "${summary}"

Rede-alvo: ${network}
Diretrizes desta rede: ${networkGuidance[network]}

Escreva em português do Brasil. Responda apenas com o texto da legenda, sem explicações nem aspas envolvendo o texto.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const text = response.text;
  if (!text) {
    throw new Error('A IA não retornou uma legenda.');
  }

  return text.trim();
}
