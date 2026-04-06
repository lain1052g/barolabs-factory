import { z } from 'zod';

export const logSymptomSchema = z.object({
  symptom_id: z.string().uuid('유효하지 않은 증상 ID입니다.'),
  severity: z.coerce.number().int().min(1).max(5, '심각도는 1~5 사이여야 합니다.'),
  note: z.string().max(500, '노트는 500자 이하여야 합니다.').optional(),
  log_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다.')
    .optional(),
});

export type LogSymptomInput = z.infer<typeof logSymptomSchema>;
