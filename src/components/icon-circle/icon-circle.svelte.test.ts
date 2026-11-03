import { render, within } from "@testing-library/svelte";
import { type ComponentProps, createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { IconCircle, type IconCircleIntent } from "@gravity-community/svelte";
import Parts from "../parts-harness.svelte";

const glyph = createRawSnippet(() => ({ render: () => "<svg></svg>" }));

const intents: IconCircleIntent[] = [
  "primary",
  "neutral",
  "info",
  "success",
  "warning",
  "danger",
];

const circleOf = (props: ComponentProps<typeof IconCircle> = {}) => {
  const { container } = render(IconCircle, { props });
  return container.firstElementChild as HTMLElement;
};

const classesOf = (element: Element, prefix: string) =>
  [...element.classList].filter((c) => c.startsWith(prefix));

const partIn = (props: ComponentProps<typeof Parts>) => {
  const { container } = render(Parts, { props });
  return within(container).getByTestId("icon-circle");
};

describe("IconCircle", () => {
  it("shows the text instead of the children", async () => {
    const { container, getByText, rerender } = render(IconCircle, {
      props: { children: glyph },
    });
    expect(container.querySelector("svg")).not.toBeNull();
    await rerender({ text: "99+" });
    expect(getByText("99+")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("defaults to the solid neutral disc", () => {
    const circle = circleOf();
    expect(circle).toHaveClass("bg-neutral-solid", "text-on-neutral");
    expect(classesOf(circle, "text-")).toEqual(["text-on-neutral"]);
  });

  it.each(intents)(
    "fills the solid %s disc and cuts its content out",
    (intent) => {
      const circle = circleOf({ intent, energy: "3" });
      expect(classesOf(circle, "bg-")).toEqual([`bg-${intent}-solid`]);
      expect(classesOf(circle, "text-")).toEqual([`text-on-${intent}`]);
    },
  );

  it.each(intents)(
    "tints the soft %s disc with its subtle background",
    (intent) => {
      const circle = circleOf({ intent, energy: "2" });
      expect(classesOf(circle, "bg-")).toEqual([`bg-${intent}-subtle`]);
      expect(classesOf(circle, "text-")).toEqual([`text-${intent}-strong`]);
    },
  );

  it.each(intents)(
    "lays the faint %s disc on the plate, its glyph a step quieter",
    (intent) => {
      const circle = circleOf({ intent, energy: "1" });
      expect(classesOf(circle, "bg-")).toEqual(["bg-plate"]);
      expect(classesOf(circle, "border")).toEqual([]);
      expect(classesOf(circle, "text-")).toEqual([
        `text-${intent}-glyph-faint`,
      ]);
    },
  );

  it.each(intents)(
    "keeps only the quietest ink and the box of the ghost %s disc",
    (intent) => {
      const circle = circleOf({ intent, energy: "0", size: "sm" });
      expect(classesOf(circle, "bg-")).toEqual([]);
      expect(classesOf(circle, "border")).toEqual([]);
      expect(classesOf(circle, "text-")).toEqual([
        `text-${intent}-glyph-ghost`,
      ]);
      expect(circle).toHaveClass("size-7");
    },
  );

  it("draws an edge in forced colours only where a fill marks the disc", () => {
    expect(circleOf({ energy: "3" })).toHaveClass("forced-colors:border");
    expect(circleOf({ energy: "2" })).toHaveClass("forced-colors:border");
    expect(circleOf({ energy: "1" })).toHaveClass("forced-colors:border");
    expect(circleOf({ energy: "0" })).not.toHaveClass(
      "forced-colors:border",
    );
  });

  it.each(
    [
      ["sm", "size-7", "size-3.5", "text-xs"],
      ["md", "size-10", "size-5", "text-sm"],
      ["lg", "size-16", "size-7", "text-base"],
      ["xl", "size-20", "size-9", "text-lg"],
    ] as const,
  )("sizes the %s disc, its glyph and its text", (size, disc, box, font) => {
    const circle = circleOf({ size, children: glyph });
    expect(circle).toHaveClass(disc);
    expect(circle.firstElementChild).toHaveClass(box);
    expect(circleOf({ size, text: "3" }).firstElementChild).toHaveClass(font);
  });

  it("hides the circle from assistive tech", () => {
    const { container } = render(IconCircle, { props: { text: "3" } });
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  describe("in an energy scope", () => {
    it.each(["3", "2", "1", "0"] as const)(
      "takes level %s from the scope when given no energy",
      (level) => {
        expect(partIn({ scopes: [{ level }] }).className).toBe(
          circleOf({ energy: level }).className,
        );
      },
    );

    it("still counts a shift from the potential", () => {
      const part = partIn({
        scopes: [{ level: "0" }],
        iconCircle: { energy: "-1" },
      });
      expect(part.className).toBe(circleOf({ energy: "2" }).className);
    });

    it("ignores the scope for an absolute level", () => {
      const part = partIn({
        scopes: [{ level: "0" }],
        iconCircle: { energy: "3" },
      });
      expect(part).toHaveClass("bg-neutral-solid", "text-on-neutral");
    });

    it.each(intents)(
      "glazes soft %s deep on a fill of its own intent",
      (intent) => {
        const part = partIn({
          scopes: [{ level: "2", fill: intent }],
          iconCircle: { intent },
        });
        expect(classesOf(part, "bg-")).toEqual([`bg-${intent}-deep`]);
        expect(classesOf(part, "text-")).toEqual([`text-${intent}-strong`]);
      },
    );

    it("keeps its own soft fill on a fill of another intent", () => {
      const part = partIn({
        scopes: [{ level: "2", fill: "info" }],
        iconCircle: { intent: "success" },
      });
      expect(classesOf(part, "bg-")).toEqual(["bg-success-subtle"]);
    });

    it("takes its own default inside a reset scope", () => {
      const part = partIn({ scopes: [{ level: "1" }, undefined] });
      expect(part.className).toBe(circleOf().className);
    });
  });
});
