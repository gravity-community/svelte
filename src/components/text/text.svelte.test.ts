import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { Text } from "@gravity-community/svelte";

// text-fg survives only while tailwind-merge reads text-<role> as a font size.
describe("Text", () => {
  it("renders a role as its heading level in the role's family", () => {
    const { container } = render(Text, { props: { type: "display" } });
    expect(container.querySelector("h1")).toHaveClass(
      "text-fg",
      "font-display",
      "text-display",
    );
  });

  it("renders the element named by as", () => {
    const { container } = render(Text, { props: { type: "heading", as: "p" } });
    expect(container.querySelector("h3")).toBeNull();
    expect(container.querySelector("p")).toHaveClass(
      "text-fg",
      "font-sans",
      "text-heading",
    );
  });
});
