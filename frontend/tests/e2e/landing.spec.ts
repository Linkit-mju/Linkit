import {expect, test} from '@playwright/test';

test('방문자가 서비스 소개에서 회원가입으로 이동한다', async ({page}) => {
  // Given: a visitor opens the public landing page
  await page.goto('/');

  // When: the visitor follows the primary signup link
  await page.getByRole('link', {name: 'Linkit 시작하기'}).click();

  // Then: the signup page is shown
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByRole('heading', {name: '회원가입'})).toBeVisible();
});
