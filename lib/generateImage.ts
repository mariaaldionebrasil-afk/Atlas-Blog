import { GoogleGenAI, Modality } from '@google/genai';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function generateImage(
  supabase: SupabaseClient,
  prompt: string,
  fileNameHint: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_IMAGE_API_KEY! });
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image',
    contents: prompt,
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((part) => part.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    throw new Error('A IA não retornou nenhuma imagem.');
  }

  const mimeType = imagePart.inlineData.mimeType ?? 'image/png';
  const extension = mimeType.split('/')[1] ?? 'png';
  const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
  const filePath = `${fileNameHint}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from('covers')
    .upload(filePath, buffer, { contentType: mimeType, upsert: false });

  if (error) {
    throw new Error(`Falha ao enviar imagem para o Supabase Storage: ${error.message}`);
  }

  const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
  return data.publicUrl;
}
