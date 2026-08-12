import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  VStack,
} from '@astryxdesign/core/Layout';
import {Selector} from '@astryxdesign/core/Selector';
import {Text} from '@astryxdesign/core/Text';
import type {HandoverTemplate} from './model';

export function TemplateDialog({
  isOpen,
  onClose,
  onSelect,
  templates,
}: {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSelect: (template: HandoverTemplate) => void;
  readonly templates: readonly HandoverTemplate[];
}) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '');
  const selectedTemplate = templates.find((template) => template.id === templateId);

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
            title="템플릿 선택"
            subtitle="새 인수인계에 맞는 시작 형식을 고르세요."
            onOpenChange={() => onClose()}
          />
        }
        content={
          <LayoutContent>
            <VStack gap={3}>
              <Selector
                label="템플릿"
                options={templates.map((template) => ({
                  value: template.id,
                  label: template.name,
                }))}
                value={templateId}
                onChange={setTemplateId}
              />
              {selectedTemplate ? (
                <Text type="supporting" color="secondary">
                  {selectedTemplate.description}
                </Text>
              ) : null}
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <HStack gap={2} hAlign="end">
              <Button label="취소" variant="secondary" onClick={onClose} />
              <Button
                label="템플릿으로 시작"
                variant="primary"
                isDisabled={!selectedTemplate}
                onClick={() => {
                  if (selectedTemplate) onSelect(selectedTemplate);
                }}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}
