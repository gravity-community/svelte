import { fireEvent, render, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup } from "@gravity-community/svelte";

const ITEMS = [
  { value: "a", label: "First", description: "The first one." },
  { value: "b", label: "Second" },
  { value: "c", label: "Third", disabled: true },
];

const groupOf = (
  props: Partial<ComponentProps<typeof RadioGroup>> = {},
) => {
  const view = render(RadioGroup, {
    props: { label: "Which one?", items: ITEMS, ...props },
  });
  const rowOf = (name: string) => {
    const radio = within(view.container).getByRole("radio", { name });
    const label = within(view.container).getByText(name);
    return {
      radio,
      dot: radio.firstElementChild,
      row: radio.parentElement!,
      text: label.closest("label")!,
      label,
    };
  };
  return { ...view, rowOf };
};

/** The ones of `names` that `element` carries. */
const classesIn = (element: Element, names: string[]) =>
  names.filter((name) => element.classList.contains(name));

/** Classes that would draw a coloured ring or a white face on a soft radio, which changes only its fill. */
const edgeOf = (radio: Element) =>
  [...radio.classList].filter((name) =>
    (/(^|:)border-/.test(name) && name !== "border-transparent" &&
      !name.startsWith("forced-colors:")) ||
    name === "bg-surface"
  );

