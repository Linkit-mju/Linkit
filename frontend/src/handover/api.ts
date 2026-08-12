import {z} from 'zod';
import {requestJson, requestVoid} from '../api';
import {
  CategorySchema,
  HandoverSchema,
  type Category,
  type CategoryId,
  type Handover,
  type HandoverDraft,
  type HandoverId,
} from './model';

const CategoryListSchema = z.object({items: z.array(CategorySchema)});
const HandoverListSchema = z.object({items: z.array(HandoverSchema)});

export type HandoverWorkspace = {
  readonly categories: readonly Category[];
  readonly handovers: readonly Handover[];
};

export async function getHandoverWorkspace(): Promise<HandoverWorkspace> {
  const [categories, handovers] = await Promise.all([
    requestJson('/api/v1/handover-categories', CategoryListSchema),
    requestJson('/api/v1/handovers', HandoverListSchema),
  ]);
  return {categories: categories.items, handovers: handovers.items};
}

export function createCategory(name: string): Promise<Category> {
  return requestJson('/api/v1/handover-categories', CategorySchema, {
    method: 'POST',
    json: {name},
  });
}

export function updateCategory(category: Category, name: string): Promise<Category> {
  return requestJson(
    `/api/v1/handover-categories/${category.id}`,
    CategorySchema,
    {method: 'PATCH', json: {name}},
  );
}

export function deleteCategory(categoryId: CategoryId): Promise<void> {
  return requestVoid(`/api/v1/handover-categories/${categoryId}`, {
    method: 'DELETE',
  });
}

export function createHandover(draft: HandoverDraft): Promise<Handover> {
  return requestJson('/api/v1/handovers', HandoverSchema, {
    method: 'POST',
    json: draft,
  });
}

export function updateHandover(
  handoverId: HandoverId,
  draft: HandoverDraft,
): Promise<Handover> {
  return requestJson(`/api/v1/handovers/${handoverId}`, HandoverSchema, {
    method: 'PUT',
    json: draft,
  });
}

export function deleteHandover(handoverId: HandoverId): Promise<void> {
  return requestVoid(`/api/v1/handovers/${handoverId}`, {method: 'DELETE'});
}
