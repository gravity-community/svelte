import { render } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import Harness from "./popover-harness.svelte";

const BODY = "Two owners still need a verified identity.";

describe("Popover", () => {
  it("opens from a Button trigger and is named by its title", async () => {
    const { getByRole } = render(Harness, {
      props: { title: "AML: 2 things owed" },
    });
    const trigger = getByRole("button", { name: "AML" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    await tick();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(getByRole("dialog", { name: "AML: 2 things owed" }))
      .toHaveTextContent(
        BODY,
      );
  });

  it("closes from its close button", async () => {
    const onOpenChange = vi.fn();
    const { getByRole, queryByText } = render(Harness, {
      props: { title: "AML: 2 things owed", open: true, onOpenChange },
    });
    await userEvent.click(getByRole("button", { name: "Close" }));
    await tick();
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    expect(getByRole("button", { name: "AML" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    await vi.waitFor(() => expect(queryByText(BODY)).toBeNull());
  });

  it("is named by its trigger without a title", () => {
    const { getByRole } = render(Harness, { props: { open: true } });
    expect(getByRole("dialog", { name: "AML" })).toHaveTextContent(BODY);
  });

  it("has no close button without a title", () => {
    const { queryByRole, getByText } = render(Harness, {
      props: { open: true },
    });
    expect(getByText(BODY)).toBeInTheDocument();
    expect(queryByRole("button", { name: "Close" })).toBeNull();
  });
});

describe("Popover close", () => {
  // Opened from its trigger, so bits-ui knows where the focus came from.
  async function open(props: Record<string, unknown> = {}) {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const view = render(Harness, { props: { onOpenChange, ...props } });
    const trigger = view.getByRole("button", { name: "AML" });
    await user.click(trigger);
    await tick();
    const owner = view.getByRole("heading", { name: "Jana Nováková" });
    return { ...view, user, trigger, owner, onOpenChange };
  }

  it("closes from the footer, the focus going back to the trigger", async () => {
    const { user, trigger, onOpenChange, getByRole, queryByText } =
      await open();
    await user.click(getByRole("button", { name: "Done" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    await vi.waitFor(() => expect(queryByText(BODY)).toBeNull());
  });

  it("closes from the body on a pick, leaving the focus to the app", async () => {
    const { user, trigger, owner, onOpenChange, getByRole, queryByText } =
      await open();
    await user.click(getByRole("button", { name: "Jana Nováková" }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(owner).toHaveFocus();
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    await vi.waitFor(() => expect(queryByText(BODY)).toBeNull());
    expect(owner).toHaveFocus();
  });

  it("returns the focus again once a pick has closed it", async () => {
    const { user, trigger, owner, getByRole } = await open();
    await user.click(getByRole("button", { name: "Jana Nováková" }));
    expect(owner).toHaveFocus();

    await user.click(trigger);
    await tick();
    await user.keyboard("{Escape}");
    await tick();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("still calls the caller's onCloseAutoFocus", async () => {
    const onCloseAutoFocus = vi.fn();
    const { user, getByRole } = await open({ onCloseAutoFocus });
    await user.click(getByRole("button", { name: "Jana Nováková" }));
    expect(onCloseAutoFocus).toHaveBeenCalledOnce();
  });
});
