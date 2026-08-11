import {useState} from 'react';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {AppShell} from '@astryxdesign/core/AppShell';
import {Center} from '@astryxdesign/core/Center';
import {Text} from '@astryxdesign/core/Text';
import {useToast} from '@astryxdesign/core/Toast';
import {CategoryDialog} from './CategoryDialog';
import {HandoverDocument} from './HandoverDocument';
import {HandoverDialog} from './HandoverDialogs';
import {HandoverSideNav} from './HandoverSideNav';
import {TemplateDialog} from './TemplateDialog';
import {
  type Category,
  type Handover,
  type HandoverDraft,
  type HandoverTemplate,
  HANDOVER_TEMPLATES,
} from './model';
import {useHandoverWorkspace} from './useHandoverWorkspace';

type DeleteTarget =
  | {readonly kind: 'category'; readonly category: Category}
  | {readonly kind: 'handover'; readonly handover: Handover};

function assertNever(value: never): never {
  throw new TypeError(`처리할 수 없는 삭제 대상: ${String(value)}`);
}

function deleteCopy(
  target: DeleteTarget | undefined,
  handovers: readonly Handover[],
): {readonly title: string; readonly description: string; readonly action: string} {
  if (!target) {
    return {title: '', description: '', action: '삭제'};
  }

  switch (target.kind) {
    case 'handover':
      return {
        title: '인수인계를 삭제할까요?',
        description: `“${target.handover.title}” 문서가 삭제됩니다. 이 동작은 되돌릴 수 없습니다.`,
        action: '인수인계 삭제',
      };
    case 'category': {
      const count = handovers.filter(
        (handover) => handover.categoryId === target.category.id,
      ).length;
      return {
        title: '카테고리를 삭제할까요?',
        description: `“${target.category.name}” 카테고리와 포함된 인수인계 ${count}개가 함께 삭제됩니다.`,
        action: '카테고리 삭제',
      };
    }
    default:
      return assertNever(target);
  }
}

export function HandoverPage() {
  const toast = useToast();
  const workspace = useHandoverWorkspace();
  const [search, setSearch] = useState('');
  const [isHandoverDialogOpen, setHandoverDialogOpen] = useState(false);
  const [editingHandover, setEditingHandover] = useState<Handover>();
  const [selectedTemplate, setSelectedTemplate] = useState<HandoverTemplate>();
  const [isTemplateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category>();
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>();

  const alertCopy = deleteCopy(deleteTarget, workspace.handovers);

  function openNewHandover() {
    if (HANDOVER_TEMPLATES.length > 1) return setTemplateDialogOpen(true);

    selectTemplate(HANDOVER_TEMPLATES[0]);
  }

  function selectTemplate(template: HandoverTemplate): void {
    setTemplateDialogOpen(false);
    setEditingHandover(undefined);
    setSelectedTemplate(template);
    setHandoverDialogOpen(true);
  }

  async function saveHandover(draft: HandoverDraft): Promise<void> {
    try {
      await workspace.saveHandover(editingHandover, draft);
      setHandoverDialogOpen(false);
      toast({
        body: editingHandover
          ? '인수인계를 수정했어요.'
          : '인수인계를 추가했어요.',
        uniqueID: 'handover-save',
      });
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      toast({body: error.message, uniqueID: 'handover-save-error'});
    }
  }

  async function saveCategory(name: string): Promise<void> {
    try {
      await workspace.saveCategory(editingCategory, name);
      setCategoryDialogOpen(false);
      toast({
        body: editingCategory
          ? '카테고리를 수정했어요.'
          : '카테고리를 추가했어요.',
        uniqueID: 'category-save',
      });
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      toast({body: error.message, uniqueID: 'category-save-error'});
    }
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) return;

    try {
      switch (deleteTarget.kind) {
        case 'handover':
          await workspace.removeHandover(deleteTarget.handover);
          toast({body: '인수인계를 삭제했어요.', uniqueID: 'handover-delete'});
          break;
        case 'category':
          await workspace.removeCategory(deleteTarget.category);
          toast({body: '카테고리를 삭제했어요.', uniqueID: 'category-delete'});
          break;
        default:
          assertNever(deleteTarget);
        }
      setDeleteTarget(undefined);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      toast({body: error.message, uniqueID: 'delete-error'});
    }
  }

  return (
    <>
      <AppShell
        contentPadding={0}
        height="fill"
        variant="elevated"
        sideNav={
          <HandoverSideNav
            categories={workspace.categories}
            handovers={workspace.handovers}
            search={search}
            selectedId={workspace.selectedId}
            onSearchChange={setSearch}
            onSelect={workspace.setSelectedId}
            onCreateHandover={openNewHandover}
            onCreateCategory={() => {
              setEditingCategory(undefined);
              setCategoryDialogOpen(true);
            }}
            onEditCategory={(category) => {
              setEditingCategory(category);
              setCategoryDialogOpen(true);
            }}
            onDeleteCategory={(category) =>
              setDeleteTarget({kind: 'category', category})
            }
          />
        }>
        {workspace.isLoading || workspace.loadError ? (
          <Center axis="both">
            <Text type="body" color={workspace.loadError ? 'primary' : 'secondary'}>
              {workspace.loadError ?? '인수인계를 불러오는 중입니다.'}
            </Text>
          </Center>
        ) : (
          <HandoverDocument
            handover={workspace.selectedHandover}
            categoryName={workspace.selectedCategory?.name}
            onCreate={openNewHandover}
            checklistValue={
              workspace.selectedHandover
                ? workspace.completedChecklistItems[workspace.selectedHandover.id] ?? []
                : []
            }
            onChecklistChange={(value) => {
              if (workspace.selectedHandover) {
                workspace.setChecklist(workspace.selectedHandover.id, value);
              }
            }}
            onEdit={() => {
              if (workspace.selectedHandover) {
                setEditingHandover(workspace.selectedHandover);
                setHandoverDialogOpen(true);
              }
            }}
            onDelete={() => {
              if (workspace.selectedHandover) {
                setDeleteTarget({
                  kind: 'handover',
                  handover: workspace.selectedHandover,
                });
              }
            }}
          />
        )}
      </AppShell>

      {isHandoverDialogOpen ? (
        <HandoverDialog
          categories={workspace.categories}
          handover={editingHandover}
          isOpen
          onClose={() => setHandoverDialogOpen(false)}
          onSave={saveHandover}
          template={selectedTemplate}
        />
      ) : null}
      {isTemplateDialogOpen ? (
        <TemplateDialog
          isOpen
          templates={HANDOVER_TEMPLATES}
          onClose={() => setTemplateDialogOpen(false)}
          onSelect={selectTemplate}
        />
      ) : null}
      {isCategoryDialogOpen ? (
        <CategoryDialog
          category={editingCategory}
          isOpen
          onClose={() => setCategoryDialogOpen(false)}
          onSave={saveCategory}
        />
      ) : null}
      <AlertDialog
        isOpen={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(undefined);
        }}
        title={alertCopy.title}
        description={alertCopy.description}
        actionLabel={alertCopy.action}
        cancelLabel="취소"
        onAction={confirmDelete}
      />
    </>
  );
}
