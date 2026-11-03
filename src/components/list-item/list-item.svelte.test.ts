import { render } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
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

  it("starts listening once tinted", async () => {
    const ondismiss = vi.fn();
    const { rerender } = render(ListItem, {
      props: { title: "Row", tint: false, ondismiss },
    });
    await rerender({ tint: true });
    pressAt(100, 100);
    await settle();
    expect(ondismiss).toHaveBeenCalledTimes(1);
  });

  // runed's click-outside rejects a press still pending as it's torn down. Unhandled, that fails the
  // run; under Deno and jsdom, as a crash in dispatchEvent.
  it("leaves nothing pending when a press unmounts the row", async () => {
    const { getByRole, queryByRole, unmount } = render(ListItem, {
      props: { title: "Row", onclick: () => unmount() },
    });
    await userEvent.click(getByRole("button", { name: "Row" }));
    await settle();
    expect(queryByRole("button")).toBeNull();
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

  it("aligns the label to the first line of a wrapping value", () => {
    const { container } = render(ListItem, {
      props: { title: "Business activities", detail: "Production", data: true },
    });
    expect(container.firstElementChild).toHaveClass("items-baseline");
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

  it("is described by the meta, a snippet one too", () => {
    const meta = createRawSnippet(() => ({
      render: () => "<span>8 subjects · <b>in review</b></span>",
    }));
    const { getByRole } = render(ListItem, {
      props: { title: "Interzone Inc.", meta, href: "/interzone" },
    });
    expect(getByRole("link", { name: "Interzone Inc." }))
      .toHaveAccessibleDescription("8 subjects · in review");
  });

  it("has no description without a meta", () => {
    const { getByRole } = render(ListItem, {
      props: { title: "Interzone Inc.", detail: "Dec 16, 2023", href: "/i" },
    });
    expect(getByRole("link", { name: "Interzone Inc." })).not
      .toHaveAttribute("aria-describedby");
  });
});

describe("ListItem button", () => {
  it("makes the whole row one button, named by its title", async () => {
    const onclick = vi.fn();
    const { getByRole } = render(ListItem, {
      props: { title: "Interzone Inc.", meta: "8 subjects", onclick },
    });
    await userEvent.click(getByRole("button", { name: "Interzone Inc." }));
    expect(onclick).toHaveBeenCalledOnce();
  });

  it("is described by the meta, not the detail", () => {
    const { getByRole } = render(ListItem, {
      props: {
        title: "Interzone Inc.",
        meta: "8 subjects",
        detail: "Dec 16, 2023",
        onclick: vi.fn(),
      },
    });
    expect(getByRole("button", { name: "Interzone Inc." }))
      .toHaveAccessibleDescription("8 subjects");
  });

  it("presses on Enter and Space", async () => {
    const user = userEvent.setup();
    const onclick = vi.fn();
    const { getByRole } = render(ListItem, {
      props: { title: "Interzone Inc.", onclick },
    });
    await user.tab();
    expect(getByRole("button", { name: "Interzone Inc." })).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onclick).toHaveBeenCalledTimes(2);
  });

  it("never submits its form", async () => {
    const onsubmit = vi.fn((event: Event) => event.preventDefault());
    const form = document.body.appendChild(document.createElement("form"));
    form.addEventListener("submit", onsubmit);
    const { getByRole } = render(ListItem, {
      target: form,
      props: { title: "Interzone Inc.", onclick: vi.fn() },
    });
    await userEvent.click(getByRole("button", { name: "Interzone Inc." }));
    expect(onsubmit).not.toHaveBeenCalled();
  });

  it("tints on hover, as a link row does", () => {
    const tintOf = (props: { href?: string; onclick?: () => void }) =>
      render(ListItem, { props: { title: "Row", ...props } }).container
        .querySelector("[aria-hidden=true]");
    expect(tintOf({ href: "/row" })).toHaveClass("group-hover:opacity-100");
    expect(tintOf({ onclick: vi.fn() })).toHaveClass("group-hover:opacity-100");
    expect(tintOf({})).not.toHaveClass("group-hover:opacity-100");
  });
});
