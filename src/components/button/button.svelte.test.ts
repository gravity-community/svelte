import { render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { Button } from "@gravity-community/svelte";

const icon = createRawSnippet(() => ({ render: () => "<svg></svg>" }));
const label = createRawSnippet(() => ({
  render: () => "<span>04 Evidence</span>",
}));

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
        variant: "outline",
        "aria-label": "Next",
      },
    });
    expect(getByRole("link", { name: "Next" })).toHaveClass(
      "aria-disabled:bg-surface-muted",
      "aria-disabled:text-disabled-fg",
      "aria-disabled:pointer-events-none",
      "aria-disabled:border-border",
    );
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
});
