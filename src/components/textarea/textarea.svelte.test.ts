import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { Textarea } from "@gravity-community/svelte";

describe("Textarea", () => {
  it("puts the caller's class on the root and attributes on the textarea", () => {
    const { container, getByRole } = render(Textarea, {
      props: { class: "w-80 h-40", name: "notes", invalid: true },
    });
    const root = container.firstElementChild;
    expect(root).toHaveClass("w-80", "h-40");
    expect(root).not.toHaveClass("w-full");

    const field = getByRole("textbox");
    expect(root).toContainElement(field);
    expect(field).toHaveAttribute("name", "notes");
    expect(field).toHaveAttribute("aria-invalid", "true");
  });

  it("keeps the same textarea, and its focus, when loading toggles", async () => {
    const { getByRole, rerender, container } = render(Textarea);
    const field = getByRole("textbox");
    field.focus();

    await rerender({ loading: true });
    expect(getByRole("textbox")).toBe(field);
    expect(field).toHaveFocus();
    expect(container.querySelector("svg")).toHaveClass("text-muted-fg");
  });

  it.each(
    [
      ["default", "placeholder:text-placeholder-fg"],
      ["tinted", "placeholder:text-muted-fg"],
    ] as const,
  )(
    "keeps the %s variant's placeholder colour when disabled",
    (variant, placeholder) => {
      const { getByRole } = render(Textarea, {
        props: { variant, disabled: true },
      });
      expect(getByRole("textbox")).toHaveClass(placeholder);
    },
  );

  // A <fieldset disabled> disables the textarea without the prop.
  it("takes the not-allowed cursor from :disabled, not only the prop", () => {
    const { getByRole } = render(Textarea);
    expect(getByRole("textbox")).toHaveClass("disabled:cursor-not-allowed");
  });
});
