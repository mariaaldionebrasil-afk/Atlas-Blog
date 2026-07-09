import { GoogleGenAI, Modality } from '@google/genai';
import type { SupabaseClient } from '@supabase/supabase-js';

export type SocialAspectRatio = '2:3' | '1:1' | '4:5' | '1.91:1';

export async function reframeImage(
  supabase: SupabaseClient,
  sourceImageUrl: string,
  aspectRatio: SocialAspectRatio,
  fileNameHint: string
): Promise<string> {
  const sourceResponse = await fetch(sourceImageUrl);
  if (!sourceResponse.ok) {
    throw new Error(`Não foi possível baixar a imagem de origem: ${sourceResponse.status}`);
  }
  const sourceMimeType = sourceResponse.headers.get('content-type') ?? 'image/jpeg';
  const sourceBase64 = Buffer.from(await sourceResponse.arrayBuffer()).toString('base64');

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_IMAGE_API_KEY! });

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image',
    contents: [
      { inlineData: { data: sourceBase64, mimeType: sourceMimeType } },
      `Reenquadre esta imagem para a proporção ${aspectRatio}, mantendo o assunto principal centralizado e totalmente visível, sem cortar partes importantes e sem adicionar tarjas ou bordas. Mantenha o estilo visual da imagem original.`,
    ],
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((part) => part.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    throw new Error('A IA não retornou nenhuma imagem reenquadrada.');
  }

  const mimeType = imagePart.inlineData.mimeType ?? 'image/png';
  const extension = mimeType.split('/')[1] ?? 'png';
  const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
  const ratioTag = aspectRatio.replace(/[:.]/g, 'x');
  const filePath = `${fileNameHint}-${ratioTag}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from('covers')
    .upload(filePath, buffer, { contentType: mimeType, upsert: false });

  if (error) {
    throw new Error(`Falha ao enviar imagem reenquadrada: ${error.message}`);
  }

  const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
  return data.publicUrl;
}
