'use server';

import { createClient } from '@/lib/supabase/server';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

export async function uploadCoverImageAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Não autenticado.' };
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { error: 'Nenhum arquivo enviado.' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Formato inválido. Use PNG, JPEG ou WEBP.' };
  }

  if (file.size > MAX_SIZE) {
    return { error: 'Arquivo muito grande. O limite é 5MB.' };
  }

  const extension = file.type.split('/')[1];
  const filePath = `upload-${Date.now()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from('covers')
    .upload(filePath, buffer, { contentType: file.type, upsert: false });

  if (error) {
    return { error: `Falha ao enviar imagem para o Supabase Storage: ${error.message}` };
  }

  const { data } = supabase.storage.from('covers').getPublicUrl(filePath);
  return { url: data.publicUrl };
}
