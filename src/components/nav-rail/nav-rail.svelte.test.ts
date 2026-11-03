import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { NavRail, type NavRailItem } from "@gravity-community/svelte";

const items: NavRailItem[] = [
  { href: "/inbox", label: "Inbox", glyph: "archive", dot: true },
  { href: "/users", label: "Users", glyph: "users", active: true },
];

const user = {
  id: "8c4e1a70",
  name: "Garson Poole",
  role: "Administrator",
  avatarVariant: "mono",
} as const;

describe("NavRail", () => {
  it("marks the active item and names unread ones", () => {
    const { getByRole } = render(NavRail, { props: { items, user } });
    expect(getByRole("link", { name: "Users" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(getByRole("link", { name: "Inbox (unread)" })).toBeInTheDocument();
  });

  it("renders the Profile tab and logout only when given their URLs", () => {
    const { queryByRole, unmount } = render(NavRail, {
      props: { items, user },
    });
    expect(queryByRole("link", { name: "Profile" })).toBeNull();
    expect(queryByRole("button", { name: "Log out" })).toBeNull();
    unmount();

    const { getByRole } = render(NavRail, {
      props: {
        items,
        user,
        profileHref: "/users/me",
        profileActive: true,
        logoutAction: "/logout",
      },
    });
    expect(getByRole("link", { name: "Profile" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(getByRole("button", { name: "Log out" }).closest("form"))
      .toHaveAttribute("action", "/logout");
  });
});
