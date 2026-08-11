import type {IconName} from '@astryxdesign/core/Icon';
import {z} from 'zod';

export const CategoryIdSchema = z.string().uuid().brand<'CategoryId'>();
export const HandoverIdSchema = z.string().uuid().brand<'HandoverId'>();
export const HandoverStatusSchema = z.enum(['draft', 'review', 'complete']);

export const CategorySchema = z.object({
  id: CategoryIdSchema,
  name: z.string(),
});

export const HandoverSchema = z.object({
  id: HandoverIdSchema,
  categoryId: CategoryIdSchema,
  title: z.string(),
  owner: z.string(),
  status: HandoverStatusSchema,
  summary: z.string(),
  criticalNotes: z.array(z.string()),
  recurringTasks: z.array(z.string()),
  checklist: z.array(z.string()),
  references: z.array(z.string()),
  openQuestions: z.array(z.string()),
  updatedAt: z.string().datetime({offset: true}),
});

export type CategoryId = z.infer<typeof CategoryIdSchema>;
export type HandoverId = z.infer<typeof HandoverIdSchema>;
export type HandoverStatus = z.infer<typeof HandoverStatusSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Handover = z.infer<typeof HandoverSchema>;

export type HandoverDraft = Omit<Handover, 'id' | 'updatedAt'>;

export type HandoverTemplate = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly draft: Omit<HandoverDraft, 'categoryId'>;
};

export const STATUS_OPTIONS = [
  {value: 'draft', label: '작성 중'},
  {value: 'review', label: '확인 필요'},
  {value: 'complete', label: '전달 완료'},
] satisfies readonly {readonly value: HandoverStatus; readonly label: string}[];

const CATEGORY_ICON_RULES = [
  {keywords: ['행사', '기획', '축제', 'OT'], icon: 'calendar'},
  {keywords: ['회계', '예산', '재정', '정산'], icon: 'viewColumns'},
  {keywords: ['홍보', '디자인', '콘텐츠', 'SNS'], icon: 'microphone'},
] satisfies readonly {readonly keywords: readonly string[]; readonly icon: IconName}[];

const UPDATED_AT_FORMAT = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function categoryIcon(name: string): IconName {
  const normalizedName = name.toLocaleLowerCase('ko-KR');

  return (
    CATEGORY_ICON_RULES.find(({keywords}) =>
      keywords.some((keyword) => normalizedName.includes(keyword.toLocaleLowerCase('ko-KR'))),
    )?.icon ?? 'viewColumns'
  );
}

export const HANDOVER_TEMPLATES: readonly HandoverTemplate[] = [
  {
    id: 'template-basic',
    name: '기본 인수인계',
    description: '업무 요약, 핵심 주의 사항, 반복 업무를 차례로 정리합니다.',
    draft: {
      title: '',
      owner: '',
      status: 'draft',
      summary: '',
      criticalNotes: [],
      recurringTasks: [],
      checklist: [],
      references: [],
      openQuestions: [],
    },
  },
];

export function formatUpdatedAt(value: string): string {
  return UPDATED_AT_FORMAT.format(new Date(value));
}

export function statusLabel(status: HandoverStatus): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function linesToText(lines: readonly string[]): string {
  return lines.join('\n');
}

export function textToLines(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
