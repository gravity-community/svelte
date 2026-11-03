import { render, within } from "@testing-library/svelte";
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

  it("marks the current page soft primary and the others ghost neutral", () => {
    const { getByRole } = render(NavRail, { props: { items, user } });
    const current = getByRole("link", { name: "Users" });
    expect(current).toHaveClass(
      "bg-primary-subtle",
      "text-primary-strong",
      "hover:bg-primary-muted",
      "forced-colors:border-[Highlight]",
    );
    const idle = getByRole("link", { name: "Inbox (unread)" });
    expect(idle).toHaveClass(
      "text-neutral-strong",
      "hover:bg-neutral-subtle",
      "active:bg-neutral-muted",
    );
    expect(idle.className).not.toMatch(/(^| )bg-/);
  });

  it("marks the current page by weight too, not by colour alone", () => {
    const { getByRole } = render(NavRail, { props: { items, user } });
    const current = getByRole("link", { name: "Users" });
    const idle = getByRole("link", { name: "Inbox (unread)" });
    expect(within(current).getByText("Users")).toHaveClass("font-semibold");
    expect(within(idle).getByText("Inbox")).toHaveClass("font-medium");
    expect(within(idle).getByText("Inbox")).not.toHaveClass("font-semibold");
  });

  it("renders logout as a ghost neutral Button", () => {
    const { getByRole } = render(NavRail, {
      props: { items, user, logoutAction: "/logout" },
    });
    const logout = getByRole("button", { name: "Log out" });
    expect(logout).toHaveAttribute("type", "submit");
    expect(logout).toHaveClass(
      "text-neutral-strong",
      "hover:bg-neutral-subtle",
      "size-8",
    );
    expect(logout.closest(".filled-well")).not.toBeNull();
  });
});
