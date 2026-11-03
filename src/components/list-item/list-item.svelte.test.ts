import { render, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { ListItem } from "@gravity-community/svelte";
import Harness from "./list-item-harness.svelte";

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
  it("renders a muted label and a right-aligned value in the title's ink", () => {
    const { container } = render(ListItem, {
      props: { title: "Email", detail: "ops@northwind.example", data: true },
    });
    expect(container.querySelector(".text-muted-fg")?.textContent).toContain(
      "Email",
    );
    const value = container.querySelector(".text-right");
    expect(value?.textContent).toContain("ops@northwind.example");
    expect(value).toHaveClass("text-quiet-fg");
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

  it("keeps a plain trailing detail muted", () => {
    const { container } = render(ListItem, {
      props: { title: "Row", detail: "Dec 16, 2023" },
    });
    expect(container.querySelector(".text-right")).toHaveClass(
      "text-muted-fg",
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

describe("ListItem tint", () => {
  const action = createRawSnippet(() => ({
    render: () => "<button>Cancel</button>",
  }));
  const wellOf = (props: { tint?: boolean; href?: string }) => {
    const { container } = render(ListItem, {
      props: { title: "Row", actions: action, ...props },
    });
    return within(container).getByRole("button", { name: "Cancel" })
      .parentElement;
  };

  it("glazes the actions on a persistent tint, as a filled well", () => {
    expect(wellOf({ tint: true })).toHaveClass("filled-well");
    expect(wellOf({})).not.toHaveClass("filled-well");
  });

  it("glazes them while a hover tint shows", () => {
    expect(wellOf({ href: "/row" })).toHaveClass("group-hover:filled-well");
  });
});

describe("ListItem energy", () => {
  const rowOf = (props: Record<string, unknown>) =>
    render(ListItem, { props: { title: "Row", ...props } }).container;
  const tintOf = (props: Record<string, unknown>) =>
    rowOf(props).querySelector("[aria-hidden=true]");

  it("is ghost by default: no box until hovered or held", () => {
    expect(tintOf({})).toHaveClass("opacity-0", "border-transparent");
    expect(tintOf({ tint: true })).toHaveClass("opacity-100", "bg-well");
  });

  it("draws a faint row as an edge, filled while held", () => {
    expect(tintOf({ energy: "1" })).toHaveClass("border-neutral-subtle");
    expect(tintOf({ energy: "1" })).not.toHaveClass("opacity-0");
    expect(tintOf({ energy: "1" })).not.toHaveClass("bg-well");
    expect(tintOf({ energy: "1", tint: true })).toHaveClass("bg-well");
    expect(tintOf({ energy: "1", href: "/row" })).toHaveClass(
      "group-hover:bg-well",
    );
  });

  it("fills a soft row with the well, deeper while held or hovered", () => {
    expect(tintOf({ energy: "2" })).toHaveClass("bg-well");
    expect(tintOf({ energy: "2", tint: true })).toHaveClass("bg-well-active");
    expect(tintOf({ energy: "2", href: "/row" })).toHaveClass(
      "group-hover:bg-well-active",
    );
  });

  it("holds a danger row in its tint at every level", () => {
    for (const energy of ["2", "1", "0"]) {
      expect(tintOf({ energy, tint: true, intent: "danger" })).toHaveClass(
        "bg-danger-subtle",
      );
    }
  });

  it("quiets the title below soft, and a data row's value with it", () => {
    const title = (props: Record<string, unknown>) =>
      within(rowOf(props)).getByText("Row");
    expect(title({ energy: "2" })).toHaveClass("text-fg");
    expect(title({ energy: "1" })).toHaveClass("text-quiet-fg");
    expect(title({ energy: "0" })).toHaveClass("text-quiet-fg");
    const value = rowOf({ energy: "2", data: true, detail: "Praha" })
      .querySelector(".text-right");
    expect(value).toHaveClass("text-fg");
  });

  it("lifts a shift from soft, the potential", () => {
    expect(tintOf({ energy: "-1" })).toHaveClass("border-neutral-subtle");
  });
});

describe("ListItem parts", () => {
  const partsOf = (props: Record<string, unknown>) => {
    const { getByTestId } = within(render(Harness, { props }).container);
    return {
      leading: getByTestId("leading"),
      badge: getByTestId("badge"),
      action: getByTestId("action"),
    };
  };

  it("matches the leading IconCircle and the Badge to a soft row, deep on its fill", () => {
    const { leading, badge } = partsOf({ energy: "2" });
    expect(leading).toHaveClass("bg-neutral-deep");
    expect(badge).toHaveClass("bg-neutral-deep");
  });

  it("matches them to a faint row", () => {
    const { leading, badge } = partsOf({ energy: "1" });
    expect(leading).toHaveClass("bg-plate", "text-neutral-glyph-faint");
    expect(badge).toHaveClass("bg-plate");
  });

  it("matches them to a ghost row, its default", () => {
    const { leading, badge } = partsOf({});
    expect(leading).toHaveClass("text-neutral-glyph-ghost");
    expect(leading).not.toHaveClass("bg-plate");
    expect(badge).not.toHaveClass("bg-plate");
    expect(badge).not.toHaveClass("bg-neutral-subtle");
  });

  it("puts a part of the held intent on its deep fill", () => {
    const { badge } = partsOf({
      energy: "2",
      intent: "danger",
      tint: true,
      badgeProps: { intent: "danger" },
    });
    expect(badge).toHaveClass("bg-danger-deep");
  });

  it("sets an action with no energy one level below the row", () => {
    expect(partsOf({ energy: "2" }).action).toHaveClass("bg-plate");
    expect(partsOf({ energy: "1" }).action).toHaveClass("bg-transparent");
    expect(partsOf({}).action).toHaveClass("bg-transparent");
  });

  it("still counts an action's shift from its potential", () => {
    const { action } = partsOf({ actionProps: { energy: "-1" } });
    expect(action).toHaveClass("bg-primary-subtle");
  });

  it("leaves an absolute level alone", () => {
    const { leading } = partsOf({ leadingProps: { energy: "3" } });
    expect(leading).toHaveClass("bg-neutral-solid");
  });
});

describe("ListItem status", () => {
  const META = "03 Structure · 4 left to do";
  const metaOf = (props: Record<string, unknown>) =>
    within(
      render(ListItem, {
        props: { title: "Interzone s.r.o.", meta: META, ...props },
      }).container,
    ).getByText(META).parentElement;

  it("puts a hidden dot before the meta", () => {
    const meta = metaOf({ status: { intent: "neutral" } });
    const dot = meta?.firstElementChild;
    expect(dot).toHaveClass("text-neutral-solid");
    expect(dot).not.toHaveClass("bg-current");
    expect(dot).toHaveAttribute("aria-hidden", "true");
    expect(meta).toHaveTextContent(META);
  });

  it("centres the dot on the meta's first line, where a wrapping meta keeps it", () => {
    const meta = metaOf({ status: { intent: "neutral" } });
    expect(meta).toHaveClass("flex", "items-start", "leading-5");
    expect(meta?.firstElementChild).toHaveClass("mt-1.5");
  });

  it("keeps the dot's own look at every level", () => {
    for (const energy of ["2", "1", "0"]) {
      const dot = metaOf({
        energy,
        status: { intent: "success", filled: true },
      })?.firstElementChild;
      expect(dot).toHaveClass("text-success-solid", "bg-current");
    }
  });

  it("announces its label ahead of the meta, a snippet one too", () => {
    const meta = createRawSnippet(() => ({
      render: () => "<span>04 Evidence · <b>6 documents</b></span>",
    }));
    const { getByRole, getByText } = render(ListItem, {
      props: {
        title: "Interzone s.r.o.",
        meta,
        status: { intent: "success", filled: true, label: "Ready" },
        href: "/interzone",
      },
    });
    expect(getByRole("link", { name: "Interzone s.r.o." }))
      .toHaveAccessibleDescription("Ready, 04 Evidence · 6 documents");
    expect(getByText("Ready,")).toHaveClass("sr-only");
  });

  it("leaves the description to the meta without a label", () => {
    const { getByRole } = render(ListItem, {
      props: {
        title: "Interzone s.r.o.",
        meta: META,
        status: { intent: "neutral" },
        href: "/interzone",
      },
    });
    expect(getByRole("link", { name: "Interzone s.r.o." }))
      .toHaveAccessibleDescription(META);
  });

  it("shows nothing without a meta to sit on", () => {
    const { container, getByRole } = render(ListItem, {
      props: {
        title: "Interzone s.r.o.",
        status: { intent: "info", filled: true, label: "New work" },
        href: "/interzone",
      },
    });
    expect(container.querySelector(".text-info-solid")).toBeNull();
    expect(container).not.toHaveTextContent("New work");
    expect(getByRole("link", { name: "Interzone s.r.o." })).not
      .toHaveAttribute("aria-describedby");
  });
});
