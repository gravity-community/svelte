import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { Icon } from "@gravity-community/svelte";

describe("Icon", () => {
  // Tailwind emits .size-4 after .size-3, so a leftover preset would win.
  it("lets a smaller caller size replace the preset", () => {
    const { container } = render(Icon, {
      props: { glyph: "check", class: "size-3" },
    });
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("size-3");
    expect(svg).not.toHaveClass("size-4");
  });

  it("shows the count's number", () => {
    const { getByText } = render(Icon, { props: { glyph: "mail", count: 3 } });
    expect(getByText("3")).toBeInTheDocument();
  });

  it("keeps the bare svg root for a zero count", () => {
    const { container } = render(Icon, { props: { glyph: "mail", count: 0 } });
    expect(container.firstElementChild).toBeInstanceOf(SVGSVGElement);
  });

  it("draws the status dot", () => {
    const { container } = render(Icon, {
      props: { glyph: "mail", status: true },
    });
    const dot = container.querySelector("span > span");
    expect(dot).toBeEmptyDOMElement();
    expect(dot).toHaveClass("bg-primary-solid");
  });

  it("lets the count win over the status dot", () => {
    const { container } = render(Icon, {
      props: { glyph: "mail", count: 3, status: true },
    });
    const indicators = container.querySelectorAll("span > span");
    expect(indicators).toHaveLength(1);
    expect(indicators[0]).toHaveTextContent("3");
  });

  it("sizes the box, not the svg, with the caller's class", () => {
    const { container } = render(Icon, {
      props: { glyph: "mail", count: 3, class: "size-6" },
    });
    const box = container.firstElementChild;
    expect(box).toHaveClass("size-6");
    expect(box).not.toHaveClass("size-4");
    expect(box?.querySelector("svg")).toHaveClass("size-full");
  });

  it("keeps the rest props on the svg inside the hidden box", () => {
    const { container, getByTestId } = render(Icon, {
      props: { glyph: "mail", count: 3, "data-testid": "icon" },
    });
    expect(getByTestId("icon")).toBeInstanceOf(SVGSVGElement);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("swaps the pill for the dot when the count drops to zero", async () => {
    const { container, rerender } = render(Icon, {
      props: { glyph: "mail", count: 3 },
    });
    await rerender({ count: 0, status: true });
    const indicators = container.querySelectorAll("span > span");
    expect(indicators).toHaveLength(1);
    expect(indicators[0]).toBeEmptyDOMElement();
  });
});
