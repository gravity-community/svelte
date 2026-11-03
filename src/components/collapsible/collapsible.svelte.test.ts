import { render, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { Collapsible } from "@gravity-community/svelte";

const children = createRawSnippet(() => ({ render: () => "<p>Detail</p>" }));

describe("Collapsible", () => {
  it("renders its title", () => {
    const { getByText } = render(Collapsible, {
      props: { title: "Full access" },
    });
    expect(getByText("Full access")).toBeInTheDocument();
  });

  it("is collapsed by default", () => {
    const { getByRole, getByText } = render(Collapsible, {
      props: { title: "T", children },
    });
    expect(getByRole("button", { name: "T" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(getByText("Detail")).not.toBeVisible();
  });

  it("is expanded when open=true", () => {
    const { getByRole, getByText } = render(Collapsible, {
      props: { title: "T", open: true, children },
    });
    expect(getByRole("button", { name: "T" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(getByText("Detail")).toBeVisible();
  });

  it("toggles from its trigger, swapping plus for minus", async () => {
    const onOpenChange = vi.fn();
    const { getByRole, getByText } = render(Collapsible, {
      props: { title: "T", children, onOpenChange },
    });
    const trigger = getByRole("button", { name: "T" });
    const icon = () => trigger.querySelector("svg")!.innerHTML;
    const closed = icon();

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(icon()).not.toBe(closed);
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await waitFor(() => expect(getByText("Detail")).toBeVisible());

    await userEvent.click(trigger);
    expect(icon()).toBe(closed);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(getByText("Detail")).not.toBeVisible());
  });
});
