import {useEffect, useState} from 'react';
import {ApiError} from '../api';
import {
  createCategory,
  createHandover,
  deleteCategory,
  deleteHandover,
  getHandoverWorkspace,
  updateCategory,
  updateHandover,
} from './api';
import type {
  Category,
  Handover,
  HandoverDraft,
  HandoverId,
} from './model';

export function useHandoverWorkspace() {
  const [categories, setCategories] = useState<readonly Category[]>([]);
  const [handovers, setHandovers] = useState<readonly Handover[]>([]);
  const [selectedId, setSelectedId] = useState<HandoverId>();
  const [isLoading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [completedChecklistItems, setCompletedChecklistItems] = useState<
    Partial<Record<HandoverId, string[]>>
  >({});

  useEffect(() => {
    let isActive = true;
    getHandoverWorkspace()
      .then((workspace) => {
        if (!isActive) return;
        setCategories(workspace.categories);
        setHandovers(workspace.handovers);
        setSelectedId(workspace.handovers[0]?.id);
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        if (error instanceof ApiError && error.status === 401) {
          window.location.replace('/login');
          return;
        }
        if (error instanceof Error) {
          setLoadError(error.message);
          return;
        }
        throw error;
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  async function saveCategory(
    current: Category | undefined,
    name: string,
  ): Promise<void> {
    const saved = current
      ? await updateCategory(current, name)
      : await createCategory(name);
    setCategories((items) =>
      current
        ? items.map((category) => (category.id === saved.id ? saved : category))
        : [...items, saved],
    );
  }

  async function saveHandover(
    current: Handover | undefined,
    draft: HandoverDraft,
  ): Promise<void> {
    const saved = current
      ? await updateHandover(current.id, draft)
      : await createHandover(draft);
    setHandovers((items) =>
      current
        ? items.map((handover) => (handover.id === saved.id ? saved : handover))
        : [saved, ...items],
    );
    setSelectedId(saved.id);
  }

  async function removeCategory(category: Category): Promise<void> {
    await deleteCategory(category.id);
    const remaining = handovers.filter(
      (handover) => handover.categoryId !== category.id,
    );
    setCategories((items) => items.filter((item) => item.id !== category.id));
    setHandovers(remaining);
    setSelectedId((current) =>
      remaining.some((handover) => handover.id === current)
        ? current
        : remaining[0]?.id,
    );
  }

  async function removeHandover(handover: Handover): Promise<void> {
    await deleteHandover(handover.id);
    const remaining = handovers.filter((item) => item.id !== handover.id);
    setHandovers(remaining);
    setSelectedId((current) =>
      current === handover.id ? remaining[0]?.id : current,
    );
  }

  function setChecklist(handoverId: HandoverId, value: string[]): void {
    setCompletedChecklistItems((current) => ({
      ...current,
      [handoverId]: value,
    }));
  }

  const selectedHandover = handovers.find(
    (handover) => handover.id === selectedId,
  );
  const selectedCategory = categories.find(
    (category) => category.id === selectedHandover?.categoryId,
  );

  return {
    categories,
    completedChecklistItems,
    handovers,
    isLoading,
    loadError,
    removeCategory,
    removeHandover,
    saveCategory,
    saveHandover,
    selectedCategory,
    selectedHandover,
    selectedId,
    setChecklist,
    setSelectedId,
  };
}