describe("RadioGroup", () => {
  it("is one choice named by its question, each radio by its label", async () => {
    const onValueChange = vi.fn();
    const { getByRole } = groupOf({ onValueChange });
    const first = getByRole("radio", { name: "First" });
    const second = getByRole("radio", { name: "Second" });

    expect(getByRole("radiogroup", { name: "Which one?" })).toBeVisible();
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

  it("names each radio by its label alone, and describes it by its description", () => {
    const { getByRole } = groupOf();
    const first = getByRole("radio", { name: "First" });
    expect(first).toHaveAccessibleName("First");
    expect(first).toHaveAccessibleDescription("The first one.");
    expect(getByRole("radio", { name: "Second" })).not.toHaveAttribute(
      "aria-describedby",
    );
  });

  it("chooses when its label or description is clicked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rowOf, getByText } = groupOf({ onValueChange });

    await user.click(rowOf("Second").label);
    expect(rowOf("Second").radio).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("b");

    await user.click(getByText("The first one."));
    expect(rowOf("First").radio).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("a");

    await user.click(rowOf("Third").label);
    expect(rowOf("First").radio).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenCalledTimes(2);
  });

  it("is named by its visible label and described by its hint and error", () => {
    const { getByRole, getByText, unmount } = groupOf({
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

    const plain = groupOf().getByRole("radiogroup");
    expect(plain).toHaveAccessibleName("Which one?");
    expect(plain).not.toHaveAttribute("aria-describedby");
  });

  it("syncs the chosen value through bind:value", async () => {
    const bound = $state({ value: "" as "" | "a" | "b" | "c" });
    const { getByRole } = render(RadioGroup, {
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

  it("posts its value under its name through bits-ui's hidden input", async () => {
    const form = document.createElement("form");
    document.body.append(form);
    const { getByRole } = render(RadioGroup, {
      props: { label: "Which one?", items: ITEMS, name: "answer" },
      target: form,
    });
    expect(form.querySelector("input[name=answer]")).not.toBeNull();
    expect(new FormData(form).get("answer")).toBe("");

    await fireEvent.click(getByRole("radio", { name: "Second" }));
    expect(new FormData(form).get("answer")).toBe("b");
    form.remove();
  });

  it("moves the choice with the arrow keys, past a disabled radio", async () => {
    const user = userEvent.setup();
    const { getByRole } = groupOf({ value: "a" });
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

  it("lays its radios in a row when horizontal", () => {
    const group = groupOf({ orientation: "horizontal" }).getByRole(
      "radiogroup",
    );
    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(group).toHaveClass(
      "data-[orientation=horizontal]:flex-row",
      "data-[orientation=horizontal]:gap-x-6",
    );
  });

  it("keeps the group reachable when the chosen radio is disabled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getByRole } = groupOf({ value: "c", onValueChange });
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

  it("keeps the group reachable once a disabled choice is cleared, and never chooses a disabled radio", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getByRole, rerender } = groupOf({ value: "c", onValueChange });
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
    const form = document.createElement("form");
    document.body.append(form);
    const { getAllByRole, getByRole } = render(RadioGroup, {
      props: {
        label: "Which one?",
        items: ITEMS,
        name: "answer",
        required: true,
        value: "z",
        error: "Choose one.",
      },
      target: form,
    });
    expect(new FormData(form).get("answer")).toBe("");
    expect(form.checkValidity()).toBe(false);

    for (const radio of getAllByRole("radio")) {
      expect(radio).toHaveAttribute("aria-checked", "false");
    }
    for (const name of ["First", "Second"]) {
      const radio = getByRole("radio", { name });
      expect(radio).toHaveClass("bg-danger-subtle");
      expect(radio.firstElementChild).toBeNull();
    }
    await user.tab();
    expect(getByRole("radio", { name: "First" })).toHaveFocus();
    form.remove();
  });

  it("greys every row while the group is disabled", async () => {
    const onValueChange = vi.fn();
    const { getByRole, getAllByRole, rowOf } = groupOf({
      value: "a",
      disabled: true,
      onValueChange,
    });
    expect(getByRole("radiogroup")).toHaveAttribute("data-disabled");
    for (const radio of getAllByRole("radio")) expect(radio).toBeDisabled();

    for (const name of ["First", "Second", "Third"]) {
      const { radio, row, text, label } = rowOf(name);
      expect(radio).toHaveClass(
        "cursor-not-allowed",
        "border-transparent",
        "bg-plate",
      );
      expect(classesIn(radio, ["bg-primary-solid", "bg-well"])).toEqual([]);
      expect(row).toHaveClass("cursor-not-allowed");
      expect(text).toHaveClass("cursor-not-allowed");
      expect(label).toHaveClass("text-disabled-fg");
    }
    expect(rowOf("First").dot).toHaveClass("bg-disabled-fg");

    await fireEvent.click(rowOf("Second").radio);
    await fireEvent.click(rowOf("Second").label);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(rowOf("First").radio).toHaveAttribute("aria-checked", "true");
  });

  it("shows its error and marks the group and every radio invalid while none is chosen", () => {
    const soft = groupOf({ error: "Choose one." });
    expect(soft.getByRole("alert")).toHaveTextContent("Choose one.");
    expect(soft.getByRole("radiogroup")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(soft.container.querySelector("[data-invalid]")).toBeNull();
    for (const name of ["First", "Second"]) {
      const { radio, dot } = soft.rowOf(name);
      expect(radio).toHaveClass(
        "border-transparent",
        "bg-danger-subtle",
        "group-hover/row:bg-danger-subtle-hover",
        "focus-visible:bg-danger-subtle-hover",
      );
      expect(edgeOf(radio)).toEqual([]);
      expect(dot).toBeNull();
    }
    soft.unmount();

    const faint = groupOf({ error: "Choose one.", energy: "1" });
    const { radio } = faint.rowOf("First");
    expect(radio).toHaveClass(
      "border",
      "border-danger-solid",
      "bg-transparent",
    );
    expect(classesIn(radio, ["bg-danger-subtle", "border-transparent"]))
      .toEqual([]);
  });

  it("takes invalid without a message, and lets invalid={false} keep the radios plain", () => {
    const marked = groupOf({ invalid: true });
    expect(marked.queryByRole("alert")).toBeNull();
    expect(marked.getByRole("radiogroup")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(marked.rowOf("First").radio).toHaveClass("bg-danger-subtle");
    marked.unmount();

    const plain = groupOf({ invalid: false, error: "Choose one." });
    expect(plain.getByRole("alert")).toHaveTextContent("Choose one.");
    expect(plain.getByRole("radiogroup")).not.toHaveAttribute("aria-invalid");
    expect(plain.rowOf("First").radio).toHaveClass("bg-well");
  });

  it("refuses the chosen radio in danger: a solid disc at soft, a deep one in a danger ring at faint", () => {
    const soft = groupOf({ value: "b", error: "Not this one." });
    const second = soft.rowOf("Second");
    expect(second.radio).toHaveAttribute("aria-checked", "true");
    expect(second.radio).toHaveClass("border-transparent", "bg-danger-solid");
    expect(edgeOf(second.radio)).toEqual([]);
    expect(second.radio.className).not.toMatch(/hover:/);
    expect(second.dot).toHaveClass("bg-on-danger");
    const first = soft.rowOf("First");
    expect(classesIn(first.radio, ["bg-danger-subtle"])).toEqual([]);
    expect(first.radio).toHaveClass("bg-well");
    soft.unmount();

    const faint = groupOf({ value: "b", error: "Not this one.", energy: "1" });
    const refused = faint.rowOf("Second");
    expect(refused.radio).toHaveClass(
      "border",
      "border-danger-solid",
      "bg-danger-deep",
    );
    expect(refused.radio.className).not.toMatch(/hover:/);
    expect(refused.dot).toHaveClass("bg-danger-strong");
    expect(faint.rowOf("First").radio).toHaveClass("border-border-field");
  });

  it("defaults to soft: the grey well, changing only its fill", () => {
    const { radio, dot, text, label } = groupOf().rowOf("First");
    expect(radio).toHaveClass(
      "mt-0.5",
      "size-4",
      "rounded-full",
      "border",
      "border-transparent",
      "bg-well",
      "group-hover/row:bg-well-active",
      "focus-visible:bg-well-active",
    );
    expect(edgeOf(radio)).toEqual([]);
    expect(dot).toBeNull();
    expect(text).toHaveClass("cursor-pointer", "pl-2.5");
    expect(label).toHaveClass("text-sm", "leading-5", "text-fg");
    expect(within(text).getByText("The first one.")).toHaveClass(
      "text-muted-fg",
    );
  });

  it("draws faint as the soft field frame with no fill, its text unchanged", () => {
    const { radio, label, text } = groupOf({ energy: "1" }).rowOf("First");
    expect(radio).toHaveClass(
      "border",
      "border-border-field",
      "bg-transparent",
      "group-hover/row:border-border-field-hover",
    );
    expect(classesIn(radio, ["bg-well", "bg-surface", "border-transparent"]))
      .toEqual([]);
    expect(label).toHaveClass("text-fg");
    expect(within(text).getByText("The first one.")).toHaveClass(
      "text-muted-fg",
    );
  });

  it("lifts the chosen radio one level: a solid disc at soft, a deep one in a focus ring at faint", () => {
    const soft = groupOf({ value: "a" }).rowOf("First");
    expect(soft.radio).toHaveClass(
      "border-transparent",
      "bg-primary-solid",
      "group-hover/row:bg-primary-hover",
    );
    expect(edgeOf(soft.radio)).toEqual([]);
    expect(soft.dot).toHaveClass("size-1.5", "rounded-full", "bg-on-primary");

    const faint = groupOf({ value: "a", energy: "1" }).rowOf("First");
    expect(faint.radio).toHaveClass("border-border-focus", "bg-primary-deep");
    expect(faint.radio.className).not.toMatch(/hover:/);
    expect(faint.dot).toHaveClass("bg-primary-strong");
  });

  it("never draws a coloured edge or a white face at soft", () => {
    const cases = [
      {},
      { value: "a" as const },
      { error: "Choose one." },
      { value: "a" as const, error: "Not this one." },
      { value: "c" as const },
    ];
    for (const props of cases) {
      const view = groupOf(props);
      for (const name of ["First", "Third"]) {
        const { radio } = view.rowOf(name);
        expect(radio).toHaveClass("border");
        expect(edgeOf(radio)).toEqual([]);
      }
      view.unmount();
    }
  });

  it("greys out a disabled radio, chosen or not, and in an error", () => {
    const views = [
      groupOf({ value: "a" }).rowOf("Third"),
      groupOf({ energy: "1" }).rowOf("Third"),
      groupOf({ value: "c", error: "Not this one." }).rowOf("Third"),
      groupOf({ value: "c", energy: "1" }).rowOf("Third"),
      groupOf({ error: "Choose one." }).rowOf("Third"),
    ];
    for (const { radio, row, text, label } of views) {
      expect(radio).toHaveAttribute("aria-disabled", "true");
      expect(radio).toHaveClass(
        "cursor-not-allowed",
        "border",
        "border-transparent",
        "bg-plate",
      );
      expect(
        classesIn(radio, [
          "bg-well",
          "bg-transparent",
          "bg-primary-solid",
          "bg-primary-deep",
          "bg-danger-subtle",
          "bg-danger-solid",
          "bg-danger-deep",
          "border-border-field",
          "border-border-focus",
          "border-danger-solid",
        ]),
      ).toEqual([]);
      expect(radio.className).not.toMatch(/hover:/);
      expect(radio).toHaveClass("forced-colors:border-[GrayText]");
      expect(row).toHaveClass("cursor-not-allowed");
      expect(text).toHaveClass("cursor-not-allowed");
      expect(label).toHaveClass(
        "text-disabled-fg",
        "forced-colors:text-[GrayText]",
      );
    }
    expect(views[0].radio).toBeDisabled();
    expect(views[2].radio).not.toBeDisabled();
    expect(views[2].dot).toHaveClass("bg-disabled-fg");
    expect(views[3].dot).toHaveClass("bg-disabled-fg");
  });
});
