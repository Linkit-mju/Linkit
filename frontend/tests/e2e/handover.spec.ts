import {expect, test, type BrowserContext} from '@playwright/test';
import {CategorySchema} from '../../src/handover/model';

type CsrfToken = {
  readonly headerName: string;
  readonly token: string;
};

function isCsrfToken(value: unknown): value is CsrfToken {
  return (
    typeof value === 'object' &&
    value !== null &&
    'headerName' in value &&
    typeof value.headerName === 'string' &&
    'token' in value &&
    typeof value.token === 'string'
  );
}

async function csrf(context: BrowserContext): Promise<CsrfToken> {
  const response = await context.request.get('/api/v1/auth/csrf');
  const value: unknown = await response.json();
  if (!response.ok() || !isCsrfToken(value)) {
    throw new TypeError('CSRF 응답 형식이 올바르지 않습니다.');
  }
  return value;
}

async function postWithCsrf(
  context: BrowserContext,
  path: string,
  data: Record<string, unknown>,
): Promise<unknown> {
  const token = await csrf(context);
  const response = await context.request.post(path, {
    data,
    headers: {[token.headerName]: token.token},
  });
  expect(response.ok()).toBe(true);
  return response.status() === 204 ? undefined : response.json();
}

async function signUpAndLogin(context: BrowserContext): Promise<void> {
  const email = `handover-${crypto.randomUUID()}@mju.ac.kr`;
  const password = 'Password123';
  await postWithCsrf(context, '/api/v1/auth/sign-up', {
    name: '인수인계 테스트',
    email,
    password,
    termsAccepted: true,
  });
  await postWithCsrf(context, '/api/v1/auth/login', {email, password});
}

test('인수인계 생성·수정·삭제가 서버에 반영된다', async ({page}) => {
  // Given: an authenticated user opens an empty handover workspace
  await signUpAndLogin(page.context());
  await page.goto('/workspace');

  // When: the user creates a category and a handover document
  await page.getByRole('button', {name: '카테고리 추가'}).click();
  const categoryDialog = page.getByRole('dialog');
  await categoryDialog.getByLabel('카테고리 이름').fill('API 연동');
  const categoryResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/v1/handover-categories') &&
      response.request().method() === 'POST',
  );
  await categoryDialog.getByRole('button', {name: '카테고리 추가'}).click();
  const createCategoryResponse = await categoryResponse;
  expect(createCategoryResponse.status()).toBe(201);
  await expect(categoryDialog).toBeHidden();

  await page.getByRole('button', {name: '첫 인수인계 추가'}).click();
  const handoverDialog = page.getByRole('dialog');
  await handoverDialog.getByLabel('제목').fill('서버 저장 문서');
  await handoverDialog.getByLabel('담당자').fill('연동 담당자');
  const handoverResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/v1/handovers') &&
      response.request().method() === 'POST',
  );
  await handoverDialog.getByRole('button', {name: '인수인계 추가'}).click();
  expect((await handoverResponse).status()).toBe(201);

  // Then: the server-backed document is still visible after a reload
  await expect(page.getByRole('heading', {name: '서버 저장 문서'})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', {name: '서버 저장 문서'})).toBeVisible();

  await page.getByRole('button', {name: '수정'}).click();
  const editDialog = page.getByRole('dialog');
  await editDialog.getByLabel('제목').fill('서버 수정 문서');
  await editDialog.getByRole('button', {name: '변경 저장'}).click();
  await expect(page.getByRole('heading', {name: '서버 수정 문서'})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', {name: '서버 수정 문서'})).toBeVisible();

  await page.getByRole('button', {name: '인수인계 메뉴'}).click();
  await page.getByRole('menuitem', {name: '삭제'}).click();
  await page.getByRole('button', {name: '인수인계 삭제'}).click();
  await page.reload();
  await expect(page.getByRole('heading', {name: '서버 수정 문서'})).toHaveCount(0);
});

test('카테고리 수정과 삭제 cascade가 서버에 반영된다', async ({page}) => {
  await signUpAndLogin(page.context());
  const category = CategorySchema.parse(
    await postWithCsrf(page.context(), '/api/v1/handover-categories', {
      name: '수정 전 카테고리',
    }),
  );
  await postWithCsrf(page.context(), '/api/v1/handovers', {
    categoryId: category.id,
    title: 'cascade 확인 문서',
    owner: '연동 담당자',
    status: 'draft',
    summary: '',
    criticalNotes: [],
    recurringTasks: [],
    checklist: [],
    references: [],
    openQuestions: [],
  });
  await page.goto('/workspace');
  await expect(page.getByRole('heading', {name: 'cascade 확인 문서'})).toBeVisible();

  await page.getByRole('button', {name: '수정 전 카테고리 카테고리 메뉴'}).click();
  await page.getByRole('menuitem', {name: '이름 수정'}).click();
  const categoryDialog = page.getByRole('dialog');
  await categoryDialog.getByLabel('카테고리 이름').fill('수정 후 카테고리');
  const patchResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/v1/handover-categories/${category.id}`) &&
      response.request().method().toUpperCase() === 'PATCH',
  );
  await categoryDialog.getByRole('button', {name: '변경 저장'}).click();
  const updateCategoryResponse = await patchResponse;
  expect(updateCategoryResponse.status()).toBe(200);
  await page.reload();
  await expect(
    page
      .getByRole('navigation', {name: 'Side navigation'})
      .getByText('수정 후 카테고리', {exact: true}),
  ).toBeVisible();

  await page.getByRole('button', {name: '수정 후 카테고리 카테고리 메뉴'}).click();
  await page.getByRole('menuitem', {name: '카테고리 삭제'}).click();
  const deleteResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/api/v1/handover-categories/${category.id}`) &&
      response.request().method().toUpperCase() === 'DELETE',
  );
  await page.getByRole('button', {name: '카테고리 삭제'}).click();
  expect((await deleteResponse).status()).toBe(204);
  await page.reload();
  await expect(page.getByText('수정 후 카테고리', {exact: true})).toHaveCount(0);
  await expect(page.getByRole('heading', {name: 'cascade 확인 문서'})).toHaveCount(0);
  await expect(
    page.getByRole('heading', {name: '인수인계를 선택해주세요'}),
  ).toBeVisible();
});
