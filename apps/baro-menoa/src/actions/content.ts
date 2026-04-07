'use server';

import { db } from '@/db';
import {
  menoa_expert_contents,
  menoa_content_bookmarks,
  menoa_users,
} from '@/db/schema';
import { createClient } from '@/lib/supabase/server';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { isProPlan } from '@/lib/plan';

const contentIdSchema = z.object({
  id: z.string().uuid('유효하지 않은 콘텐츠 ID입니다.'),
});

export type ContentListItem = {
  id: string;
  title: string;
  category: string;
  author_name: string;
  author_title: string | null;
  is_pro_only: boolean;
  thumbnail_url: string | null;
  created_at: Date;
  is_bookmarked: boolean;
};

export type ContentDetail = ContentListItem & {
  body: string;
  reviewed_by: string | null;
};

export async function getExpertContents(): Promise<{
  plan: 'free' | 'pro';
  contents: ContentListItem[];
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db
    .select({ id: menoa_users.id, plan: menoa_users.plan, pro_expires_at: menoa_users.pro_expires_at })
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);

  if (!dbUser) redirect('/login');

  const plan = isProPlan(dbUser.plan, dbUser.pro_expires_at) ? 'pro' : 'free' as 'free' | 'pro';

  // 발행된 콘텐츠 조회
  const rows = await db
    .select({
      id: menoa_expert_contents.id,
      title: menoa_expert_contents.title,
      category: menoa_expert_contents.category,
      author_name: menoa_expert_contents.author_name,
      author_title: menoa_expert_contents.author_title,
      is_pro_only: menoa_expert_contents.is_pro_only,
      thumbnail_url: menoa_expert_contents.thumbnail_url,
      created_at: menoa_expert_contents.created_at,
    })
    .from(menoa_expert_contents)
    .where(
      and(
        eq(menoa_expert_contents.is_published, true),
        isNull(menoa_expert_contents.deleted_at),
      ),
    )
    .orderBy(desc(menoa_expert_contents.created_at));

  // 북마크 목록 조회
  const bookmarks = await db
    .select({ content_id: menoa_content_bookmarks.content_id })
    .from(menoa_content_bookmarks)
    .where(eq(menoa_content_bookmarks.author_supabase_id, user.id));

  const bookmarkedIds = new Set(bookmarks.map((b) => b.content_id));

  const contents: ContentListItem[] = rows.map((r) => ({
    ...r,
    is_bookmarked: bookmarkedIds.has(r.id),
  }));

  return { plan, contents };
}

export async function getExpertContent(id: string): Promise<ContentDetail | { error: string } | null> {
  const parsed = contentIdSchema.safeParse({ id });
  if (!parsed.success) return { error: '입력값이 올바르지 않습니다.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [row] = await db
    .select()
    .from(menoa_expert_contents)
    .where(
      and(
        eq(menoa_expert_contents.id, id),
        eq(menoa_expert_contents.is_published, true),
        isNull(menoa_expert_contents.deleted_at),
      ),
    )
    .limit(1);

  if (!row) return null;

  const [bookmark] = await db
    .select()
    .from(menoa_content_bookmarks)
    .where(
      and(
        eq(menoa_content_bookmarks.author_supabase_id, user.id),
        eq(menoa_content_bookmarks.content_id, id),
      ),
    )
    .limit(1);

  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    author_name: row.author_name,
    author_title: row.author_title,
    reviewed_by: row.reviewed_by,
    is_pro_only: row.is_pro_only,
    thumbnail_url: row.thumbnail_url,
    created_at: row.created_at,
    is_bookmarked: !!bookmark,
  };
}

export async function toggleBookmark(contentId: string): Promise<{ error: string } | void> {
  const parsed = contentIdSchema.safeParse({ id: contentId });
  if (!parsed.success) return { error: '입력값이 올바르지 않습니다.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [dbUser] = await db
    .select({ id: menoa_users.id })
    .from(menoa_users)
    .where(eq(menoa_users.supabase_id, user.id))
    .limit(1);
  if (!dbUser) return;

  const [existing] = await db
    .select({ id: menoa_content_bookmarks.id })
    .from(menoa_content_bookmarks)
    .where(
      and(
        eq(menoa_content_bookmarks.author_supabase_id, user.id),
        eq(menoa_content_bookmarks.content_id, contentId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .delete(menoa_content_bookmarks)
      .where(eq(menoa_content_bookmarks.id, existing.id));
  } else {
    await db.insert(menoa_content_bookmarks).values({
      author_id: dbUser.id,
      author_supabase_id: user.id,
      content_id: contentId,
    });
  }

  revalidatePath('/content');
}
