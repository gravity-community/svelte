import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { flushSync } from "svelte";
import { describe, expect, it, vi } from "vitest";
import {
  Select,
  type SelectGroup,
  type SelectItem,
} from "@gravity-community/svelte";

const items = [
  { value: "one", label: "One" },
  { value: "two", label: "Two" },
  { value: "three", label: "Three", disabled: true },
];

describe("Select", () => {
  it("shows the placeholder until something is chosen", () => {
    render(Select, { props: { items, placeholder: "Pick one" } });
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Pick one");
    expect(trigger).toHaveAttribute("data-placeholder");
  });

  it("shows the chosen item's label", () => {
    render(Select, { props: { items, value: "two", placeholder: "Pick one" } });
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Two");
    expect(trigger).not.toHaveAttribute("data-placeholder");
  });

  it("opens on click and picks an item", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Select, {
      props: { items, placeholder: "Pick one", onValueChange },
    });
    const trigger = screen.getByRole("combobox");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: "Two" }));
    expect(onValueChange).toHaveBeenCalledWith("two");
    expect(trigger).toHaveTextContent("Two");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("syncs value and open both ways through bind:value and bind:open", async () => {
    const user = userEvent.setup();
    const bound = $state({ value: "", open: false });
    render(Select, {
      props: {
        items,
        get value() {
          return bound.value;
        },
        set value(next: string) {
          bound.value = next;
        },
        get open() {
          return bound.open;
        },
        set open(next: boolean) {
          bound.open = next;
        },
      },
    });
    const trigger = screen.getByRole("combobox");

    await user.click(trigger);
    expect(bound.open).toBe(true);
    await user.click(screen.getByRole("option", { name: "Two" }));
    expect(bound.value).toBe("two");
    expect(bound.open).toBe(false);

    bound.value = "one";
    flushSync();
    expect(trigger).toHaveTextContent("One");
    bound.open = true;
    flushSync();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("picks with the keyboard", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Select, { props: { items, value: "one", onValueChange } });

    screen.getByRole("combobox").focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("two");
  });

  it("skips disabled items", async () => {
    const user = userEvent.setup();
    render(Select, { props: { items } });

    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("option", { name: "Three" })).toHaveAttribute(
      "data-disabled",
    );
  });

  it("posts the value through a hidden input", async () => {
    const user = userEvent.setup();
    const { container } = render(Select, {
      props: { items, name: "count", value: "one" },
    });
    const input = () =>
      container.querySelector<HTMLInputElement>('input[name="count"]');
    expect(input()?.value).toBe("one");

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Two" }));
    expect(input()?.value).toBe("two");
  });

  it("renders no hidden input without a name", () => {
    const { container } = render(Select, { props: { items, value: "one" } });
    expect(container.querySelector("input")).toBeNull();
  });

  it("stays closed while disabled", async () => {
    const user = userEvent.setup();
    render(Select, { props: { items, disabled: true } });
    const trigger = screen.getByRole("combobox");

    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("marks the trigger invalid and forwards its id", () => {
    render(Select, { props: { items, invalid: true, id: "plan" } });
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("id", "plan");
  });

  it("rounds the outline trigger fully at every size, bordered as default", () => {
    for (const size of ["sm", "md", "lg"] as const) {
      const { unmount } = render(Select, {
        props: { items, variant: "outline", size },
      });
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass(
        "rounded-full",
        "border",
        "border-border-interactive",
        "bg-surface",
      );
      expect(
        [...trigger.classList].filter((c) => c.startsWith("rounded-")),
      ).toEqual(["rounded-full"]);
      unmount();
    }
  });

  describe("with groups and statuses", () => {
    const grouped = [
      {
        value: "all",
        label: "All norms",
        status: { intent: "neutral", label: "Unfinished" },
      },
      {
        label: "Norms",
        items: [
          {
            value: "aml",
            label: "AML",
            status: { intent: "info", filled: true, label: "New work" },
          },
          { value: "strict", label: "Strict" },
        ],
      },
      { items: [{ value: "tax", label: "Tax" }] },
    ] satisfies (SelectItem | SelectGroup)[];

    it("heads a group and sets each group apart with a rule", async () => {
      const user = userEvent.setup();
      render(Select, { props: { items: grouped } });

      await user.click(screen.getByRole("combobox"));
      const norms = screen.getByRole("group", { name: "Norms" });
      const [aml, strict] = within(norms).getAllByRole("option");
      expect(aml).toHaveAccessibleName("AML, New work");
      expect(strict).toHaveAccessibleName("Strict");
      expect(norms.previousElementSibling).toHaveAttribute(
        "data-separator-root",
      );
      expect(norms.previousElementSibling).toHaveAttribute("role", "none");

      const unheaded = screen.getAllByRole("group")[1];
      expect(unheaded).not.toHaveAttribute("aria-labelledby");
      expect(unheaded.previousElementSibling).toHaveAttribute(
        "data-separator-root",
      );
      expect(screen.getByRole("listbox").querySelectorAll("[role=none]"))
        .toHaveLength(2);
    });

    it("draws no rule above a group that comes first", async () => {
      const user = userEvent.setup();
      render(Select, { props: { items: grouped.slice(1) } });

      await user.click(screen.getByRole("combobox"));
      const [norms, unheaded] = screen.getAllByRole("group");
      expect(norms.previousElementSibling).toBeNull();
      expect(unheaded.previousElementSibling).toHaveAttribute(
        "data-separator-root",
      );
    });

    it("draws a rule below a group that an option follows", async () => {
      const user = userEvent.setup();
      render(Select, {
        props: { items: [grouped[1], { value: "tail", label: "Tail" }] },
      });

      await user.click(screen.getByRole("combobox"));
      expect(
        screen.getByRole("option", { name: "Tail" }).previousElementSibling,
      ).toHaveAttribute("data-separator-root");
    });

    it("announces an option's status but not its dot", async () => {
      const user = userEvent.setup();
      render(Select, { props: { items: grouped } });

      await user.click(screen.getByRole("combobox"));
      const aml = screen.getByRole("option", { name: "AML, New work" });
      expect(aml).toHaveTextContent(/^AML$/);
      const dot = aml.querySelector(".text-info-solid");
      expect(dot).toHaveAttribute("aria-hidden", "true");
      expect(dot).toHaveClass("bg-current");
      expect(
        screen.getByRole("option", { name: "All norms, Unfinished" })
          .querySelector(".text-neutral-solid"),
      ).not.toHaveClass("bg-current");
      expect(
        screen.getByRole("option", { name: "Strict" }).querySelector(
          "[aria-hidden=true]:not(svg)",
        ),
      ).toBeNull();
    });

    it("shows the chosen option's dot and status on the trigger", async () => {
      const user = userEvent.setup();
      render(Select, { props: { items: grouped, placeholder: "Pick one" } });
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveTextContent(/^Pick one$/);
      expect(trigger.querySelector(".text-info-solid")).toBeNull();

      await user.click(trigger);
      await user.click(screen.getByRole("option", { name: "AML, New work" }));
      expect(trigger).toHaveTextContent(/^AML, New work$/);
      expect(trigger).not.toHaveAttribute("data-placeholder");
      expect(trigger.querySelector(".text-info-solid")).toHaveClass(
        "bg-current",
      );

      await user.click(trigger);
      await user.click(screen.getByRole("option", { name: "Strict" }));
      expect(trigger).toHaveTextContent(/^Strict$/);
      expect(trigger.querySelector(".text-info-solid")).toBeNull();
    });

    it("finds options inside groups by typeahead", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(Select, { props: { items: grouped, onValueChange } });

      screen.getByRole("combobox").focus();
      await user.keyboard("t");
      expect(onValueChange).toHaveBeenCalledWith("tax");
    });
  });
});
