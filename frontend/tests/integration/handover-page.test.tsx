import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";

vi.mock("../../src/handover/api", () => ({
  createCategory: vi.fn(),
  createHandover: vi.fn(),
  deleteCategory: vi.fn(),
  deleteHandover: vi.fn(),
  getHandoverWorkspace: vi.fn().mockResolvedValue({
    categories: [
      { id: "00000000-0000-4000-8000-000000000001", name: "기획국" },
    ],
    handovers: [
      {
        id: "00000000-0000-4000-8000-000000000002",
        categoryId: "00000000-0000-4000-8000-000000000001",
        title: "정기회의 운영",
        owner: "기획국 김민지",
        status: "complete",
        summary: "정기회의 운영 절차",
        criticalNotes: [],
        recurringTasks: [],
        checklist: [],
        references: [],
        openQuestions: [],
        updatedAt: "2026-08-11T00:00:00Z",
      },
      {
        id: "00000000-0000-4000-8000-000000000003",
        categoryId: "00000000-0000-4000-8000-000000000001",
        title: "신입생 OT 준비",
        owner: "기획국 박서준",
        status: "review",
        summary: "신입생 OT 준비 절차",
        criticalNotes: [],
        recurringTasks: [],
        checklist: [],
        references: [],
        openQuestions: [],
        updatedAt: "2026-08-10T00:00:00Z",
      },
    ],
  }),
  updateCategory: vi.fn(),
  updateHandover: vi.fn(),
}));

describe("인수인계 페이지", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("목록에서 문서를 선택하면 해당 인수인계 내용을 표시한다", async () => {
    // Given: the handover workspace is open with documents from the API
    const user = userEvent.setup();
    render(<App />);

    // When: the visitor selects another handover document
    await user.click(
      await screen.findByRole("link", { name: /신입생 OT 준비/ }),
    );

    // Then: the selected document replaces the open document
    expect(
      await screen.findByRole("heading", { name: "신입생 OT 준비" }),
    ).toBeVisible();
    expect(screen.getByText("기획국 박서준")).toBeVisible();
  });
});
