import type {IconName} from '@astryxdesign/core/Icon';

export type CategoryId = `category-${number}`;
export type HandoverId = `handover-${number}`;
export type HandoverStatus = 'draft' | 'review' | 'complete';

export type Category = {
  readonly id: CategoryId;
  readonly name: string;
};

export type Handover = {
  readonly id: HandoverId;
  readonly categoryId: CategoryId;
  readonly title: string;
  readonly owner: string;
  readonly status: HandoverStatus;
  readonly summary: string;
  readonly criticalNotes: readonly string[];
  readonly recurringTasks: readonly string[];
  readonly checklist: readonly string[];
  readonly references: readonly string[];
  readonly openQuestions: readonly string[];
  readonly updatedAt: string;
};

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

export function categoryIcon(name: string): IconName {
  const normalizedName = name.toLocaleLowerCase('ko-KR');

  return (
    CATEGORY_ICON_RULES.find(({keywords}) =>
      keywords.some((keyword) => normalizedName.includes(keyword.toLocaleLowerCase('ko-KR'))),
    )?.icon ?? 'viewColumns'
  );
}

export const INITIAL_CATEGORIES: readonly Category[] = [
  {id: 'category-1', name: '행사 및 기획'},
  {id: 'category-2', name: '회계 및 예산'},
  {id: 'category-3', name: '홍보 및 디자인'},
];

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

export const INITIAL_HANDOVERS: readonly Handover[] = [
  {
    id: 'handover-1',
    categoryId: 'category-1',
    title: '대동제 운영 인수인계',
    owner: '기획국 김민지',
    status: 'review',
    summary:
      '대동제 준비부터 당일 운영까지 필요한 일정, 교내 협의 창구, 업체 계약 순서를 정리한 문서입니다.',
    criticalNotes: [
      '운동장 사용 신청은 행사 8주 전까지 학생지원팀에 제출합니다.',
      '무대 업체 견적에는 전기 증설과 안전 펜스 비용이 빠지기 쉬우므로 별도 확인합니다.',
    ],
    recurringTasks: [
      'D-60: 장소와 예산 확정',
      'D-30: 출연진·부스·안전 계획 확정',
      'D-7: 운영 인력 브리핑과 비상 연락망 배포',
    ],
    checklist: [
      '학생지원팀 대관 공문 제출',
      '행사 보험 가입',
      '업체 계약서와 통장 사본 보관',
    ],
    references: [
      '2026 대동제 최종 예산안',
      '운동장 대관 담당: 학생지원팀 내선 2814',
    ],
    openQuestions: ['우천 시 실내 대체 장소는 차기 집행부에서 확정해야 합니다.'],
    updatedAt: '오늘 오전 10:24',
  },
  {
    id: 'handover-2',
    categoryId: 'category-1',
    title: '신입생 OT 준비',
    owner: '기획국 박서준',
    status: 'draft',
    summary: '신입생 OT 장소 예약과 프로그램 구성에 필요한 기본 절차입니다.',
    criticalNotes: ['학과별 예상 인원은 학생회장단을 통해 한 번 더 확인합니다.'],
    recurringTasks: ['행사 6주 전 장소 후보 확정', '행사 2주 전 안전 교육'],
    checklist: ['참가 신청 폼 생성', '진행자 섭외'],
    references: ['2026 OT 참가자 명단'],
    openQuestions: ['올해 외부 강연자 섭외 여부 미정'],
    updatedAt: '어제 오후 4:12',
  },
  {
    id: 'handover-3',
    categoryId: 'category-2',
    title: '월별 예산 집행 및 정산',
    owner: '재정국 이서연',
    status: 'complete',
    summary: '월별 증빙 취합, 지출 결의, 잔액 확인 순서를 설명합니다.',
    criticalNotes: ['모든 카드 영수증은 사용일 기준 3일 이내에 스캔합니다.'],
    recurringTasks: ['매월 5일 전월 증빙 마감', '매월 10일 정산 보고'],
    checklist: ['통장 잔액 대조', '미제출 영수증 확인', '정산 파일 백업'],
    references: ['공용 드라이브 / 재정국 / 2026 정산'],
    openQuestions: [],
    updatedAt: '7월 29일',
  },
  {
    id: 'handover-4',
    categoryId: 'category-3',
    title: 'SNS 콘텐츠 발행 규칙',
    owner: '홍보국 최유진',
    status: 'review',
    summary: '인스타그램과 에브리타임 공지의 검수 및 발행 기준입니다.',
    criticalNotes: ['개인정보가 포함된 이미지는 업로드 전에 반드시 모자이크 처리합니다.'],
    recurringTasks: ['월요일 주간 콘텐츠 캘린더 확인', '행사 D-3 최종 리마인드 발행'],
    checklist: ['맞춤법 검수', '링크 동작 확인', '대체 텍스트 작성'],
    references: ['Canva 학생회 공용 템플릿'],
    openQuestions: ['에브리타임 공지 담당 계정 권한 이전 필요'],
    updatedAt: '7월 28일',
  },
];

export function statusLabel(status: HandoverStatus): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function linesToText(lines: readonly string[]): string {
  return lines.join('\n');
}

export function textToLines(value: string): readonly string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}
