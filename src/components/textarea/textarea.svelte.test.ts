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

  it.each(["2", "1"] as const)(
    "keeps the %s placeholder colour when disabled, in a grey box",
    (energy) => {
      const { getByRole } = render(Textarea, {
        props: { energy, disabled: true },
      });
      expect(getByRole("textbox")).toHaveClass(
        "placeholder:text-muted-fg",
        "border-transparent",
        "bg-surface-muted",
        "opacity-60",
      );
    },
  );

  // Decay isn't automatic yet: callers pass the level, so each one is checked here.
  it("defaults to the soft well and draws faint as a frame", () => {
    const soft = render(Textarea);
    const faint = render(Textarea, { props: { energy: "1" } });
    const [softField, faintField] = [soft, faint].map((r) =>
      r.container.querySelector("textarea")
    );
    expect(softField).toHaveClass(
      "border",
      "border-transparent",
      "bg-well",
      "focus:bg-well-active",
    );
    expect(faintField).toHaveClass(
      "border",
      "border-border-field",
      "bg-transparent",
      "hover:border-border-field-hover",
      "focus:border-border-focus",
      "focus:inset-ring",
    );
    expect(faintField).not.toHaveClass("bg-surface");
    for (const field of [softField, faintField]) {
      expect(field).toHaveClass("placeholder:text-muted-fg");
      expect(field).not.toHaveClass("forced-colors:border");
    }
  });

  it("marks a faint invalid textarea with the danger edge alone", () => {
    const { getByRole } = render(Textarea, {
      props: { energy: "1", invalid: true },
    });
    expect(getByRole("textbox")).toHaveClass(
      "border-danger-solid",
      "bg-transparent",
      "text-danger-strong",
    );
    expect(getByRole("textbox")).not.toHaveClass(
      "hover:border-border-field-hover",
    );
  });

  // A <fieldset disabled> disables the textarea without the prop.
  it("takes the not-allowed cursor from :disabled, not only the prop", () => {
    const { getByRole } = render(Textarea);
    expect(getByRole("textbox")).toHaveClass("disabled:cursor-not-allowed");
  });
});
