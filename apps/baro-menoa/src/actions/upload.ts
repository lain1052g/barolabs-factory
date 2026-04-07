'use server';

import { createClient } from '@/lib/supabase/server';

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// NOTE: Supabase Storage 버킷 'menoa-content'이 존재해야 합니다.
// 없다면 Supabase 대시보드 → Storage → New bucket → 이름: menoa-content, Public 체크
export async function uploadContentThumbnail(
  formData: FormData,
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: '인증이 필요합니다.' };

  const file = formData.get('file') as File | null;
  if (!file) return { error: '파일이 없습니다.' };
  if (file.size > MAX_SIZE) return { error: '파일 크기는 2MB 이하여야 합니다.' };
  if (!ALLOWED_TYPES.includes(file.type)) return { error: 'JPEG, PNG, WebP 형식만 지원합니다.' };

  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `thumbnails/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { data, error } = await supabase.storage
    .from('menoa-content') // 버킷명
    .upload(fileName, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) return { error: '업로드 실패: ' + error.message };

  const { data: urlData } = supabase.storage.from('menoa-content').getPublicUrl(data.path);

  return { url: urlData.publicUrl };
}
