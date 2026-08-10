import { expect, test } from "@playwright/test";

test("목록에서 문서를 선택하면 해당 인수인계 내용을 표시한다", async ({
  page,
}) => {
  // Given: a visitor opens the handover workspace
  await page.goto("/");

  // When: the visitor selects another handover document
  await page.getByRole("link", { name: /신입생 OT 준비/ }).click();

  // Then: the selected document replaces the open document
  await expect(
    page.getByRole("heading", { name: "신입생 OT 준비" }),
  ).toBeVisible();
  await expect(page.getByText("기획국 박서준")).toBeVisible();
});
