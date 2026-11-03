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
    // The first arrow lands on the chosen option, the next moves on.
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("two");
  });

  describe("before the user moves to an option", () => {
    const highlighted = () =>
      screen.queryAllByRole("option").filter((o) =>
        o.hasAttribute("data-highlighted")
      );

    it("opens with no option active", async () => {
      const user = userEvent.setup();
      render(Select, { props: { items } });
      const trigger = screen.getByRole("combobox");

      await user.click(trigger);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(highlighted()).toEqual([]);
      expect(trigger).not.toHaveAttribute("aria-activedescendant");
    });

    it("lands on the first option with ArrowDown and the last with ArrowUp", async () => {
      const user = userEvent.setup();
      render(Select, { props: { items } });
      const trigger = screen.getByRole("combobox");

      await user.click(trigger);
      await user.keyboard("{ArrowDown}");
      const one = screen.getByRole("option", { name: "One" });
      expect(highlighted()).toEqual([one]);
      expect(trigger).toHaveAttribute("aria-activedescendant", one.id);

      // The last option is disabled, so ArrowUp skips it.
      await user.keyboard("{Escape}");
      await user.click(trigger);
      await user.keyboard("{ArrowUp}");
      expect(highlighted()).toEqual([
        screen.getByRole("option", { name: "Two" }),
      ]);
    });

    it("shows the active option at once when an arrow opens the list", async () => {
      const user = userEvent.setup();
      render(Select, { props: { items } });

      screen.getByRole("combobox").focus();
      await user.keyboard("{ArrowDown}");
      expect(highlighted()).toEqual([
        screen.getByRole("option", { name: "One" }),
      ]);
    });

    it("picks nothing with Enter or Space", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(Select, { props: { items, onValueChange } });

      await user.click(screen.getByRole("combobox"));
      await user.keyboard("{Enter} ");
      expect(onValueChange).not.toHaveBeenCalled();
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("shows an option once the pointer moves over it", async () => {
      const user = userEvent.setup();
      render(Select, { props: { items } });

      await user.click(screen.getByRole("combobox"));
      const two = screen.getByRole("option", { name: "Two" });
      await user.hover(two);
      expect(highlighted()).toEqual([two]);
    });

    it("commits the option moved to when Tab leaves, and only then", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(Select, { props: { items, onValueChange } });
      const trigger = screen.getByRole("combobox");

      await user.click(trigger);
      await user.tab();
      expect(onValueChange).not.toHaveBeenCalled();

      await user.click(trigger);
      await user.keyboard("{ArrowDown}{ArrowDown}");
      await user.tab();
      expect(onValueChange).toHaveBeenCalledWith("two");
    });
  });

  it("skips disabled items", async () => {
    const user = userEvent.setup();
    render(Select, { props: { items } });

    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("option", { name: "Three" })).toHaveAttribute(
      "data-disabled",
    );
  });

  it("tells assistive tech which options are disabled", async () => {
    const user = userEvent.setup();
    render(Select, { props: { items } });

    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("option", { name: "One" })).not.toHaveAttribute(
      "aria-disabled",
    );
    expect(screen.getByRole("option", { name: "Three" })).toHaveAttribute(
      "aria-disabled",
      "true",
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

  // Decay isn't automatic yet: callers pass the level, so each one is checked here.
  describe("energy and shape", () => {
    it("defaults to the soft well, keeping the global ring as it has no caret", () => {
      render(Select, { props: { items } });
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass(
        "border",
        "border-transparent",
        "bg-well",
        "focus:bg-well-active",
        "data-[state=open]:bg-well-active",
        "data-placeholder:text-muted-fg",
      );
      expect(trigger).not.toHaveClass("forced-colors:border");
      expect(trigger).not.toHaveClass("focus-visible:outline-hidden");
    });

    it("draws faint's frame and its own focus, open included", () => {
      render(Select, { props: { items, energy: "1" } });
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass(
        "border",
        "border-border-field",
        "bg-transparent",
        "hover:border-border-field-hover",
        "data-placeholder:text-muted-fg",
        "focus-visible:outline-hidden",
        "data-[state=open]:border-border-focus",
        "data-[state=open]:inset-ring",
      );
      expect(trigger).not.toHaveClass("bg-surface");
    });

    it("marks a faint invalid trigger with the danger edge alone", () => {
      render(Select, { props: { items, energy: "1", invalid: true } });
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass(
        "border-danger-solid",
        "bg-transparent",
        "text-danger-strong",
      );
      expect(trigger).not.toHaveClass("bg-surface");
      expect(trigger).not.toHaveClass("hover:border-border-field-hover");
    });

    it.each(["2", "1"] as const)(
      "sets the %s chevron on the border, which both levels draw",
      (energy) => {
        const { container } = render(Select, { props: { items, energy } });
        expect(container.querySelector("svg")).toHaveClass("-me-px");
      },
    );

    it("marks the trigger open, which the open look keys on", async () => {
      const user = userEvent.setup();
      render(Select, { props: { items } });
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("data-state", "closed");

      trigger.focus();
      await user.keyboard("{Enter}");
      expect(trigger).toHaveAttribute("data-state", "open");
    });

    it.each(["2", "1"] as const)(
      "greys a disabled %s trigger out as a box",
      (energy) => {
        render(Select, { props: { items, energy, disabled: true } });
        const trigger = screen.getByRole("combobox");
        expect(trigger).toHaveClass(
          "border-transparent",
          "bg-surface-muted",
          "text-disabled-fg",
        );
        expect(trigger).not.toHaveClass("hover:border-border-field-hover");
      },
    );

    it("rounds a pill fully at every size and level, dropping the size's radius", () => {
      for (const energy of ["2", "1"] as const) {
        for (const size of ["sm", "md", "lg"] as const) {
          const { unmount } = render(Select, {
            props: { items, energy, size, shape: "pill" },
          });
          const trigger = screen.getByRole("combobox");
          expect(
            [...trigger.classList].filter((c) => c.startsWith("rounded-")),
          ).toEqual(["rounded-full"]);
          unmount();
        }
      }
    });
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

  describe("clearable", () => {
    it("empties the value with its cross, focus going back to the trigger", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(Select, {
        props: {
          items,
          value: "two",
          placeholder: "Pick one",
          clearable: true,
          onValueChange,
        },
      });
      const trigger = screen.getByRole("combobox");

      await user.click(screen.getByRole("button", { name: "Remove Two" }));
      expect(onValueChange).toHaveBeenCalledWith("");
      expect(trigger).toHaveTextContent("Pick one");
      expect(trigger).toHaveFocus();
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("button", { name: /^Remove/ })).toBeNull();
    });

    it.each(["{Backspace}", "{Delete}"])(
      "empties it with %s on the trigger",
      async (key) => {
        const user = userEvent.setup();
        const onValueChange = vi.fn();
        render(Select, {
          props: { items, value: "two", clearable: true, onValueChange },
        });

        screen.getByRole("combobox").focus();
        await user.keyboard(key);
        expect(onValueChange).toHaveBeenCalledWith("");
      },
    );

    it("shows no cross with nothing chosen, while disabled, or unasked", () => {
      render(Select, { props: { items, clearable: true } });
      render(Select, {
        props: { items, value: "two", clearable: true, disabled: true },
      });
      render(Select, { props: { items, value: "two" } });
      expect(screen.queryByRole("button", { name: /^Remove/ })).toBeNull();
    });

    it("moves on past its cross when Tab commits a choice", async () => {
      const user = userEvent.setup();
      render(Select, {
        props: { items, placeholder: "Pick one", clearable: true },
      });
      const trigger = screen.getByRole("combobox");

      trigger.focus();
      await user.keyboard("{Enter}{ArrowDown}");
      await user.tab();
      expect(trigger).toHaveTextContent("One");
      expect(screen.getByRole("button", { name: "Remove One" }))
        .toHaveAttribute("tabindex", "-1");
      expect(document.activeElement).toBe(document.body);
    });

    // InputGroup squares the wrapper's corners, so the trigger has to inherit them.
    it("carries the corners on the wrapper, the trigger inheriting them", () => {
      render(Select, {
        props: { items, value: "two", clearable: true, shape: "pill" },
      });
      const trigger = screen.getByRole("combobox");
      expect(trigger.parentElement).toHaveClass("rounded-full");
      expect(
        [...trigger.classList].filter((c) => c.startsWith("rounded-")),
      ).toEqual(["rounded-[inherit]"]);
    });

    it("glazes its cross, taking back the padding at the end alone", () => {
      render(Select, { props: { items, value: "two", clearable: true } });
      const cross = screen.getByRole("button", { name: "Remove Two" });
      expect(cross).toHaveClass(
        "text-neutral-strong",
        "hover:bg-current/10",
        "active:bg-current/15",
        "p-1",
        "-me-1",
      );
      expect(cross).not.toHaveClass("-m-1");
    });

    it("sizes the trigger and its cross with the caller's class", () => {
      render(Select, {
        props: { items, value: "two", clearable: true, class: "w-56" },
      });
      const box = screen.getByRole("combobox").parentElement;
      expect(box).toHaveClass("w-56");
      expect(within(box!).getByRole("button", { name: "Remove Two" }))
        .toBeInTheDocument();
    });
  });
});
