import { fireEvent, render } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "@gravity-community/svelte";

const views = [
  { label: "UI", value: "ui", href: "?view=ui" },
  { label: "CLI", value: "cli", href: "?view=cli" },
];

const panes = [{ label: "UI" }, { label: "CLI" }];

describe("SegmentedControl", () => {
  it("renders links when the segments carry an href", () => {
    const { getByRole } = render(SegmentedControl, {
      props: { items: views, value: "ui" },
    });
    expect(getByRole("link", { name: "UI" })).toHaveAttribute(
      "href",
      "?view=ui",
    );
    expect(getByRole("link", { name: "UI" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(getByRole("link", { name: "CLI" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("matches on value rather than label", () => {
    const { getByRole } = render(SegmentedControl, {
      props: { items: views, value: "cli" },
    });
    expect(getByRole("link", { name: "CLI" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("falls back to the label when a segment has no value", () => {
    const { getByRole } = render(SegmentedControl, {
      props: {
        items: [{ label: "Graph" }, { label: "Details" }],
        value: "Graph",
      },
    });
    expect(getByRole("radio", { name: "Graph" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(getByRole("radio", { name: "Details" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("stretches the shell and splits it evenly when filling", () => {
    const { getByRole } = render(SegmentedControl, {
      props: { items: views, value: "ui", fill: true },
    });
    expect(getByRole("group")).toHaveClass("flex", "w-full");
    expect(getByRole("link", { name: "UI" })).toHaveClass("flex-1");
  });

  it("hugs its segments by default", () => {
    const { getByRole } = render(SegmentedControl, {
      props: { items: views, value: "ui" },
    });
    expect(getByRole("group")).toHaveClass("inline-flex");
    expect(getByRole("link", { name: "UI" })).not.toHaveClass("flex-1");
  });

  it("reports the picked segment when there is no href to follow", async () => {
    const onselect = vi.fn();
    const { getByRole } = render(SegmentedControl, {
      props: { items: panes, value: "UI", onselect },
    });

    await fireEvent.click(getByRole("radio", { name: "CLI" }));
    expect(onselect).toHaveBeenCalledWith("CLI");
  });

  it("never clears the selection when the picked segment is pressed again", async () => {
    const onselect = vi.fn();
    const { getByRole } = render(SegmentedControl, {
      props: { items: panes, value: "UI", onselect },
    });

    await fireEvent.click(getByRole("radio", { name: "UI" }));
    expect(onselect).not.toHaveBeenCalled();
    expect(getByRole("radio", { name: "UI" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("moves focus between segments with the arrow keys", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(SegmentedControl, {
      props: { items: panes, value: "UI" },
    });

    getByRole("radio", { name: "UI" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(getByRole("radio", { name: "CLI" })).toHaveFocus();
  });

  // Without a box to measure (jsdom, display:none, no JS) the bar stays hidden.
  it("leaves the raised chip on the segment while there is no box to measure", () => {
    const { getByRole } = render(SegmentedControl, {
      props: { items: views, value: "ui" },
    });
    expect(getByRole("link", { name: "UI" })).toHaveClass(
      "bg-surface-selected",
    );
    expect(getByRole("group")).not.toHaveAttribute("data-placed");
  });

  it("keys every segment by the same value it matches `value` against", () => {
    const { getByRole, rerender } = render(SegmentedControl, {
      props: { items: views, value: "ui" },
    });
    expect(getByRole("link", { name: "UI" })).toHaveAttribute("data-key", "ui");
    expect(getByRole("link", { name: "CLI" })).toHaveAttribute(
      "data-key",
      "cli",
    );

    rerender({ items: panes, value: "UI" });
    expect(getByRole("radio", { name: "CLI" })).toHaveAttribute(
      "data-key",
      "CLI",
    );
    expect(getByRole("group").querySelector(":scope > [data-indicator]"))
      .not.toBeNull();
  });

  describe("energy", () => {
    const bar = (group: HTMLElement) =>
      group.querySelector(":scope > [data-indicator]");

    it("lays a raised thumb on a neutral track at 2, its default", () => {
      const { getByRole } = render(SegmentedControl, {
        props: { items: views, value: "ui" },
      });
      const group = getByRole("group");
      expect(group).toHaveClass(
        "border",
        "border-transparent",
        "bg-neutral-subtle",
      );
      expect(bar(group)).toHaveClass("bg-surface-selected");
      expect(getByRole("link", { name: "UI" })).toHaveClass(
        "bg-surface-selected",
      );
    });

    it.each(["1", "-1"] as const)(
      "frames the track and greys the thumb at %s",
      (energy) => {
        const { getByRole } = render(SegmentedControl, {
          props: { energy, items: views, value: "ui" },
        });
        const group = getByRole("group");
        expect(group).toHaveClass("border", "border-neutral-subtle");
        expect(group).not.toHaveClass("bg-neutral-subtle");
        expect(bar(group)).toHaveClass("bg-neutral-subtle");
        expect(getByRole("link", { name: "UI" })).toHaveClass(
          "bg-neutral-subtle",
        );
        expect(getByRole("link", { name: "UI" })).not.toHaveClass(
          "bg-surface-selected",
        );
      },
    );

    it("keeps only the grey thumb at 0", () => {
      const { getByRole } = render(SegmentedControl, {
        props: { energy: "0", items: views, value: "ui" },
      });
      const group = getByRole("group");
      expect(group).toHaveClass("border", "border-transparent");
      expect(group).not.toHaveClass("bg-neutral-subtle");
      expect(bar(group)).toHaveClass("bg-neutral-subtle");
      expect(getByRole("link", { name: "UI" })).toHaveClass(
        "bg-neutral-subtle",
      );
    });

    it.each(["2", "1", "0"] as const)(
      "inks the labels the same at level %s",
      (energy) => {
        const { getByRole } = render(SegmentedControl, {
          props: { energy, items: views, value: "ui" },
        });
        expect(getByRole("link", { name: "UI" })).toHaveClass(
          "font-semibold",
          "text-fg",
        );
        const other = getByRole("link", { name: "CLI" });
        expect(other).toHaveClass(
          "font-medium",
          "text-muted-fg",
          "hover:text-fg",
        );
        expect(other).not.toHaveClass("bg-surface-selected");
        expect(other).not.toHaveClass("bg-neutral-subtle");
      },
    );

    it.each(
      [
        ["md", "p-[3px]"],
        ["sm", "p-[2px]"],
      ] as const,
    )("pads the %s track inside its border", (size, padding) => {
      const { getByRole } = render(SegmentedControl, {
        props: { size, items: views, value: "ui" },
      });
      expect(getByRole("group")).toHaveClass("border", padding);
    });
  });

  describe("once the segments have a box", () => {
    // jsdom lays nothing out: every segment is 40px wide and CLI starts at 46px.
    beforeEach(() => {
      const width = vi.spyOn(HTMLElement.prototype, "offsetWidth", "get");
      const left = vi.spyOn(HTMLElement.prototype, "offsetLeft", "get");
      width.mockReturnValue(40);
      left.mockImplementation(function (this: HTMLElement) {
        return this.dataset.key?.toLowerCase() === "cli" ? 46 : 0;
      });
      return () => {
        width.mockRestore();
        left.mockRestore();
      };
    });

    it.each([
      ["toggle", panes, "CLI"],
      ["link", views, "cli"],
    ])("moves the bar under the picked %s segment", (_, items, value) => {
      const { getByRole } = render(SegmentedControl, {
        props: { items, value },
      });
      const group = getByRole("group");
      const bar = group.querySelector<HTMLElement>(
        ":scope > [data-indicator]",
      )!;

      expect(group).toHaveAttribute("data-placed");
      expect(bar.style.transform).toBe("translate3d(46px, 0, 0)");
      expect(bar.style.width).toBe("40px");
    });
  });
});
