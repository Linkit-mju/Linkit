import {useState} from 'react';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {AppShell} from '@astryxdesign/core/AppShell';
import {useToast} from '@astryxdesign/core/Toast';
import {CategoryDialog} from './CategoryDialog';
import {HandoverDocument} from './HandoverDocument';
import {HandoverDialog} from './HandoverDialogs';
import {HandoverSideNav} from './HandoverSideNav';
import {TemplateDialog} from './TemplateDialog';
import {
  type Category,
  type CategoryId,
  type Handover,
  type HandoverDraft,
  type HandoverId,
  type HandoverTemplate,
  HANDOVER_TEMPLATES,
  INITIAL_CATEGORIES,
  INITIAL_HANDOVERS,
} from './model';

type DeleteTarget =
  | {readonly kind: 'category'; readonly category: Category}
  | {readonly kind: 'handover'; readonly handover: Handover};

function categoryId(): CategoryId {
  return `category-${Date.now()}`;
}

function handoverId(): HandoverId {
  return `handover-${Date.now()}`;
}

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
  const [categories, setCategories] =
    useState<readonly Category[]>(INITIAL_CATEGORIES);
  const [handovers, setHandovers] =
    useState<readonly Handover[]>(INITIAL_HANDOVERS);
  const [selectedId, setSelectedId] = useState<HandoverId | undefined>(
    INITIAL_HANDOVERS[0]?.id,
  );
  const [completedChecklistItems, setCompletedChecklistItems] = useState<
    Partial<Record<HandoverId, string[]>>
  >({});
  const [search, setSearch] = useState('');
  const [isHandoverDialogOpen, setHandoverDialogOpen] = useState(false);
  const [editingHandover, setEditingHandover] = useState<Handover>();
  const [selectedTemplate, setSelectedTemplate] = useState<HandoverTemplate>();
  const [isTemplateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category>();
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>();

  const selectedHandover = handovers.find(
    (handover) => handover.id === selectedId,
  );
  const selectedCategory = categories.find(
    (category) => category.id === selectedHandover?.categoryId,
  );
  const alertCopy = deleteCopy(deleteTarget, handovers);

  function openNewHandover() {
    if (HANDOVER_TEMPLATES.length > 1) return setTemplateDialogOpen(true);

    selectTemplate(HANDOVER_TEMPLATES[0]);
  }

  function selectTemplate(template: HandoverTemplate) {
    setTemplateDialogOpen(false); setEditingHandover(undefined); setSelectedTemplate(template);
    setHandoverDialogOpen(true);
  }

  function saveHandover(draft: HandoverDraft) {
    if (editingHandover) {
      setHandovers((current) =>
        current.map((handover) =>
          handover.id === editingHandover.id
            ? {...handover, ...draft, updatedAt: '방금 전'}
            : handover,
        ),
      );
    } else {
      const id = handoverId();
      setHandovers((current) => [
        {id, ...draft, updatedAt: '방금 전'},
        ...current,
      ]);
      setSelectedId(id);
    }
    setHandoverDialogOpen(false);
    toast({
      body: editingHandover ? '인수인계를 수정했어요.' : '인수인계를 추가했어요.',
      uniqueID: 'handover-save',
    });
  }

  function saveCategory(name: string) {
    if (editingCategory) {
      setCategories((current) =>
        current.map((category) =>
          category.id === editingCategory.id ? {...category, name} : category,
        ),
      );
    } else {
      setCategories((current) => [...current, {id: categoryId(), name}]);
    }
    setCategoryDialogOpen(false);
    toast({
      body: editingCategory ? '카테고리를 수정했어요.' : '카테고리를 추가했어요.',
      uniqueID: 'category-save',
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;

    switch (deleteTarget.kind) {
      case 'handover': {
        const remaining = handovers.filter(
          (handover) => handover.id !== deleteTarget.handover.id,
        );
        setHandovers(remaining);
        if (selectedId === deleteTarget.handover.id) {
          setSelectedId(remaining[0]?.id);
        }
        toast({body: '인수인계를 삭제했어요.', uniqueID: 'handover-delete'});
        break;
      }
      case 'category': {
        const remaining = handovers.filter(
          (handover) => handover.categoryId !== deleteTarget.category.id,
        );
        setCategories((current) =>
          current.filter((category) => category.id !== deleteTarget.category.id),
        );
        setHandovers(remaining);
        if (selectedHandover?.categoryId === deleteTarget.category.id) {
          setSelectedId(remaining[0]?.id);
        }
        toast({body: '카테고리를 삭제했어요.', uniqueID: 'category-delete'});
        break;
      }
      default:
        assertNever(deleteTarget);
    }
    setDeleteTarget(undefined);
  }

  return (
    <>
      <AppShell
        contentPadding={0}
        height="fill"
        variant="elevated"
        sideNav={
          <HandoverSideNav
            categories={categories}
            handovers={handovers}
            search={search}
            selectedId={selectedId}
            onSearchChange={setSearch}
            onSelect={setSelectedId}
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
        <HandoverDocument
          handover={selectedHandover}
          categoryName={selectedCategory?.name}
          onCreate={openNewHandover}
          checklistValue={
            selectedHandover ? completedChecklistItems[selectedHandover.id] ?? [] : []
          }
          onChecklistChange={(value) => {
            if (!selectedHandover) return;

            setCompletedChecklistItems((current) => ({
              ...current,
              [selectedHandover.id]: value,
            }));
          }}
          onEdit={() => {
            if (selectedHandover) {
              setEditingHandover(selectedHandover);
              setHandoverDialogOpen(true);
            }
          }}
          onDelete={() => {
            if (selectedHandover) {
              setDeleteTarget({kind: 'handover', handover: selectedHandover});
            }
          }}
        />
      </AppShell>

      {isHandoverDialogOpen ? (
        <HandoverDialog
          categories={categories}
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
