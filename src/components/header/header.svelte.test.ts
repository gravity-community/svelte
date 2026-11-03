import { render, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { createRawSnippet, tick } from "svelte";
import { describe, expect, it } from "vitest";
import { Header } from "@gravity-community/svelte";

const brand = createRawSnippet(() => ({ render: () => "<span>eurcor</span>" }));
const links = [
  { href: "#search", label: "Search", active: true },
  { href: "#docs", label: "Docs" },
];

describe("Header", () => {
  it("marks the active link as the current page", () => {
    const { getByRole } = render(Header, { props: { brand, links } });
    expect(getByRole("link", { name: "Search" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("opens the drawer from the toggle and closes it again", async () => {
    const { getByRole, queryByRole } = render(Header, {
      props: { brand, links },
    });
    getByRole("button", { name: "Open menu" }).click();
    await tick();
    expect(getByRole("dialog", { name: "Menu" })).toBeInTheDocument();
    expect(getByRole("button", { name: "Close menu" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    getByRole("button", { name: "Close menu" }).click();
    await waitFor(() => expect(queryByRole("dialog")).toBeNull());
  });

  it("returns focus to the toggle when the drawer closes", async () => {
    const { getByRole, queryByRole } = render(Header, {
      props: { brand, links },
    });
    await userEvent.click(getByRole("button", { name: "Open menu" }));
    await waitFor(() =>
      expect(getByRole("dialog", { name: "Menu" })).toHaveFocus()
    );

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(queryByRole("dialog")).toBeNull());
    expect(getByRole("button", { name: "Open menu" })).toHaveFocus();
    await waitFor(() => expect(document.body.style.pointerEvents).toBe(""));
  });

  it("hides the navigation when showNav is false", () => {
    const { queryByRole } = render(Header, {
      props: { brand, links, showNav: false },
    });
    expect(queryByRole("button", { name: "Open menu" })).toBeNull();
    expect(queryByRole("link", { name: "Search" })).toBeNull();
  });
});
