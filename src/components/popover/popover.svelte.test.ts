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
