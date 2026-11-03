import { fireEvent, render } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CodeBlock } from "@gravity-community/svelte";

const tabs = [
  { label: "shell", code: "echo shell" },
  { label: "json", code: '{ "ok": true }' },
];

describe("CodeBlock", () => {
  it("shows the first pane and switches panes on tab click", async () => {
    const { getByRole } = render(CodeBlock, { props: { tabs } });
    expect(getByRole("tabpanel")).toHaveTextContent("echo shell");

    await fireEvent.click(getByRole("tab", { name: "json" }));
    expect(getByRole("tabpanel")).toHaveTextContent('"ok": true');
  });

  it("switches panes with the arrow keys", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(CodeBlock, { props: { tabs } });

    await user.tab();
    expect(getByRole("tab", { name: "shell" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");

    const json = getByRole("tab", { name: "json" });
    expect(json).toHaveFocus();
    expect(json).toHaveAttribute("aria-selected", "true");
    expect(getByRole("tabpanel")).toHaveTextContent('"ok": true');
  });

  it("copies the active pane to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    const { getByRole } = render(CodeBlock, { props: { tabs } });
    await fireEvent.click(getByRole("button", { name: "Copy code" }));
    expect(writeText).toHaveBeenLastCalledWith("echo shell");

    await fireEvent.click(getByRole("tab", { name: "json" }));
    await fireEvent.click(getByRole("button", { name: "Copied" }));
    expect(writeText).toHaveBeenLastCalledWith('{ "ok": true }');
  });

  it("labels a single snippet without tabs", () => {
    const { getByText, queryByRole } = render(CodeBlock, {
      props: { label: "shell", code: "ls" },
    });
    expect(getByText("shell")).toBeInTheDocument();
    expect(queryByRole("tablist")).toBeNull();
  });
});
