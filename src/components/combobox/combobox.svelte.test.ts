import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { flushSync } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { Combobox, type ComboboxItem } from "@gravity-community/svelte";

const items = [
  {
    value: "27082440",
    title: "Interzone s.r.o.",
    meta: "IČO 270 82 440 · Praha 1",
  },
  {
    value: "06415822",
    title: "Interzone Holding a.s.",
    meta: "IČO 064 15 822 · Brno",
  },
  { value: "22691405", title: "Interzone, z. s.", disabled: true },
] satisfies ComboboxItem[];

describe("Combobox", () => {
  it("is a search field that controls the list", () => {
    render(Combobox, { props: { items, "aria-label": "Company" } });
    const field = screen.getByRole("combobox", { name: "Company" });
    expect(field).toHaveAttribute("type", "search");
    expect(field).toHaveAttribute("aria-expanded", "false");
  });

  it("lists the matches as two-line options once typing opens it", async () => {
    const user = userEvent.setup();
    render(Combobox, { props: { items, "aria-label": "Company" } });

    await user.type(screen.getByRole("combobox"), "Inter");
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent("Interzone s.r.o.");
    expect(options[0]).toHaveTextContent("IČO 270 82 440 · Praha 1");
    expect(options[2]).toHaveAttribute("data-disabled");
  });

  it("tells assistive tech which options are disabled", async () => {
    const user = userEvent.setup();
    render(Combobox, { props: { items, "aria-label": "Company" } });

    await user.type(screen.getByRole("combobox"), "Inter");
    const options = screen.getAllByRole("option");
    expect(options[0]).not.toHaveAttribute("aria-disabled");
    expect(options[2]).toHaveAttribute("aria-disabled", "true");
  });

  it("opens when text arrives without key presses, as a paste does", async () => {
    const user = userEvent.setup();
    render(Combobox, { props: { items, "aria-label": "Company" } });
    const field = screen.getByRole("combobox");

    field.focus();
    await user.paste("Interzone");
    expect(field).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("shows nothing while there are no matches", async () => {
    const user = userEvent.setup();
    render(Combobox, { props: { items: [], "aria-label": "Company" } });

    await user.type(screen.getByRole("combobox"), "Nowhere");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("binds the typed text and calls the field's own oninput", async () => {
    const user = userEvent.setup();
    const oninput = vi.fn();
    const bound = $state({ inputValue: "" });
    render(Combobox, {
      props: {
        items,
        oninput,
        get inputValue() {
          return bound.inputValue;
        },
        set inputValue(next: string) {
          bound.inputValue = next;
        },
      },
    });

    await user.type(screen.getByRole("combobox"), "270");
    expect(bound.inputValue).toBe("270");
    expect(oninput).toHaveBeenCalledTimes(3);
  });

  it("sets the field's text from inputValue", () => {
    const bound = $state({ inputValue: "Interzone" });
    render(Combobox, {
      props: {
        items,
        get inputValue() {
          return bound.inputValue;
        },
        set inputValue(next: string) {
          bound.inputValue = next;
        },
      },
    });
    const field = screen.getByRole("combobox") as HTMLInputElement;
    expect(field.value).toBe("Interzone");

    bound.inputValue = "";
    flushSync();
    expect(field.value).toBe("");
  });

  it("picks with the keyboard and closes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Combobox, { props: { items, onValueChange } });
    const field = screen.getByRole("combobox");

    await user.type(field, "Inter");
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("06415822");
    expect(field).toHaveAttribute("aria-expanded", "false");
  });

  describe("before the user moves to an option", () => {
    const highlighted = () =>
      screen.queryAllByRole("option").filter((o) =>
        o.hasAttribute("data-highlighted")
      );

    it("lists the matches with none active", async () => {
      const user = userEvent.setup();
      render(Combobox, { props: { items } });
      const field = screen.getByRole("combobox");

      await user.type(field, "Inter");
      expect(screen.getAllByRole("option")).toHaveLength(3);
      expect(highlighted()).toEqual([]);
      expect(field).not.toHaveAttribute("aria-activedescendant");
    });

    it("lands on the first match with ArrowDown and the last with ArrowUp", async () => {
      const user = userEvent.setup();
      render(Combobox, { props: { items } });
      const field = screen.getByRole("combobox");

      await user.type(field, "Inter");
      await user.keyboard("{ArrowDown}");
      const [first, second] = screen.getAllByRole("option");
      expect(highlighted()).toEqual([first]);
      expect(field).toHaveAttribute("aria-activedescendant", first!.id);

      // Typing again starts over; the last match is disabled, so ArrowUp skips it.
      await user.type(field, "z");
      expect(highlighted()).toEqual([]);
      await user.keyboard("{ArrowUp}");
      expect(highlighted()).toEqual([second]);
    });

    it("picks nothing with Enter", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(Combobox, { props: { items, onValueChange } });

      await user.type(screen.getByRole("combobox"), "Inter{Enter}");
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("commits the match moved to when Tab leaves, and only then", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(Combobox, { props: { items, onValueChange } });
      const field = screen.getByRole("combobox");

      await user.type(field, "Inter");
      await user.tab();
      expect(onValueChange).not.toHaveBeenCalled();

      await user.type(field, "z");
      await user.keyboard("{ArrowDown}");
      await user.tab();
      expect(onValueChange).toHaveBeenCalledWith("27082440");
    });
  });

  it("picks with the pointer", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(Combobox, { props: { items, onValueChange } });

    await user.type(screen.getByRole("combobox"), "Inter");
    await user.click(
      screen.getByRole("option", { name: /Interzone s\.r\.o\./ }),
    );
    expect(onValueChange).toHaveBeenCalledWith("27082440");
  });

  it("shows a spinner while loading and marks the field invalid", () => {
    const { container } = render(Combobox, {
      props: { items, loading: true, invalid: true, id: "company" },
    });
    const field = screen.getByRole("combobox");
    expect(field).toHaveAttribute("id", "company");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(container.querySelector(".animate-spin")).not.toBeNull();
  });

  it("sizes the whole field with the caller's class", () => {
    render(Combobox, { props: { items, class: "w-56" } });
    const box = screen.getByRole("combobox").closest(".w-56");
    expect(box?.querySelector("svg")).not.toBeNull();
  });

  it("stays closed while disabled", async () => {
    const user = userEvent.setup();
    render(Combobox, { props: { items, disabled: true } });
    const field = screen.getByRole("combobox");

    expect(field).toBeDisabled();
    await user.type(field, "Inter");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("leaves the field to the caller after a pick, unless it holds picks", async () => {
    const user = userEvent.setup();
    render(Combobox, { props: { items, "aria-label": "Company" } });
    const field = screen.getByRole("combobox") as HTMLInputElement;

    await user.type(field, "Inter");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(field.value).toBe("Interzone s.r.o.");
    expect(field).not.toHaveAttribute("readonly");
    expect(screen.queryByRole("button", { name: /^Remove/ })).toBeNull();
  });

  describe("holding a pick", () => {
    type User = ReturnType<typeof userEvent.setup>;

    async function pick(user: User, props: Record<string, unknown> = {}) {
      // Descriptors, not a spread: a spread would read a binding's getter once and drop its setter.
      const base = { items, "aria-label": "Company", holdPick: true };
      render(Combobox, {
        props: Object.defineProperties(
          base,
          Object.getOwnPropertyDescriptors(props),
        ),
      });
      const field = screen.getByRole("combobox") as HTMLInputElement;
      await user.type(field, "Inter");
      await user.keyboard("{ArrowDown}{Enter}");
      return field;
    }

    it("shows the item in place of the text, focus staying in the field", async () => {
      const user = userEvent.setup();
      const field = await pick(user);

      expect(field).toHaveFocus();
      expect(field).toHaveAttribute("readonly");
      expect(field).toHaveAttribute("aria-expanded", "false");
      expect(field.value).toBe("Interzone s.r.o.");
      expect(field).toHaveAccessibleDescription("IČO 270 82 440 · Praha 1");
      const remove = screen.getByRole("button", {
        name: "Remove Interzone s.r.o.",
      });
      expect(remove).toHaveAttribute("type", "button");
      expect(remove).toHaveAttribute("tabindex", "-1");
    });

    it("gives the typed text and its matches back when the cross removes it", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onOpenChange = vi.fn();
      const field = await pick(user, { onValueChange, onOpenChange });
      onOpenChange.mockClear();

      await user.click(
        screen.getByRole("button", { name: "Remove Interzone s.r.o." }),
      );
      expect(onValueChange).toHaveBeenLastCalledWith("");
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(field).toHaveFocus();
      expect(field).not.toHaveAttribute("readonly");
      expect(field.value).toBe("Inter");
      expect(field).toHaveAttribute("aria-expanded", "true");
      expect(screen.getAllByRole("option")).toHaveLength(3);
      expect(screen.queryByRole("button", { name: /^Remove/ })).toBeNull();
    });

    it.each(["{Backspace}", "{Delete}"])("removes it with %s", async (key) => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const field = await pick(user, { onValueChange });

      await user.keyboard(key);
      expect(onValueChange).toHaveBeenLastCalledWith("");
      expect(field.value).toBe("Inter");
      expect(field).toHaveAttribute("aria-expanded", "true");
    });

    it.each([
      ["a typed character", "x", "x"],
      ["an AltGr character", "{Control>}{Alt>}@{/Alt}{/Control}", "@"],
    ])("starts a new search with %s", async (_, keys, text) => {
      const user = userEvent.setup();
      const oninput = vi.fn();
      const bound = $state({ inputValue: "" });
      const field = await pick(user, {
        oninput,
        get inputValue() {
          return bound.inputValue;
        },
        set inputValue(next: string) {
          bound.inputValue = next;
        },
      });
      oninput.mockClear();

      await user.keyboard(keys);
      expect(bound.inputValue).toBe(text);
      expect(field.value).toBe(text);
      expect(field).not.toHaveAttribute("readonly");
      expect(oninput).toHaveBeenCalledTimes(1);
    });

    it("starts a new search with pasted text", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const oninput = vi.fn();
      const field = await pick(user, { onValueChange, oninput });
      oninput.mockClear();

      await user.paste("Holding");
      expect(onValueChange).toHaveBeenLastCalledWith("");
      expect(field.value).toBe("Holding");
      expect(field).not.toHaveAttribute("readonly");
      expect(field).toHaveAttribute("aria-expanded", "true");
      expect(oninput).toHaveBeenCalledTimes(1);
    });

    it("leaves Enter to the form and other keys to the browser, never opening the list", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const field = await pick(user, { onOpenChange });
      onOpenChange.mockClear();
      const prevented: Record<string, boolean> = {};
      const listener = (
        event: KeyboardEvent,
      ) => (prevented[event.key] = event.defaultPrevented);
      document.addEventListener("keydown", listener);

      await user.keyboard("{Enter}{F5}{Meta>}c{/Meta}{Alt>}{ArrowDown}{/Alt}");
      document.removeEventListener("keydown", listener);
      expect(prevented.Enter).toBe(false);
      expect(prevented.F5).toBe(false);
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(field).toHaveAttribute("aria-expanded", "false");
      expect(field.value).toBe("Interzone s.r.o.");
    });

    it("moves on past its cross when Tab commits the pick", async () => {
      const user = userEvent.setup();
      render(Combobox, { props: { items, holdPick: true } });
      const field = screen.getByRole("combobox") as HTMLInputElement;

      await user.type(field, "Inter");
      await user.keyboard("{ArrowDown}");
      await user.tab();
      expect(field.value).toBe("Interzone s.r.o.");
      expect(field).toHaveAttribute("readonly");
      expect(document.activeElement).toBe(document.body);
    });

    it("shows an item picked from outside, closing the list it finds open", () => {
      const onOpenChange = vi.fn();
      const bound = $state({ open: true });
      render(Combobox, {
        props: {
          items,
          value: "06415822",
          holdPick: true,
          onOpenChange,
          get open() {
            return bound.open;
          },
          set open(next: boolean) {
            bound.open = next;
          },
        },
      });
      flushSync();
      const field = screen.getByRole("combobox");
      expect(field).toHaveValue("Interzone Holding a.s.");
      expect(field).toHaveAttribute("aria-expanded", "false");
      expect(bound.open).toBe(false);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(screen.getByText("IČO 064 15 822 · Brno")).toBeInTheDocument();
    });

    it("spins in place of the cross while loading", () => {
      const { container } = render(Combobox, {
        props: { items, value: "27082440", holdPick: true, loading: true },
      });
      expect(container.querySelectorAll(".animate-spin")).toHaveLength(1);
      expect(screen.queryByRole("button", { name: /^Remove/ })).toBeNull();
    });

    it("keeps the pick while disabled", () => {
      render(Combobox, {
        props: { items, value: "27082440", holdPick: true, disabled: true },
      });
      expect(screen.getByRole("combobox")).toHaveValue("Interzone s.r.o.");
      expect(screen.queryByRole("button", { name: /^Remove/ })).toBeNull();
    });
  });
});
