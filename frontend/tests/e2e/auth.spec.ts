import {expect, test, type BrowserContext} from '@playwright/test';

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

async function postWithCsrf(
  context: BrowserContext,
  path: string,
  data: Record<string, unknown>,
): Promise<void> {
  const csrfResponse = await context.request.get('/api/v1/auth/csrf');
  const value: unknown = await csrfResponse.json();
  if (!csrfResponse.ok() || !isCsrfToken(value)) {
    throw new TypeError('CSRF 응답 형식이 올바르지 않습니다.');
  }

  const response = await context.request.post(path, {
    data,
    headers: {[value.headerName]: value.token},
  });
  expect(response.ok()).toBe(true);
}

test('학교 이메일과 비밀번호 없이 로그인하면 입력 오류를 표시한다', async ({page}) => {
  // Given: a visitor opens the login page
  await page.goto('/login');

  // When: the visitor submits an empty form
  await page.getByRole('button', {name: '로그인'}).click();

  // Then: the required-field feedback is visible
  await expect(page.getByText('입력 내용을 확인해주세요.')).toBeVisible();
  await expect(
    page.getByText('명지대학교 이메일(@mju.ac.kr)을 입력해주세요.'),
  ).toBeVisible();
});

test('로그인 성공 후 인수인계 화면으로 이동한다', async ({page}) => {
  // Given: a registered visitor opens the login page
  const email = `auth-${crypto.randomUUID()}@mju.ac.kr`;
  const password = 'Password123';

  await postWithCsrf(page.context(), '/api/v1/auth/sign-up', {
    name: '로그인 테스트',
    email,
    password,
    termsAccepted: true,
  });

  await page.goto('/login');

  // When: the visitor signs in with valid credentials
  await page.getByLabel('학교 이메일').fill(email);
  await page.getByLabel('비밀번호').fill(password);
  await page.getByRole('button', {name: '로그인'}).click();

  // Then: the authenticated handover route is visible
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole('heading', {name: '인수인계를 선택해주세요'}),
  ).toBeVisible();
});
