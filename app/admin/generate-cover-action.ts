'use server';

import { createClient } from '@/lib/supabase/server';
import { generateImage } from '@/lib/generateImage';

export async function generateCoverImageAction(prompt: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Não autenticado.' };
  }

  if (!prompt.trim()) {
    return { error: 'Descreva a imagem que você quer gerar.' };
  }

  try {
    const url = await generateImage(supabase, prompt, 'cover');
    return { url };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Erro ao gerar imagem.',
    };
  }
}
