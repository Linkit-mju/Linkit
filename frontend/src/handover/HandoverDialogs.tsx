import {type FormEvent, useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  VStack,
} from '@astryxdesign/core/Layout';
import {Selector} from '@astryxdesign/core/Selector';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  type Category,
  type CategoryId,
  type Handover,
  type HandoverDraft,
  type HandoverStatus,
  type HandoverTemplate,
  linesToText,
  STATUS_OPTIONS,
  textToLines,
} from './model';

const HANDOVER_FORM_ID = 'handover-editor-form';

type EditorFields = {
  readonly categoryId: CategoryId | '';
  readonly title: string;
  readonly owner: string;
  readonly status: HandoverStatus;
  readonly summary: string;
  readonly criticalNotes: string;
  readonly recurringTasks: string;
  readonly checklist: string;
  readonly references: string;
  readonly openQuestions: string;
};

function fieldsFrom(
  handover: Handover | undefined,
  template: HandoverTemplate | undefined,
  categories: readonly Category[],
): EditorFields {
  const source = handover ?? template?.draft;

  return {
    categoryId: handover?.categoryId ?? categories[0]?.id ?? '',
    title: source?.title ?? '',
    owner: source?.owner ?? '',
    status: source?.status ?? 'draft',
    summary: source?.summary ?? '',
    criticalNotes: linesToText(source?.criticalNotes ?? []),
    recurringTasks: linesToText(source?.recurringTasks ?? []),
    checklist: linesToText(source?.checklist ?? []),
    references: linesToText(source?.references ?? []),
    openQuestions: linesToText(source?.openQuestions ?? []),
  };
}

function isHandoverStatus(value: string): value is HandoverStatus {
  return value === 'draft' || value === 'review' || value === 'complete';
}

export function HandoverDialog({
  categories,
  handover,
  isOpen,
  onClose,
  onSave,
  template,
}: {
  readonly categories: readonly Category[];
  readonly handover: Handover | undefined;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: (draft: HandoverDraft) => void;
  readonly template: HandoverTemplate | undefined;
}) {
  const [fields, setFields] = useState<EditorFields>(() =>
    fieldsFrom(handover, template, categories),
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);
    if (!fields.title.trim() || fields.categoryId === '') {
      return;
    }

    onSave({
      categoryId: fields.categoryId,
      title: fields.title.trim(),
      owner: fields.owner.trim() || '담당자 미정',
      status: fields.status,
      summary: fields.summary.trim(),
      criticalNotes: textToLines(fields.criticalNotes),
      recurringTasks: textToLines(fields.recurringTasks),
      checklist: textToLines(fields.checklist),
      references: textToLines(fields.references),
      openQuestions: textToLines(fields.openQuestions),
    });
  }

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      purpose="form"
      width={720}
      maxHeight="88dvh">
      <Layout
        header={
          <DialogHeader
            title={handover ? '인수인계 수정' : '인수인계 추가'}
            subtitle="한 줄에 하나씩 입력하면 읽기 좋은 목록으로 정리됩니다."
            onOpenChange={() => onClose()}
          />
        }
        content={
          <LayoutContent>
            <form id={HANDOVER_FORM_ID} onSubmit={submit} noValidate>
              <VStack gap={5}>
                <FormLayout>
                  <TextInput
                    label="제목"
                    value={fields.title}
                    onChange={(title) => setFields({...fields, title})}
                    placeholder="예: 대동제 운영 인수인계"
                    isRequired
                    status={
                      hasSubmitted && !fields.title.trim()
                        ? {type: 'error', message: '제목을 입력해주세요.'}
                        : undefined
                    }
                  />
                  <Selector
                    label="카테고리"
                    options={categories.map((category) => ({
                      value: category.id,
                      label: category.name,
                    }))}
                    value={fields.categoryId}
                    onChange={(categoryId) => {
                      const match = categories.find(
                        (category) => category.id === categoryId,
                      );
                      if (match) setFields({...fields, categoryId: match.id});
                    }}
                    placeholder="카테고리 선택"
                    isRequired
                    status={
                      hasSubmitted && fields.categoryId === ''
                        ? {type: 'error', message: '카테고리를 선택해주세요.'}
                        : undefined
                    }
                  />
                  <TextInput
                    label="담당자"
                    value={fields.owner}
                    onChange={(owner) => setFields({...fields, owner})}
                    placeholder="예: 기획국 김민지"
                  />
                  <Selector
                    label="상태"
                    options={[...STATUS_OPTIONS]}
                    value={fields.status}
                    onChange={(status) => {
                      if (isHandoverStatus(status)) {
                        setFields({...fields, status});
                      }
                    }}
                  />
                </FormLayout>
                <TextArea
                  label="업무 요약"
                  value={fields.summary}
                  onChange={(summary) => setFields({...fields, summary})}
                  placeholder="후임자가 이 문서를 언제, 왜 봐야 하는지 설명해주세요."
                  rows={4}
                />
                <TextArea
                  label="반드시 알아야 할 점"
                  value={fields.criticalNotes}
                  onChange={(criticalNotes) =>
                    setFields({...fields, criticalNotes})
                  }
                  placeholder="놓치면 문제가 되는 일정, 승인, 주의 사항"
                  rows={4}
                />
                <TextArea
                  label="반복 업무와 일정"
                  value={fields.recurringTasks}
                  onChange={(recurringTasks) =>
                    setFields({...fields, recurringTasks})
                  }
                  placeholder="예: 매월 5일 전월 증빙 마감"
                  rows={4}
                />
                <TextArea
                  label="체크리스트"
                  value={fields.checklist}
                  onChange={(checklist) => setFields({...fields, checklist})}
                  placeholder="완료 여부를 확인해야 할 항목"
                  rows={4}
                />
                <TextArea
                  label="연락처와 참고 자료"
                  value={fields.references}
                  onChange={(references) => setFields({...fields, references})}
                  placeholder="담당 부서, 문서명, 드라이브 경로, 외부 링크"
                  rows={4}
                />
                <TextArea
                  label="미해결 질문"
                  value={fields.openQuestions}
                  onChange={(openQuestions) =>
                    setFields({...fields, openQuestions})
                  }
                  placeholder="후임자가 이어서 결정하거나 확인해야 할 내용"
                  rows={4}
                />
              </VStack>
            </form>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <HStack gap={2} hAlign="end">
              <Button label="취소" variant="secondary" onClick={onClose} />
              <Button
                label={handover ? '변경 저장' : '인수인계 추가'}
                variant="primary"
                type="submit"
                form={HANDOVER_FORM_ID}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
