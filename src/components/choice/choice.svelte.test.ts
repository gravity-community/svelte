import { fireEvent, render, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { Choice } from "@gravity-community/svelte";

const ITEMS = [
  { value: "a", title: "First", description: "The first one." },
  { value: "b", title: "Second" },
  { value: "c", title: "Third", disabled: true },
];

const choiceOf = (props: Partial<ComponentProps<typeof Choice>> = {}) => {
  const view = render(Choice, {
    props: { label: "Which one?", items: ITEMS, ...props },
  });
  const cardOf = (name: string) => {
    const card = within(view.container).getByRole("radio", { name });
    const radio = card.querySelector("[aria-hidden='true']")!;
    return {
      card,
      radio,
      dot: radio.firstElementChild,
      title: within(card).getByText(name),
    };
  };
  return { ...view, cardOf };
};

/** The ones of `names` that `element` carries. */
const classesIn = (element: Element, names: string[]) =>
  names.filter((name) => element.classList.contains(name));

/** Classes that would draw a ring or a white face on the radio, a part made of fills only. */
const ringOf = (radio: Element) =>
  [...radio.classList].filter((name) =>
    name.startsWith("border") || name === "bg-surface"
  );

describe("Choice", () => {
  it("is one choice named by its question, each card by its title", async () => {
    const onValueChange = vi.fn();
    const { getByRole } = choiceOf({ onValueChange });
    const first = getByRole("radio", { name: "First" });
    const second = getByRole("radio", { name: "Second" });

    expect(getByRole("radiogroup", { name: "Which one?" })).toBeVisible();
    expect(first).toHaveAccessibleDescription("The first one.");
    expect(first).toHaveAttribute("aria-checked", "false");

    await fireEvent.click(second);
    expect(second).toHaveAttribute("aria-checked", "true");
    expect(first).toHaveAttribute("aria-checked", "false");
    expect(onValueChange).toHaveBeenLastCalledWith("b");

    await fireEvent.click(first);
    expect(first).toHaveAttribute("aria-checked", "true");
    expect(second).toHaveAttribute("aria-checked", "false");
    expect(onValueChange).toHaveBeenLastCalledWith("a");
    expect(getByRole("radio", { name: "Third" })).toBeDisabled();
  });

  it("is named by its visible label and described by its hint and error", () => {
    const { getByRole, getByText, unmount } = choiceOf({
      hint: "Pick the closest.",
      error: "Choose one.",
    });
    const group = getByRole("radiogroup");
    expect(group).toHaveAccessibleName("Which one?");
    expect(group).toHaveAttribute(
      "aria-labelledby",
      getByText("Which one?").id,
    );
    expect(group).not.toHaveAttribute("aria-label");
    expect(group).toHaveAccessibleDescription("Pick the closest. Choose one.");
    unmount();

    const plain = choiceOf().getByRole("radiogroup");
    expect(plain).toHaveAccessibleName("Which one?");
    expect(plain).not.toHaveAttribute("aria-describedby");
  });

  it("syncs the chosen value through bind:value", async () => {
    const bound = $state({ value: "" as "" | "a" | "b" | "c" });
    const { getByRole } = render(Choice, {
      props: {
        label: "Which one?",
        items: ITEMS,
        get value() {
          return bound.value;
        },
        set value(next) {
          bound.value = next;
        },
      },
    });

    await fireEvent.click(getByRole("radio", { name: "Second" }));
    expect(bound.value).toBe("b");
  });

  it("moves the choice with the arrow keys, past a disabled card", async () => {
    const user = userEvent.setup();
    const { getByRole } = choiceOf({ value: "a" });
    const first = getByRole("radio", { name: "First" });
    const second = getByRole("radio", { name: "Second" });

    await user.tab();
    expect(first).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(second).toHaveFocus();
    expect(second).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{ArrowDown}");
    expect(first).toHaveFocus();
    expect(first).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{ArrowUp}");
    expect(second).toHaveAttribute("aria-checked", "true");
  });

  it("keeps the group reachable when the chosen card is disabled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getByRole } = choiceOf({ value: "c", onValueChange });
    const third = getByRole("radio", { name: "Third" });

    await user.tab();
    expect(third).toHaveFocus();
    expect(third).toHaveAttribute("aria-checked", "true");
    expect(third).toHaveAttribute("aria-disabled", "true");
    await user.keyboard(" ");
    await fireEvent.click(third);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(third).toHaveAttribute("aria-checked", "true");
  });

  it("keeps the group reachable once a disabled choice is cleared, and never chooses a disabled card", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getByRole, rerender } = choiceOf({ value: "c", onValueChange });
    await rerender({ value: "" });
    const third = getByRole("radio", { name: "Third" });

    await user.tab();
    expect(getByRole("radiogroup")).toContainElement(
      document.activeElement as HTMLElement,
    );
    third.focus();
    await user.keyboard(" ");
    await fireEvent.click(third);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(third).toHaveAttribute("aria-checked", "false");
    expect(third).toHaveAttribute("aria-disabled", "true");
  });

  it("counts a value outside its items as no choice", async () => {
    const user = userEvent.setup();
    const { getAllByRole, getByRole, cardOf } = choiceOf({
      value: "z",
      error: "Choose one.",
    });

    for (const radio of getAllByRole("radio")) {
      expect(radio).toHaveAttribute("aria-checked", "false");
    }
    for (const name of ["First", "Second"]) {
      const { card, dot } = cardOf(name);
      expect(card).toHaveClass("bg-danger-subtle");
      expect(dot).toBeNull();
    }
    await user.tab();
    expect(getByRole("radio", { name: "First" })).toHaveFocus();
  });

  it("shows its error and marks the group and every card invalid while none is chosen", () => {
    const soft = choiceOf({ error: "Choose one." });
    expect(soft.getByRole("alert")).toHaveTextContent("Choose one.");
    expect(soft.getByRole("radiogroup")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(soft.container.querySelector("[data-invalid]")).toBeNull();
    for (const name of ["First", "Second"]) {
      const { card, radio, dot } = soft.cardOf(name);
      expect(card).toHaveClass(
        "filled-well",
        "border-transparent",
        "bg-danger-subtle",
        "hover:bg-danger-subtle-hover",
        "focus-visible:bg-danger-subtle-hover",
      );
      expect(classesIn(card, ["border-2", "border-danger-solid"])).toEqual([]);
      expect(radio).toHaveClass("bg-danger-deep");
      expect(dot).toBeNull();
    }
    soft.unmount();

    const faint = choiceOf({ error: "Choose one.", energy: "1" });
    const { card, radio } = faint.cardOf("First");
    expect(card).toHaveClass("border-danger-solid", "hover:bg-danger-subtle");
    expect(classesIn(card, ["filled-well", "bg-danger-subtle"])).toEqual([]);
    expect(radio).toHaveClass("bg-neutral-deep");
  });

  it("takes invalid without a message, and lets invalid={false} keep the cards plain", () => {
    const marked = choiceOf({ invalid: true });
    expect(marked.queryByRole("alert")).toBeNull();
    expect(marked.getByRole("radiogroup")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(marked.cardOf("First").card).toHaveClass("bg-danger-subtle");
    marked.unmount();

    const plain = choiceOf({ invalid: false, error: "Choose one." });
    expect(plain.getByRole("alert")).toHaveTextContent("Choose one.");
    expect(plain.getByRole("radiogroup")).not.toHaveAttribute("aria-invalid");
    expect(plain.cardOf("First").card).toHaveClass("bg-well");
  });

  it("refuses the chosen card by its fill at soft, and by a 2px danger edge at faint", () => {
    const soft = choiceOf({ value: "b", error: "Not this one." });
    const second = soft.cardOf("Second");
    expect(second.card).toHaveAttribute("aria-checked", "true");
    expect(second.card).toHaveClass(
      "filled-well",
      "border",
      "border-transparent",
      "bg-danger-subtle",
      "p-4",
    );
    expect(
      classesIn(second.card, ["border-2", "border-danger-solid", "p-[15px]"]),
    ).toEqual([]);
    expect(second.card.className).not.toMatch(/(^|\s)hover:/);
    expect(second.radio).toHaveClass("bg-danger-solid");
    expect(second.dot).toHaveClass("bg-on-danger");
    const first = soft.cardOf("First");
    expect(classesIn(first.card, ["bg-danger-subtle"])).toEqual([]);
    expect(first.card).toHaveClass("bg-well");
    expect(first.radio).toHaveClass("bg-neutral-deep");
    soft.unmount();

    const faint = choiceOf({ value: "b", error: "Not this one.", energy: "1" });
    const refused = faint.cardOf("Second");
    expect(refused.card).toHaveClass(
      "filled-well",
      "border-2",
      "border-danger-solid",
      "bg-danger-subtle",
      "p-[15px]",
    );
    expect(refused.card.className).not.toMatch(/(^|\s)hover:/);
    expect(refused.radio).toHaveClass("bg-danger-deep");
    expect(refused.dot).toHaveClass("bg-danger-strong");
  });

  it("defaults to soft: the grey well, its radio the neutral deep glaze", () => {
    const { card, radio, dot, title } = choiceOf().cardOf("First");
    expect(card).toHaveClass(
      "filled-well",
      "border",
      "border-transparent",
      "bg-well",
      "hover:bg-well-active",
      "focus-visible:bg-well-active",
    );
    expect(radio).toHaveClass("bg-neutral-deep");
    expect(dot).toBeNull();
    expect(title).toHaveClass("text-fg");
    expect(within(card).getByText("The first one.")).toHaveClass(
      "text-muted-fg",
    );
  });

  it("draws faint as a neutral-subtle edge with no fill, its radio on the plate", () => {
    const { card, radio, title } = choiceOf({ energy: "1" }).cardOf("First");
    expect(card).toHaveClass(
      "border",
      "border-neutral-subtle",
      "hover:bg-well",
    );
    expect(classesIn(card, ["filled-well", "bg-well", "bg-surface"]))
      .toEqual([]);
    // The plate would vanish under an empty radio, so it keeps the deep disc.
    expect(radio).toHaveClass("bg-neutral-deep");
    expect(radio).not.toHaveClass("bg-plate");
    expect(title).toHaveClass("text-quiet-fg");
    expect(within(card).getByText("The first one.")).toHaveClass(
      "text-muted-fg",
    );
  });

  it("checks a soft card by its fill alone, its radio lifted to solid", () => {
    for (const [size, padding] of [["md", "p-4"], ["sm", "p-3"]] as const) {
      const view = choiceOf({ value: "a", size });
      const { card, radio, dot } = view.cardOf("First");
      expect(card).toHaveClass(
        "filled-well",
        "border",
        "border-transparent",
        "bg-primary-subtle",
        padding,
      );
      expect(
        classesIn(card, [
          "border-2",
          "border-border-focus",
          "border-neutral-subtle",
          "bg-well",
          "p-[15px]",
          "p-[11px]",
        ]),
      ).toEqual([]);
      expect(card.className).not.toMatch(/(^|\s)hover:/);
      expect(radio).toHaveClass("bg-primary-solid");
      expect(dot).toHaveClass("bg-on-primary");
      view.unmount();
    }
  });

  it("marks a checked faint card with a 2px edge, its radio lifted to soft", () => {
    const paddings = [["md", "p-[15px]"], ["sm", "p-[11px]"]] as const;
    for (const [size, padding] of paddings) {
      const view = choiceOf({ value: "a", energy: "1", size });
      const { card, radio, dot } = view.cardOf("First");
      expect(card).toHaveClass(
        "filled-well",
        "border-2",
        "border-border-focus",
        "bg-primary-subtle",
        padding,
      );
      expect(
        classesIn(card, [
          "p-3",
          "p-4",
          "border",
          "border-transparent",
          "border-neutral-subtle",
        ]),
      ).toEqual([]);
      expect(card.className).not.toMatch(/(^|\s)hover:/);
      expect(radio).toHaveClass("bg-primary-deep");
      expect(dot).toHaveClass("bg-primary-strong");
      view.unmount();
    }
  });

  it("draws the radio with fills only, never a ring or a white face", () => {
    const cases = [
      {},
      { value: "a" },
      { error: "Choose one." },
      { value: "a", error: "Not this one." },
      { value: "c" },
    ];
    for (const energy of ["2", "1"] as const) {
      for (const props of cases) {
        const view = choiceOf({ ...props, energy });
        for (const name of ["First", "Third"]) {
          const { radio } = view.cardOf(name);
          expect(radio).toHaveClass("forced-colors:border");
          expect(ringOf(radio)).toEqual([]);
        }
        view.unmount();
      }
    }
  });

  it("is roomier at md, the default, than at sm", () => {
    const md = choiceOf({ value: "a" }).cardOf("First");
    expect(md.card).toHaveClass("gap-3", "rounded-xl", "p-4");
    expect(md.radio).toHaveClass("size-5");
    expect(md.dot).toHaveClass("size-2");
    expect(md.radio).not.toHaveClass("mt-0.5");
    expect(md.title).toHaveClass("text-[15px]", "leading-5");

    const sm = choiceOf({ size: "sm", value: "b" });
    const first = sm.cardOf("First");
    expect(first.card).toHaveClass("gap-2.5", "rounded-[10px]", "p-3");
    expect(first.radio).toHaveClass("mt-0.5", "size-4");
    expect(first.title).toHaveClass("text-sm", "leading-5");
    expect(sm.cardOf("Second").dot).toHaveClass("size-1.5");
  });

  it("greys out a disabled card, chosen or not, and in an error", () => {
    const views = [
      choiceOf({ value: "a" }).cardOf("Third"),
      choiceOf({ energy: "1" }).cardOf("Third"),
      choiceOf({ value: "c", error: "Not this one." }).cardOf("Third"),
      choiceOf({ value: "c", energy: "1" }).cardOf("Third"),
      choiceOf({ error: "Choose one." }).cardOf("Third"),
    ];
    for (const { card, radio, title } of views) {
      expect(card).toHaveAttribute("aria-disabled", "true");
      expect(card).toHaveClass(
        "filled-well",
        "cursor-not-allowed",
        "border",
        "border-transparent",
        "bg-surface-muted",
      );
      expect(
        classesIn(card, [
          "bg-well",
          "bg-primary-subtle",
          "bg-danger-subtle",
          "border-2",
          "border-neutral-subtle",
          "border-danger-solid",
          "border-border-focus",
        ]),
      ).toEqual([]);
      expect(card.className).not.toMatch(/(^|\s)hover:/);
      expect(radio).toHaveClass("bg-neutral-subtle");
      expect(title).toHaveClass("text-disabled-fg");
    }
    expect(views[0].card).toBeDisabled();
    expect(views[2].card).not.toBeDisabled();
    expect(views[2].dot).toHaveClass("bg-disabled-fg");
    expect(views[3].dot).toHaveClass("bg-disabled-fg");
  });
});
