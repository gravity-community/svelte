import { render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { Tab } from "@gravity-community/svelte";

const label = createRawSnippet(() => ({ render: () => "<span>Users</span>" }));

describe("Tab", () => {
  it("marks the active link as the current page", () => {
    const { getByRole } = render(Tab, {
      props: { href: "?tab=users", active: true, children: label },
    });
    const link = getByRole("link", { name: "Users" });
    expect(link).toHaveAttribute("href", "?tab=users");
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("disables a link with aria-disabled and drops its href", () => {
    const { getByRole } = render(Tab, {
      props: { href: "?tab=users", disabled: true, children: label },
    });
    const link = getByRole("link", { name: "Users" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).not.toHaveAttribute("href");
  });

  it("renders a type=button button without href", () => {
    const { getByRole } = render(Tab, {
      props: { disabled: true, children: label },
    });
    const button = getByRole("button", { name: "Users" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute("aria-current");
  });
});
