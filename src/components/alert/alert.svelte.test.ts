import { render } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { type ComponentProps, createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "@gravity-community/svelte";

const intents = ["danger", "success", "info", "warning"] as const;

const message = createRawSnippet(() => ({
  render: () => "<span>Enter a valid email address.</span>",
}));

const setup = (props: Partial<ComponentProps<typeof Alert>> = {}) =>
  render(Alert, { props: { children: message, ...props } });

const alertOf = (props: Partial<ComponentProps<typeof Alert>> = {}) => {
  const { container } = setup(props);
  const box = container.firstElementChild as HTMLElement;
  return { box, icon: box.querySelector("svg") as SVGElement };
};

const classesOf = (element: Element, prefix: string) =>
  [...element.classList].filter((c) => c.startsWith(prefix));

describe("Alert", () => {
  it("announces the danger intent as an alert", () => {
    expect(setup().getByRole("alert")).toHaveTextContent(
      "Enter a valid email address.",
    );
  });

  it.each(["success", "info", "warning"] as const)(
    "keeps the %s intent out of live regions",
    (intent) => {
      expect(setup({ intent }).queryByRole("alert")).toBeNull();
    },
  );

  it.each(intents)(
    "fills the soft %s box as a filled well, with the strong ink throughout",
    (intent) => {
      const { box, icon } = alertOf({ intent });
      expect(box).toHaveClass(
        "filled-well",
        "forced-colors:border",
        `text-${intent}-strong`,
      );
      expect(classesOf(box, "bg-")).toEqual([`bg-${intent}-subtle`]);
      expect(classesOf(icon, "text-")).toEqual([]);
    },
  );

  it.each(intents)(
    "lays the faint %s box on the plate and steps its icon down",
    (intent) => {
      const { box, icon } = alertOf({ intent, energy: "1" });
      expect(box).toHaveClass(
        "filled-well",
        "forced-colors:border",
        `text-${intent}-strong`,
      );
      expect(classesOf(box, "bg-")).toEqual(["bg-plate"]);
      expect(icon).toHaveClass(`text-${intent}-glyph-faint`);
    },
  );

  it.each(intents)(
    "drops the ghost %s box, keeps its padding and steps its icon down",
    (intent) => {
      const { box, icon } = alertOf({ intent, energy: "0" });
      expect(classesOf(box, "bg-")).toEqual([]);
      expect(box).not.toHaveClass("filled-well");
      expect(box).not.toHaveClass("forced-colors:border");
      expect(box).toHaveClass("px-3", "py-2.5", `text-${intent}-strong`);
      expect(icon).toHaveClass(`text-${intent}-glyph-ghost`);
    },
  );
});

describe("Alert close", () => {
  it("shows no close without onclose", () => {
    expect(setup().queryByRole("button")).toBeNull();
  });

  it("dismisses through its close", async () => {
    const onclose = vi.fn();
    const { getByRole } = setup({ onclose });
    await userEvent.click(getByRole("button", { name: "Dismiss" }));
    expect(onclose).toHaveBeenCalledOnce();
  });

  it.each(["2", "1", "0"] as const)(
    "keeps the close ghost neutral at %s",
    (energy) => {
      const { getByRole } = setup({ energy, onclose: () => {} });
      const close = getByRole("button", { name: "Dismiss" });
      expect(classesOf(close, "bg-").filter((c) => c !== "bg-transparent"))
        .toEqual([]);
      expect(close).toHaveClass("text-neutral-strong");
    },
  );

  it("keeps the Alert one line tall around its close", () => {
    const { getByRole } = setup({ onclose: () => {} });
    expect(getByRole("button", { name: "Dismiss" })).toHaveClass(
      "-my-2",
      "ms-auto",
    );
  });
});
