import { render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { Tabs } from "@gravity-community/svelte";

const links = createRawSnippet(() => ({
  render: () => '<a href="?tab=users" aria-current="page">Users</a>',
}));

describe("Tabs", () => {
  it("renders a navigation landmark, not an ARIA tablist", () => {
    const { getByRole, queryByRole } = render(Tabs, {
      props: { "aria-label": "Sections", children: links },
    });
    const nav = getByRole("navigation", { name: "Sections" });
    expect(nav).toContainElement(getByRole("link", { name: "Users" }));
    expect(queryByRole("tablist")).toBeNull();
  });
});
