import { render, within } from "@testing-library/svelte";
import { type ComponentProps, createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { Button } from "@gravity-community/svelte";
import Parts from "../parts-harness.svelte";

const icon = createRawSnippet(() => ({ render: () => "<svg></svg>" }));
const label = createRawSnippet(() => ({
  render: () => "<span>04 Evidence</span>",
}));

const partIn = (props: ComponentProps<typeof Parts>) => {
  const { container } = render(Parts, { props });
  return within(container).getByTestId("button");
};

const alone = (props: ComponentProps<typeof Button>) =>
  render(Button, { props }).container.firstElementChild as HTMLElement;

describe("Button", () => {
  it("renders a button by default", () => {
    const { getByRole } = render(Button, { props: { "aria-label": "Save" } });
    expect(getByRole("button", { name: "Save" })).toBeEnabled();
  });

  it("renders a link with href", () => {
    const { getByRole } = render(Button, {
      props: { href: "/next", "aria-label": "Next" },
    });
    expect(getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/next",
    );
  });

  it("disables a link with aria-disabled and drops its href", () => {
    const { getByRole } = render(Button, {
      props: { href: "/next", disabled: true, "aria-label": "Next" },
    });
    const link = getByRole("link", { name: "Next" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).not.toHaveAttribute("href");
  });

  it("renders a disabled link flat, like a disabled button", () => {
    const { getByRole } = render(Button, {
      props: {
        href: "/next",
        disabled: true,
        energy: "1",
        "aria-label": "Next",
      },
    });
    expect(getByRole("link", { name: "Next" })).toHaveClass(
      "aria-disabled:bg-surface-muted",
      "aria-disabled:text-disabled-fg",
      "aria-disabled:pointer-events-none",
      "aria-disabled:forced-colors:text-[GrayText]",
      "aria-disabled:forced-colors:border-[GrayText]",
    );
  });

  it("defaults to solid primary, its content cut out of the fill", () => {
    const { getByRole } = render(Button, { props: { "aria-label": "Save" } });
    expect(getByRole("button", { name: "Save" })).toHaveClass(
      "bg-primary-solid",
      "text-on-primary",
      "hover:bg-primary-hover",
      "active:brightness-90",
    );
  });

  // Decay isn't automatic: each level renders exactly the classes it is given.
  it.each(
    [
      ["3", ["bg-danger-solid", "text-on-danger"]],
      [
        "2",
        ["bg-danger-subtle", "text-danger-strong", "hover:bg-danger-muted"],
      ],
      [
        "1",
        [
          "bg-plate",
          "text-danger-strong",
          "hover:bg-danger-subtle",
          "active:bg-danger-muted",
        ],
      ],
      [
        "0",
        [
          "text-danger-strong",
          "hover:bg-danger-subtle",
          "held:bg-danger-subtle",
        ],
      ],
    ] as const,
  )("renders %s with its own recipe", (energy, classes) => {
    const { getByRole } = render(Button, {
      props: { energy, intent: "danger", "aria-label": "Delete" },
    });
    expect(getByRole("button", { name: "Delete" })).toHaveClass(...classes);
  });

  it.each(
    [
      ["-1", "2"],
      ["-2", "1"],
      ["-3", "0"],
      ["+1", "3"],
    ] as const,
  )("shifts %s from solid to the same look as %s", (shift, level) => {
    const { getByRole } = render(Button, {
      props: { energy: shift, intent: "danger", "aria-label": "Shifted" },
    });
    render(Button, {
      props: { energy: level, intent: "danger", "aria-label": "Absolute" },
    });
    expect(getByRole("button", { name: "Shifted" }).className).toBe(
      getByRole("button", { name: "Absolute" }).className,
    );
  });

  it.each(["2", "1", "0"] as const)(
    "inks neutral %s in neutral-strong",
    (energy) => {
      const { getByRole } = render(Button, {
        props: { energy, intent: "neutral", "aria-label": "Cancel" },
      });
      const button = getByRole("button", { name: "Cancel" });
      expect(button).toHaveClass("text-neutral-strong");
      expect(button).not.toHaveClass("text-fg");
    },
  );

  it("gives ghost no resting fill or border", () => {
    const { getByRole } = render(Button, {
      props: { energy: "0", intent: "accent", "aria-label": "More" },
    });
    const button = getByRole("button", { name: "More" });
    expect(button).toHaveClass("bg-transparent", "text-accent-strong");
    expect(button.className).not.toMatch(/(^| )(bg|border)-accent-/);
  });

  it("draws faint as the plate, with no edge", () => {
    const { getByRole } = render(Button, {
      props: { energy: "1", intent: "primary", "aria-label": "Edit" },
    });
    const button = getByRole("button", { name: "Edit" });
    expect(button).toHaveClass("bg-plate", "text-primary-strong");
    expect(button).not.toHaveClass("border");
    expect(button.className).not.toMatch(/(^| )border-primary-/);
  });

  it.each(["1", "0"] as const)(
    "keeps the soft fill on a held %s, hover and press included",
    (energy) => {
      const { getByRole } = render(Button, {
        props: {
          energy,
          intent: "neutral",
          "aria-pressed": true,
          "aria-label": "Bold",
        },
      });
      expect(getByRole("button", { name: "Bold" })).toHaveClass(
        "held:bg-neutral-subtle",
        "held:hover:bg-neutral-muted",
        "held:active:bg-neutral-muted",
        "held:forced-colors:border-[Highlight]",
      );
    },
  );

  it.each(["3", "2"] as const)(
    "holds no fill on %s",
    (energy) => {
      const { getByRole } = render(Button, {
        props: { energy, "aria-expanded": true, "aria-label": "Menu" },
      });
      expect(getByRole("button", { name: "Menu" }).className).not.toContain(
        "held:",
      );
    },
  );

  it.each(["3", "2", "1"] as const)(
    "disables %s to the grey box",
    (energy) => {
      const { getByRole } = render(Button, {
        props: { energy, disabled: true, "aria-label": "Save" },
      });
      expect(getByRole("button", { name: "Save" })).toHaveClass(
        "disabled:bg-surface-muted",
        "disabled:text-disabled-fg",
      );
    },
  );

  it("disables ghost to its ink alone, with no box", () => {
    const { getByRole } = render(Button, {
      props: { energy: "0", disabled: true, "aria-label": "Save" },
    });
    const button = getByRole("button", { name: "Save" });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:text-disabled-fg");
    expect(button).not.toHaveClass("disabled:bg-surface-muted");
  });

  it.each(["sm", "md", "lg"] as const)(
    "keeps leading-none after the %s font size",
    (size) => {
      const { getByRole } = render(Button, {
        props: { size, "aria-label": "Save" },
      });
      expect(getByRole("button", { name: "Save" })).toHaveClass(
        "leading-none",
      );
    },
  );

  it("renders a circle when leadingIcon is the only content", () => {
    const { getByRole } = render(Button, {
      props: { leadingIcon: icon, "aria-label": "Search" },
    });
    const button = getByRole("button", { name: "Search" });
    expect(button).toHaveClass("rounded-full", "size-12");
    expect(button.querySelector("svg")).not.toBeNull();
  });

  it("renders trailingIcon after the label, sized like leadingIcon", () => {
    const { getByText } = render(Button, {
      props: { trailingIcon: icon, children: label },
    });
    const text = getByText("04 Evidence");
    expect(text.previousElementSibling).toBeNull();
    expect(text.nextElementSibling).toHaveClass("size-[18px]");
    expect(text.nextElementSibling?.querySelector("svg")).not.toBeNull();
  });

  it("rounds a pill fully instead of the size's corners", () => {
    const { getByRole } = render(Button, {
      props: { shape: "pill", "aria-label": "Next" },
    });
    const button = getByRole("button", { name: "Next" });
    expect(button).toHaveClass("rounded-full");
    expect(button).not.toHaveClass("rounded-xl");
  });

  it.each(["rounded", "pill"] as const)(
    "keeps an icon-only button round with shape %s",
    (shape) => {
      const { getByRole } = render(Button, {
        props: { shape, leadingIcon: icon, "aria-label": "Search" },
      });
      expect(getByRole("button", { name: "Search" })).toHaveClass(
        "rounded-full",
        "size-12",
      );
    },
  );

  it("merges a caller class over the size classes", () => {
    const { getByRole } = render(Button, {
      props: { "aria-label": "Back", class: "size-8" },
    });
    const button = getByRole("button", { name: "Back" });
    expect(button).toHaveClass("size-8");
    expect(button).not.toHaveClass("h-12");
  });

  it("disables while loading but keeps the enabled look", () => {
    const { getByRole } = render(Button, {
      props: { loading: true, "aria-label": "Busy" },
    });
    const button = getByRole("button", { name: "Busy" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button.className).not.toContain("disabled:");
  });

  it("keeps the enabled look on a loading link", () => {
    const { getByRole } = render(Button, {
      props: { href: "/next", loading: true, "aria-label": "Busy" },
    });
    const link = getByRole("link", { name: "Busy" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link.className).not.toContain("disabled:");
  });

  it("accepts gravity={false} without forwarding it", () => {
    const { getByRole } = render(Button, {
      props: { gravity: false, "aria-label": "Plain" },
    });
    const button = getByRole("button", { name: "Plain" });
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute("gravity");
  });

  it("binds ref to the rendered element", () => {
    let ref: HTMLElement | null = null;
    const { getByRole } = render(Button, {
      props: {
        "aria-label": "Save",
        get ref() {
          return ref;
        },
        set ref(next: HTMLElement | null) {
          ref = next;
        },
      },
    });
    expect(ref).toBe(getByRole("button", { name: "Save" }));
  });

  describe("in an energy scope", () => {
    it.each(["3", "2", "1", "0"] as const)(
      "takes level %s from the scope when given no energy",
      (level) => {
        expect(partIn({ scopes: [{ level }] }).className).toBe(
          alone({ energy: level }).className,
        );
      },
    );

    it("still counts a shift from the potential", () => {
      const part = partIn({
        scopes: [{ level: "0" }],
        button: { energy: "-1" },
      });
      expect(part.className).toBe(alone({ energy: "2" }).className);
    });

    it("ignores the scope for an absolute level", () => {
      const part = partIn({
        scopes: [{ level: "0" }],
        button: { energy: "3" },
      });
      expect(part).toHaveClass("bg-primary-solid", "text-on-primary");
    });

    it("glazes soft deep on a fill of its own intent", () => {
      const part = partIn({
        scopes: [{ level: "2", fill: "danger" }],
        button: { intent: "danger" },
      });
      expect(part).toHaveClass(
        "bg-danger-deep/75",
        "hover:bg-danger-deep",
        "active:bg-danger-deep",
        "text-danger-strong",
      );
      expect(part).not.toHaveClass("bg-danger-subtle", "hover:bg-danger-muted");
    });

    it("keeps its own soft fill on a fill of another intent", () => {
      const part = partIn({ scopes: [{ level: "2", fill: "danger" }] });
      expect(part).toHaveClass("bg-primary-subtle");
      expect(part.className).not.toContain("-deep");
    });

    it("glazes deep only at soft", () => {
      const part = partIn({
        scopes: [{ level: "2", fill: "primary" }],
        button: { energy: "1" },
      });
      expect(part).toHaveClass("bg-plate");
      expect(part.className).not.toContain("-deep");
    });

    it("takes its own default inside a reset scope", () => {
      const part = partIn({ scopes: [{ level: "0" }, undefined] });
      expect(part.className).toBe(alone({}).className);
    });

    it("follows the scope when its level changes", async () => {
      const { container, rerender } = render(Parts, {
        props: { scopes: [{ level: "2" }] },
      });
      const part = within(container).getByTestId("button");
      expect(part).toHaveClass("bg-primary-subtle");
      await rerender({ scopes: [{ level: "1" }] });
      expect(part).toHaveClass("bg-plate");
      expect(part).not.toHaveClass("bg-primary-subtle");
    });
  });
});
