import {expect, test} from '@playwright/test';

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
