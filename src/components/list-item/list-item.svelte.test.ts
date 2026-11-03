import { render } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { ListItem } from "@gravity-community/svelte";

// runed debounces pointerdown by 10ms and ignores non-element targets.
function pressAt(x: number, y: number): void {
  document.body.dispatchEvent(
    new PointerEvent("pointerdown", { bubbles: true, clientX: x, clientY: y }),
  );
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 30));

const escape = () =>
  globalThis.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );

// jsdom rects are all zero, so the bleed alone decides: 12px, 24px at the end.
describe("ListItem outside click", () => {
  it("dismisses on a press beyond the tint bleed", async () => {
    const ondismiss = vi.fn();
    render(ListItem, { props: { title: "Row", tint: true, ondismiss } });
    pressAt(100, 100);
    await settle();
    expect(ondismiss).toHaveBeenCalledTimes(1);
  });

  it("ignores a press inside the tint bleed", async () => {
    const ondismiss = vi.fn();
    render(ListItem, { props: { title: "Row", tint: true, ondismiss } });
    pressAt(5, 5);
    await settle();
    expect(ondismiss).not.toHaveBeenCalled();
  });

  it("ignores a press inside the wider end bleed", async () => {
    const ondismiss = vi.fn();
    render(ListItem, { props: { title: "Row", tint: true, ondismiss } });
    pressAt(20, 5);
    await settle();
    expect(ondismiss).not.toHaveBeenCalled();
  });

  it("stays quiet while untinted", async () => {
    const ondismiss = vi.fn();
    render(ListItem, { props: { title: "Row", tint: false, ondismiss } });
    pressAt(100, 100);
    await settle();
    expect(ondismiss).not.toHaveBeenCalled();
  });

  it("dismisses on Escape while tinted", () => {
    const ondismiss = vi.fn();
    render(ListItem, { props: { title: "Row", tint: true, ondismiss } });
    escape();
    expect(ondismiss).toHaveBeenCalledTimes(1);
  });

  it("ignores Escape while untinted", () => {
    const ondismiss = vi.fn();
    render(ListItem, { props: { title: "Row", tint: false, ondismiss } });
    escape();
    expect(ondismiss).not.toHaveBeenCalled();
  });
});

describe("ListItem data row", () => {
  it("renders a muted label and a right-aligned value in fg ink", () => {
    const { container } = render(ListItem, {
      props: { title: "Email", detail: "ops@northwind.example", data: true },
    });
    expect(container.querySelector(".text-muted-fg")?.textContent).toContain(
      "Email",
    );
    const value = container.querySelector(".text-right");
    expect(value?.textContent).toContain("ops@northwind.example");
    expect(value).toHaveClass("text-fg");
  });

  it("falls back to a dash for an empty value", () => {
    const { container } = render(ListItem, {
      props: { title: "Phone", data: true },
    });
    expect(container.querySelector(".text-right")?.textContent).toContain("–");
  });

  it("keeps a plain trailing detail subtle", () => {
    const { container } = render(ListItem, {
      props: { title: "Row", detail: "Dec 16, 2023" },
    });
    expect(container.querySelector(".text-right")).toHaveClass(
      "text-subtle-fg",
    );
  });
});

describe("ListItem link", () => {
  it("names the stretched link by titleText when the title is a snippet", () => {
    const title = createRawSnippet(() => ({
      render: () => "<span><mark>Inter</mark>zone</span>",
    }));
    const { getByRole } = render(ListItem, {
      props: { title, titleText: "Interzone", href: "/interzone" },
    });
    expect(getByRole("link", { name: "Interzone" })).toHaveAttribute(
      "href",
      "/interzone",
    );
  });
});
