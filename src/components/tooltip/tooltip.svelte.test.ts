import { render } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Harness from "./tooltip-harness.svelte";

const LABEL = "Undo: Add Petr Svoboda";

describe("Tooltip", () => {
  it("shows on focus and describes its trigger", async () => {
    const user = userEvent.setup();
    const { getByRole, queryByRole } = render(Harness, {
      props: { label: LABEL, shortcut: "⌘Z" },
    });
    expect(queryByRole("tooltip")).toBeNull();
    await user.tab();
    const tooltip = getByRole("tooltip");
    expect(tooltip).toHaveTextContent(`${LABEL} ⌘Z`);
    expect(getByRole("button", { name: "Undo" })).toHaveAccessibleDescription(
      `${LABEL} ⌘Z`,
    );
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { getByRole, queryByRole } = render(Harness, {
      props: { label: LABEL, onOpenChange },
    });
    await user.tab();
    expect(getByRole("tooltip")).toHaveTextContent(LABEL);
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await vi.waitFor(() => expect(queryByRole("tooltip")).toBeNull());
  });
});
