import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { Spinner } from "@gravity-community/svelte";

describe("Spinner", () => {
  it("spins at the 16px preset by default", () => {
    const { container } = render(Spinner);
    expect(container.querySelector("svg")).toHaveClass(
      "size-4",
      "animate-spin",
    );
  });

  it("sizes to the size preset", () => {
    const { container } = render(Spinner, { props: { size: "lg" } });
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("size-6", "animate-spin");
    expect(svg).not.toHaveClass("size-4");
  });

  it("lets a caller's size replace the preset", () => {
    const { container } = render(Spinner, { props: { class: "size-full" } });
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("size-full", "animate-spin");
    expect(svg).not.toHaveClass("size-4");
  });
});
