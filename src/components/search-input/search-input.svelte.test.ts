import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { SearchInput } from "@gravity-community/svelte";
import { GLYPHS } from "../icon/glyphs.ts";

const field = (c: HTMLElement) => c.querySelector("input") as HTMLInputElement;

describe("SearchInput", () => {
  it("renders a native search input", () => {
    const { container } = render(SearchInput, {
      props: { placeholder: "Find a subject" },
    });
    expect(field(container).type).toBe("search");
    expect(field(container).placeholder).toBe("Find a subject");
  });

  it("always renders the magnifying glass", () => {
    const { container } = render(SearchInput, { props: {} });
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();

    // jsdom re-serializes self-closing SVG tags, so compare against the glyph parsed the same way.
    const probe = document.createElement("div");
    probe.innerHTML = `<svg>${GLYPHS.search}</svg>`;
    expect(svg?.innerHTML).toBe(probe.querySelector("svg")?.innerHTML);
  });

  it("stays type=search even when a caller tries to override it", () => {
    const { container } = render(SearchInput, {
      // deno-lint-ignore no-explicit-any
      props: { type: "text" } as any,
    });
    expect(field(container).type).toBe("search");
  });

  it("forwards arbitrary input attributes to the real element", () => {
    const { container } = render(SearchInput, {
      props: { name: "q", autocomplete: "off", "aria-controls": "results" },
    });
    const input = field(container);
    expect(input.getAttribute("name")).toBe("q");
    expect(input.getAttribute("autocomplete")).toBe("off");
    expect(input.getAttribute("aria-controls")).toBe("results");
  });

  it("disables the underlying input", () => {
    const { container } = render(SearchInput, { props: { disabled: true } });
    expect(field(container).disabled).toBe(true);
  });

  it("grows neither a reveal toggle nor number steppers", () => {
    const { container } = render(SearchInput, { props: {} });
    expect(container.querySelector("button")).toBeNull();
  });

  it("defaults to tinted and renders outline as a bordered pill", async () => {
    const { container, rerender } = render(SearchInput, { props: {} });
    const shell = field(container).parentElement as HTMLElement;
    expect(shell).toHaveClass("bg-field-tinted");

    await rerender({ variant: "outline", size: "sm" });
    expect(shell).toHaveClass("rounded-full", "border-border-interactive");
    expect(shell).not.toHaveClass("rounded-[10px]");
  });
});
