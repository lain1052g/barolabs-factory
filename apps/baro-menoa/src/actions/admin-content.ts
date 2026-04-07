'use server';

import { db } from '@/db';
import { menoa_expert_contents } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/admin';
import { eq, isNull, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ─── 어드민 권한 체크 ────────────────────────────────
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdmin(user.email)) {
    redirect('/dashboard');
  }
  return user;
}

// ─── Zod 스키마 ────────────────────────────────────
const contentSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요').max(200, '제목은 200자 이하입니다'),
  body: z.string().min(1, '본문을 입력하세요'),
  category: z.enum(['nutrition', 'exercise', 'mental', 'medical', 'lifestyle'], {
    errorMap: () => ({ message: '카테고리를 선택하세요' }),
  }),
  author_name: z.string().min(1, '작성자명을 입력하세요'),
  author_title: z.string().optional(),
  reviewed_by: z.string().optional(),
  thumbnail_url: z.string().url().optional().or(z.literal('')),
  is_pro_only: z.coerce.boolean().default(false),
  is_published: z.coerce.boolean().default(false),
});

export type ContentFormState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof contentSchema>, string[]>>;
  success?: boolean;
};

// ─── 목록 조회 ────────────────────────────────────
export type AdminContentItem = {
  id: string;
  title: string;
  category: string;
  author_name: string;
  author_title: string | null;
  is_published: boolean;
  is_pro_only: boolean;
  created_at: Date;
  updated_at: Date;
};

export async function getAdminContents(): Promise<AdminContentItem[]> {
  await requireAdmin();

  const rows = await db
    .select({
      id: menoa_expert_contents.id,
      title: menoa_expert_contents.title,
      category: menoa_expert_contents.category,
      author_name: menoa_expert_contents.author_name,
      author_title: menoa_expert_contents.author_title,
      is_published: menoa_expert_contents.is_published,
      is_pro_only: menoa_expert_contents.is_pro_only,
      created_at: menoa_expert_contents.created_at,
      updated_at: menoa_expert_contents.updated_at,
    })
    .from(menoa_expert_contents)
    .where(isNull(menoa_expert_contents.deleted_at))
    .orderBy(desc(menoa_expert_contents.created_at));

  return rows;
}

// ─── 단건 조회 (수정용) ───────────────────────────
export type AdminContentDetail = {
  id: string;
  title: string;
  body: string;
  category: 'nutrition' | 'exercise' | 'mental' | 'medical' | 'lifestyle';
  author_name: string;
  author_title: string | null;
  reviewed_by: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  is_pro_only: boolean;
};

export async function getAdminContent(id: string): Promise<AdminContentDetail | null> {
  await requireAdmin();

  const [row] = await db
    .select({
      id: menoa_expert_contents.id,
      title: menoa_expert_contents.title,
      body: menoa_expert_contents.body,
      category: menoa_expert_contents.category,
      author_name: menoa_expert_contents.author_name,
      author_title: menoa_expert_contents.author_title,
      reviewed_by: menoa_expert_contents.reviewed_by,
      thumbnail_url: menoa_expert_contents.thumbnail_url,
      is_published: menoa_expert_contents.is_published,
      is_pro_only: menoa_expert_contents.is_pro_only,
    })
    .from(menoa_expert_contents)
    .where(eq(menoa_expert_contents.id, id))
    .limit(1);

  if (!row) return null;

  return {
    ...row,
    category: row.category as AdminContentDetail['category'],
  };
}

// ─── 생성 ─────────────────────────────────────────
export async function createExpertContent(
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireAdmin();

  const raw = {
    title: formData.get('title'),
    body: formData.get('body'),
    category: formData.get('category'),
    author_name: formData.get('author_name'),
    author_title: formData.get('author_title') || undefined,
    reviewed_by: formData.get('reviewed_by') || undefined,
    thumbnail_url: formData.get('thumbnail_url') || undefined,
    is_pro_only: formData.get('is_pro_only') === 'true' || formData.get('is_pro_only') === 'on',
    is_published: formData.get('is_published') === 'true' || formData.get('is_published') === 'on',
  };

  const parsed = contentSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  await db.insert(menoa_expert_contents).values({
    title: data.title,
    body: data.body,
    category: data.category,
    author_name: data.author_name,
    author_title: data.author_title ?? null,
    reviewed_by: data.reviewed_by ?? null,
    thumbnail_url: data.thumbnail_url || null,
    is_pro_only: data.is_pro_only,
    is_published: data.is_published,
  });

  revalidatePath('/admin/content');
  revalidatePath('/content');
  redirect('/admin/content');
}

// ─── 수정 ─────────────────────────────────────────
export async function updateExpertContent(
  id: string,
  _prev: ContentFormState,
  formData: FormData,
): Promise<ContentFormState> {
  await requireAdmin();

  const raw = {
    title: formData.get('title'),
    body: formData.get('body'),
    category: formData.get('category'),
    author_name: formData.get('author_name'),
    author_title: formData.get('author_title') || undefined,
    reviewed_by: formData.get('reviewed_by') || undefined,
    thumbnail_url: formData.get('thumbnail_url') || undefined,
    is_pro_only: formData.get('is_pro_only') === 'true' || formData.get('is_pro_only') === 'on',
    is_published: formData.get('is_published') === 'true' || formData.get('is_published') === 'on',
  };

  const parsed = contentSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  await db
    .update(menoa_expert_contents)
    .set({
      title: data.title,
      body: data.body,
      category: data.category,
      author_name: data.author_name,
      author_title: data.author_title ?? null,
      reviewed_by: data.reviewed_by ?? null,
      thumbnail_url: data.thumbnail_url || null,
      is_pro_only: data.is_pro_only,
      is_published: data.is_published,
      updated_at: new Date(),
    })
    .where(eq(menoa_expert_contents.id, id));

  revalidatePath('/admin/content');
  revalidatePath('/content');
  redirect('/admin/content');
}

// ─── 소프트 삭제 ──────────────────────────────────
export async function deleteExpertContent(id: string): Promise<void> {
  await requireAdmin();

  await db
    .update(menoa_expert_contents)
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where(eq(menoa_expert_contents.id, id));

  revalidatePath('/admin/content');
  revalidatePath('/content');
}

// ─── 발행/비발행 토글 ─────────────────────────────
export async function publishExpertContent(id: string, published: boolean): Promise<void> {
  await requireAdmin();

  await db
    .update(menoa_expert_contents)
    .set({ is_published: published, updated_at: new Date() })
    .where(eq(menoa_expert_contents.id, id));

  revalidatePath('/admin/content');
  revalidatePath('/content');
}
