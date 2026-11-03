import { fireEvent, render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { flushSync } from "svelte";
import { describe, expect, it } from "vitest";
import { Checkbox } from "@gravity-community/svelte";

describe("Checkbox", () => {
  it("toggles and posts through a hidden input", async () => {
    const { getByRole, container } = render(Checkbox, {
      props: { name: "terms" },
    });
    const box = getByRole("checkbox");
    expect(box).toHaveAttribute("aria-checked", "false");

    await fireEvent.click(box);
    expect(box).toHaveAttribute("aria-checked", "true");
    expect(container.querySelector("input[name=terms]")).toBeChecked();
  });

  it("syncs both ways through bind:checked", async () => {
    const bound = $state({ checked: false });
    const { getByRole } = render(Checkbox, {
      props: {
        get checked() {
          return bound.checked;
        },
        set checked(next: boolean) {
          bound.checked = next;
        },
      },
    });
    const box = getByRole("checkbox");

    await fireEvent.click(box);
    expect(bound.checked).toBe(true);

    bound.checked = false;
    flushSync();
    expect(box).toHaveAttribute("aria-checked", "false");
  });

  it("toggles with the space key", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(Checkbox);
    const box = getByRole("checkbox");

    box.focus();
    await user.keyboard(" ");
    expect(box).toHaveAttribute("aria-checked", "true");
  });

  it("posts its value under its name only while checked", async () => {
    const form = document.createElement("form");
    document.body.append(form);
    render(Checkbox, { props: { name: "terms", value: "yes" }, target: form });
    expect(new FormData(form).get("terms")).toBeNull();

    await fireEvent.click(screen.getByRole("checkbox"));
    expect(new FormData(form).get("terms")).toBe("yes");
    form.remove();
  });

  it("ignores clicks while disabled", async () => {
    const { getByRole, container } = render(Checkbox, {
      props: { name: "terms", disabled: true },
    });
    const box = getByRole("checkbox");

    expect(box).toBeDisabled();
    await fireEvent.click(box);
    expect(box).toHaveAttribute("aria-checked", "false");
    expect(container.querySelector("input[name=terms]")).toBeDisabled();
  });

  it("is a soft field box by default, faint when asked", () => {
    const { getAllByRole } = render(Checkbox);
    render(Checkbox, { props: { energy: "1" } });
    const [soft, faint] = getAllByRole("checkbox");

    expect(soft).toHaveClass("bg-well", "border-transparent");
    expect(faint).toHaveClass("border-border-field", "bg-transparent");
  });

  it("lifts one level when checked", async () => {
    const { getAllByRole } = render(Checkbox, { props: { checked: true } });
    render(Checkbox, { props: { checked: true, energy: "1" } });
    const [soft, faint] = getAllByRole("checkbox");

    expect(soft).toHaveClass("bg-primary-solid", "text-on-primary");
    expect(faint).toHaveClass(
      "border-border-focus",
      "bg-primary-deep",
      "text-primary-strong",
    );

    await fireEvent.click(soft);
    expect(soft).toHaveClass("bg-well");
    expect(soft).not.toHaveClass("bg-primary-solid");
  });

  it("shows the plate while disabled, checked or not", () => {
    const { getAllByRole } = render(Checkbox, { props: { disabled: true } });
    render(Checkbox, {
      props: { disabled: true, checked: true, energy: "1" },
    });

    for (const box of getAllByRole("checkbox")) {
      expect(box).toHaveClass("bg-plate", "border-transparent");
    }
  });
});
