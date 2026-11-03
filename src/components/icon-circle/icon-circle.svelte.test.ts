import { render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { IconCircle, type IconCircleIntent } from "@gravity-community/svelte";

const glyph = createRawSnippet(() => ({ render: () => "<svg></svg>" }));

const intents: IconCircleIntent[] = [
  "neutral",
  "info",
  "success",
  "warning",
  "danger",
];

describe("IconCircle", () => {
  it("shows the text instead of the children", async () => {
    const { container, getByText, rerender } = render(IconCircle, {
      props: { children: glyph },
    });
    expect(container.querySelector("svg")).not.toBeNull();
    await rerender({ text: "99+" });
    expect(getByText("99+")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
  });

  it.each(intents)("tints the %s disc with its subtle background", (intent) => {
    const { container } = render(IconCircle, { props: { intent } });
    const circle = container.firstElementChild;
    expect([...(circle?.classList ?? [])].filter((c) => c.startsWith("bg-")))
      .toEqual([`bg-${intent}-subtle`]);
  });

  it("defaults to the neutral disc", () => {
    const { container } = render(IconCircle);
    expect(container.firstElementChild).toHaveClass(
      "bg-neutral-subtle",
      "text-fg",
    );
  });

  it("hides the circle from assistive tech", () => {
    const { container } = render(IconCircle, { props: { text: "3" } });
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
