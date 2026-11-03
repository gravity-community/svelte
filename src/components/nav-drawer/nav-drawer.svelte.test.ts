import { render, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NavDrawer } from "@gravity-community/svelte";

const links = [
  { href: "#search", label: "Search", active: true },
  { href: "#docs", label: "Docs" },
];

const mount = (open: boolean, onOpenChange = vi.fn()) =>
  render(NavDrawer, { props: { open, links, onOpenChange } });

const wide = (query: string) =>
  ({
    matches: query === "(min-width: 64rem)",
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }) as unknown as MediaQueryList;

describe("NavDrawer", () => {
  it("renders nothing when closed", () => {
    const { queryByRole } = mount(false);
    expect(queryByRole("dialog")).toBeNull();
  });

  it("opens as a dialog named Menu and focuses it", async () => {
    const { getByRole } = mount(true);
    const dialog = getByRole("dialog", { name: "Menu" });
    await waitFor(() => expect(dialog).toHaveFocus());
    expect(getByRole("link", { name: "Search" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("closes on Escape and reports it", async () => {
    const onOpenChange = vi.fn();
    const { queryByRole } = mount(true, onOpenChange);
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    await waitFor(() => expect(queryByRole("dialog")).toBeNull());
  });

  it("closes when a link is followed and reports it", async () => {
    const onOpenChange = vi.fn();
    const { getByRole, queryByRole } = mount(true, onOpenChange);
    await userEvent.click(getByRole("link", { name: "Docs" }));
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    await waitFor(() => expect(queryByRole("dialog")).toBeNull());
  });

  it("merges the caller's class and attributes onto the dialog", () => {
    const { getByRole } = render(NavDrawer, {
      props: { open: true, links, class: "pt-24", id: "site-menu" },
    });
    const dialog = getByRole("dialog", { name: "Menu" });
    expect(dialog).toHaveAttribute("id", "site-menu");
    expect(dialog).toHaveClass("pt-24", "bg-surface");
    expect(dialog).not.toHaveClass("pt-[92px]");
  });

  it("stays closed from lg up", () => {
    const media = vi.spyOn(window, "matchMedia").mockImplementation(wide);
    const { queryByRole } = mount(true);
    expect(queryByRole("dialog")).toBeNull();
    media.mockRestore();
  });
});
