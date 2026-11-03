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

  it("opens on a tap and closes on a second tap", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { getByRole, queryByRole } = render(Harness, {
      props: { label: LABEL, onOpenChange },
    });
    const trigger = getByRole("button", { name: "Undo" });
    await user.pointer({ keys: "[TouchA]", target: trigger });
    expect(getByRole("tooltip")).toHaveTextContent(LABEL);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await user.pointer({ keys: "[TouchA]", target: trigger });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await vi.waitFor(() => expect(queryByRole("tooltip")).toBeNull());
  });

  it("closes on a tap elsewhere", async () => {
    const user = userEvent.setup();
    const { getByRole, queryByRole } = render(Harness, {
      props: { label: LABEL },
    });
    await user.pointer({
      keys: "[TouchA]",
      target: getByRole("button", { name: "Undo" }),
    });
    expect(getByRole("tooltip")).toHaveTextContent(LABEL);
    // jsdom lays the tooltip out at 0, 0, so the tap lands away from it.
    await user.pointer({
      keys: "[TouchA]",
      target: document.body,
      coords: { clientX: 100, clientY: 100 },
    });
    await vi.waitFor(() => expect(queryByRole("tooltip")).toBeNull());
  });

  it("still opens on hover and closes on a click with a mouse", async () => {
    const user = userEvent.setup();
    const { getByRole, queryByRole } = render(Harness, {
      props: { label: LABEL, delayDuration: 0 },
    });
    const trigger = getByRole("button", { name: "Undo" });
    await user.hover(trigger);
    expect(getByRole("tooltip")).toHaveTextContent(LABEL);
    await user.click(trigger);
    await vi.waitFor(() => expect(queryByRole("tooltip")).toBeNull());
  });

  it("leaves a tap to a trigger's own action, and shows nothing", async () => {
    const user = userEvent.setup();
    const onaction = vi.fn();
    const { getByRole, queryByRole } = render(Harness, {
      props: { label: LABEL, onaction },
    });
    await user.pointer({
      keys: "[TouchA]",
      target: getByRole("button", { name: "Undo" }),
    });
    expect(onaction).toHaveBeenCalledOnce();
    expect(queryByRole("tooltip")).toBeNull();
  });

  it("closes on a tap of a trigger with its own action what focus opened, as on any press", async () => {
    const user = userEvent.setup();
    const onaction = vi.fn();
    const { getByRole, queryByRole } = render(Harness, {
      props: { label: LABEL, onaction },
    });
    await user.tab();
    expect(getByRole("tooltip")).toHaveTextContent(LABEL);
    await user.pointer({
      keys: "[TouchA]",
      target: getByRole("button", { name: "Undo" }),
    });
    expect(onaction).toHaveBeenCalledOnce();
    await vi.waitFor(() => expect(queryByRole("tooltip")).toBeNull());
  });

  it("lets a key press close it after a tap, as after focus", async () => {
    const user = userEvent.setup();
    const { getByRole, queryByRole } = render(Harness, {
      props: { label: LABEL },
    });
    await user.pointer({
      keys: "[TouchA]",
      target: getByRole("button", { name: "Undo" }),
    });
    expect(getByRole("tooltip")).toHaveTextContent(LABEL);
    await user.keyboard("{Enter}");
    await vi.waitFor(() => expect(queryByRole("tooltip")).toBeNull());
  });
});
