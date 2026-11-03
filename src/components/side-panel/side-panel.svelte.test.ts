import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { SidePanel } from "@gravity-community/svelte";

const body = createRawSnippet(() => ({ render: () => "<p>Body</p>" }));
const footer = createRawSnippet(() => ({
  render: () => "<button>Save</button>",
}));

describe("SidePanel", () => {
  it("is a complementary region named by its title", () => {
    const { getByRole } = render(SidePanel, {
      props: { title: "Holding", children: body },
    });
    const panel = getByRole("complementary", { name: "Holding" });
    expect(panel).toContainElement(getByRole("heading", { name: "Holding" }));
  });

  it("renders the footer only when given", () => {
    const { queryByRole, rerender } = render(SidePanel, {
      props: { title: "Holding", children: body },
    });
    expect(queryByRole("button", { name: "Save" })).toBeNull();
    rerender({ title: "Holding", children: body, footer });
    expect(queryByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});
