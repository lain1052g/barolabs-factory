'use client';

import { useActionState, useRef, useState } from 'react';
import Image from 'next/image';
import type { ContentFormState } from '@/actions/admin-content';
import { uploadContentThumbnail } from '@/actions/upload';

const CATEGORY_OPTIONS = [
  { value: 'nutrition', label: '영양' },
  { value: 'exercise', label: '운동' },
  { value: 'mental', label: '정신 건강' },
  { value: 'medical', label: '의학' },
  { value: 'lifestyle', label: '생활습관' },
] as const;

type DefaultValues = {
  title?: string;
  body?: string;
  category?: string;
  author_name?: string;
  author_title?: string | null;
  reviewed_by?: string | null;
  thumbnail_url?: string | null;
  is_pro_only?: boolean;
  is_published?: boolean;
};

type ContentFormProps = {
  action: (prev: ContentFormState, formData: FormData) => Promise<ContentFormState>;
  defaultValues?: DefaultValues;
  submitLabel?: string;
};

export function ContentForm({ action, defaultValues = {}, submitLabel = '저장' }: ContentFormProps) {
  const [state, formAction, isPending] = useActionState<ContentFormState, FormData>(action, {});

  // 썸네일 상태
  const [previewUrl, setPreviewUrl] = useState<string>(defaultValues.thumbnail_url ?? '');
  const [uploadedUrl, setUploadedUrl] = useState<string>(defaultValues.thumbnail_url ?? '');
  const [uploadError, setUploadError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 로컬 미리보기
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploadError('');
    setUploadedUrl('');

    // 서버 업로드
    setIsUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const result = await uploadContentThumbnail(fd);
    setIsUploading(false);

    if ('error' in result) {
      setUploadError(result.error);
      setPreviewUrl(defaultValues.thumbnail_url ?? '');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setUploadedUrl(result.url);
    }
  };

  const handleRemoveThumbnail = () => {
    setPreviewUrl('');
    setUploadedUrl('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* 썸네일 이미지 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">썸네일 이미지</label>

        {/* 미리보기 */}
        {previewUrl && (
          <div className="relative mb-2 w-full max-w-xs rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <Image
              src={previewUrl}
              alt="썸네일 미리보기"
              width={320}
              height={180}
              className="w-full h-40 object-cover"
              unoptimized={previewUrl.startsWith('blob:')}
            />
            <button
              type="button"
              onClick={handleRemoveThumbnail}
              className="absolute top-2 right-2 rounded-full bg-black/60 text-white text-xs px-2 py-1 hover:bg-black/80 transition-colors"
            >
              삭제
            </button>
          </div>
        )}

        {/* 파일 input */}
        <input
          ref={fileInputRef}
          id="thumbnail_file"
          name="thumbnail_file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={isUploading}
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--c-brand)]/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[var(--c-brand)] hover:file:bg-[var(--c-brand)]/20 disabled:opacity-50 cursor-pointer"
        />
        <p className="mt-1 text-xs text-gray-400">JPEG, PNG, WebP / 최대 2MB</p>

        {isUploading && (
          <p className="mt-1 text-xs text-[var(--c-brand)]">업로드 중...</p>
        )}
        {uploadError && (
          <p className="mt-1 text-xs text-red-500">{uploadError}</p>
        )}

        {/* 업로드된 URL을 hidden input으로 전달 */}
        <input type="hidden" name="thumbnail_url" value={uploadedUrl} />
      </div>

      {/* 제목 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
          제목 <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={defaultValues.title ?? ''}
          maxLength={200}
          required
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)] focus:border-transparent"
          placeholder="콘텐츠 제목"
        />
        {state.fieldErrors?.title && (
          <p className="mt-1 text-xs text-red-500">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      {/* 카테고리 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
          카테고리 <span className="text-red-500">*</span>
        </label>
        <select
          id="category"
          name="category"
          defaultValue={defaultValues.category ?? ''}
          required
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)] focus:border-transparent bg-white"
        >
          <option value="" disabled>
            카테고리 선택
          </option>
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.category && (
          <p className="mt-1 text-xs text-red-500">{state.fieldErrors.category[0]}</p>
        )}
      </div>

      {/* 작성자명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="author_name">
          작성자명 <span className="text-red-500">*</span>
        </label>
        <input
          id="author_name"
          name="author_name"
          type="text"
          defaultValue={defaultValues.author_name ?? ''}
          required
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)] focus:border-transparent"
          placeholder="예: 김지현"
        />
        {state.fieldErrors?.author_name && (
          <p className="mt-1 text-xs text-red-500">{state.fieldErrors.author_name[0]}</p>
        )}
      </div>

      {/* 작성자 직함 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="author_title">
          작성자 직함
        </label>
        <input
          id="author_title"
          name="author_title"
          type="text"
          defaultValue={defaultValues.author_title ?? ''}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)] focus:border-transparent"
          placeholder="예: 산부인과 전문의"
        />
      </div>

      {/* 검토자 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reviewed_by">
          검토자
        </label>
        <input
          id="reviewed_by"
          name="reviewed_by"
          type="text"
          defaultValue={defaultValues.reviewed_by ?? ''}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)] focus:border-transparent"
          placeholder="예: 대한폐경학회 자문위원 박민준"
        />
      </div>

      {/* 본문 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="body">
          본문 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="body"
          name="body"
          defaultValue={defaultValues.body ?? ''}
          required
          rows={14}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--c-brand)] focus:border-transparent resize-y font-mono"
          placeholder="콘텐츠 본문을 입력하세요. 마크다운 형식을 사용할 수 있습니다."
        />
        {state.fieldErrors?.body && (
          <p className="mt-1 text-xs text-red-500">{state.fieldErrors.body[0]}</p>
        )}
      </div>

      {/* 옵션 */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">공개 설정</p>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            id="is_pro_only"
            name="is_pro_only"
            type="checkbox"
            value="on"
            defaultChecked={defaultValues.is_pro_only ?? false}
            className="w-4 h-4 rounded accent-[var(--c-brand)]"
          />
          <span className="text-sm text-gray-700">Pro 전용 콘텐츠</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            id="is_published"
            name="is_published"
            type="checkbox"
            value="on"
            defaultChecked={defaultValues.is_published ?? false}
            className="w-4 h-4 rounded accent-[var(--c-brand)]"
          />
          <span className="text-sm text-gray-700">즉시 발행</span>
        </label>
      </div>

      {/* 제출 */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending || isUploading}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
          style={{ backgroundColor: 'var(--c-brand)' }}
        >
          {isPending ? '저장 중...' : submitLabel}
        </button>
        <a
          href="/admin/content"
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          취소
        </a>
      </div>
    </form>
  );
}
