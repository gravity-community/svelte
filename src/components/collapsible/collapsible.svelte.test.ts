import { render, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { type ComponentProps, createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { Collapsible } from "@gravity-community/svelte";
import Harness from "./collapsible-harness.svelte";

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

describe("Collapsible with a trigger", () => {
  const setup = (props: ComponentProps<typeof Harness> = {}) => {
    const view = render(Harness, { props });
    const trigger = view.getByRole("button");
    const content = view.container.querySelector<HTMLElement>(
      "[data-collapsible-content]",
    )!;
    const link = view.getByText("Vltava Trade s.r.o.");
    return { ...view, trigger, content, link };
  };

  it("takes a title or a trigger, not both", () => {
    const trigger = createRawSnippet<[{ props: Record<string, unknown> }]>(
      () => ({ render: () => "<button>Show all</button>" }),
    );
    const props: ComponentProps<typeof Collapsible>[] = [
      { title: "Full access" },
      { trigger },
      // @ts-expect-error: a trigger replaces the title row
      { title: "Full access", trigger },
      // @ts-expect-error: the title row needs its title
      {},
    ];
    expect(props).toHaveLength(4);
  });

  it("spreads bits-ui's props onto it, in place of the title row", () => {
    const { trigger, content, link, getAllByRole } = setup();
    expect(getAllByRole("button")).toEqual([trigger]);
    expect(trigger).toHaveAccessibleName("Show all 4 records");
    expect(trigger).toHaveAttribute("type", "button");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", content.id);
    expect(trigger).toHaveAttribute("data-state", "closed");
    expect(trigger).toHaveClass("text-neutral-strong", "bg-transparent");
    expect(content).toContainElement(link);
  });

  it("renders it after the content", () => {
    const { trigger, content } = setup();
    expect(content.compareDocumentPosition(trigger)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("toggles from it, by pointer and by keyboard", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { trigger, link } = setup({ onOpenChange });

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAccessibleName("Show fewer");
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await waitFor(() => expect(link).toBeVisible());

    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAccessibleName("Show all 4 records");
    await waitFor(() => expect(link).not.toBeVisible());

    await user.keyboard(" ");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(onOpenChange.mock.calls).toEqual([[true], [false], [true]]);
  });

  it("keeps the hidden content out of the tab order", async () => {
    const user = userEvent.setup();
    const { trigger, link } = setup();
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.tab({ shift: true });
    expect(document.body).toHaveFocus();

    await user.click(trigger);
    await waitFor(() => expect(link).toBeVisible());
    await user.tab({ shift: true });
    expect(link).toHaveFocus();
  });
});
