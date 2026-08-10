import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../../src/App";

describe("인수인계 페이지", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/workspace");
  });

  it("목록에서 문서를 선택하면 해당 인수인계 내용을 표시한다", async () => {
    // Given: the handover workspace is open with its initial documents
    const user = userEvent.setup();
    render(<App />);

    // When: the visitor selects another handover document
    await user.click(screen.getByRole("link", { name: /신입생 OT 준비/ }));

    // Then: the selected document replaces the open document
    expect(
      await screen.findByRole("heading", { name: "신입생 OT 준비" }),
    ).toBeVisible();
    expect(screen.getByText("기획국 박서준")).toBeVisible();
  });
});
