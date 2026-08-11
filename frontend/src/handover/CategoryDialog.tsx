import {type FormEvent, useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
} from '@astryxdesign/core/Layout';
import {TextInput} from '@astryxdesign/core/TextInput';
import type {Category} from './model';

const FORM_ID = 'category-editor-form';

export function CategoryDialog({
  category,
  isOpen,
  isSaving,
  onClose,
  onSave,
}: {
  readonly category: Category | undefined;
  readonly isOpen: boolean;
  readonly isSaving: boolean;
  readonly onClose: () => void;
  readonly onSave: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(category?.name ?? '');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);
    if (name.trim()) onSave(name.trim());
  }

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      purpose="form"
      width={440}>
      <Layout
        header={
          <DialogHeader
            title={category ? '카테고리 수정' : '카테고리 추가'}
            onOpenChange={() => onClose()}
          />
        }
        content={
          <LayoutContent>
            <form id={FORM_ID} onSubmit={submit} noValidate>
              <TextInput
                label="카테고리 이름"
                value={name}
                onChange={setName}
                placeholder="예: 행사 및 기획"
                isRequired
                status={
                  hasSubmitted && !name.trim()
                    ? {type: 'error', message: '이름을 입력해주세요.'}
                    : undefined
                }
              />
            </form>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <HStack gap={2} hAlign="end">
              <Button label="취소" variant="secondary" onClick={onClose} />
              <Button
                label={category ? '변경 저장' : '카테고리 추가'}
                variant="primary"
                type="submit"
                form={FORM_ID}
                isDisabled={isSaving}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
