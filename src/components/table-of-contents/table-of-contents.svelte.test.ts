import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { TableOfContents } from "@gravity-community/svelte";

const items = [
  { id: "a", label: "Alpha" },
  { id: "b", label: "Beta" },
];

describe("TableOfContents", () => {
  it("renders every item", () => {
    const { getByText } = render(TableOfContents, { props: { items } });
    expect(getByText("Alpha")).toBeInTheDocument();
    expect(getByText("Beta")).toBeInTheDocument();
  });

  it("marks the controlled active item with aria-current", () => {
    const { getByText } = render(TableOfContents, {
      props: { items, activeId: "b" },
    });
    expect(getByText("Beta").closest("a")?.getAttribute("aria-current")).toBe(
      "location",
    );
    expect(
      getByText("Alpha").closest("a")?.getAttribute("aria-current"),
    ).toBeNull();
  });
});
