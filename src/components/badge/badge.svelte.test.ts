import { render, within } from "@testing-library/svelte";
import { type ComponentProps, createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { Badge } from "@gravity-community/svelte";
import Parts from "../parts-harness.svelte";

const label = createRawSnippet(() => ({
  render: () => "<span>Pending</span>",
}));

const intents = ["neutral", "info", "success", "warning", "danger"] as const;

const badgeOf = (props: ComponentProps<typeof Badge> = {}) =>
  render(Badge, { props: { children: label, ...props } }).container
    .firstElementChild as HTMLElement;

const classesOf = (element: Element, prefix: string) =>
  [...element.classList].filter((c) => c.startsWith(prefix));

const partIn = (props: ComponentProps<typeof Parts>) => {
  const { container } = render(Parts, { props });
  return within(container).getByTestId("badge");
};

describe("Badge", () => {
  it("defaults to the soft neutral badge", () => {
    const badge = badgeOf();
    expect(classesOf(badge, "bg-")).toEqual(["bg-neutral-subtle"]);
    expect(classesOf(badge, "text-neutral")).toEqual(["text-neutral-strong"]);
  });

  it.each(intents)("tints the soft %s badge", (intent) => {
    const badge = badgeOf({ intent, energy: "2" });
    expect(classesOf(badge, "bg-")).toEqual([`bg-${intent}-subtle`]);
    expect(badge).toHaveClass(`text-${intent}-strong`);
  });

  it.each(intents)("lays the faint %s badge on the plate", (intent) => {
    const badge = badgeOf({ intent, energy: "1" });
    expect(classesOf(badge, "bg-")).toEqual(["bg-plate"]);
    expect(badge).toHaveClass(`text-${intent}-strong`);
  });

  it.each(intents)("keeps only the ink of the ghost %s badge", (intent) => {
    const badge = badgeOf({ intent, energy: "0" });
    expect(classesOf(badge, "bg-")).toEqual([]);
    expect(badge).toHaveClass(`text-${intent}-strong`, "px-[5px]");
  });

  it.each(["2", "1", "0"] as const)(
    "keeps a transparent 1px edge at %s",
    (energy) => {
      const badge = badgeOf({ energy, intent: "success" });
      expect(classesOf(badge, "border")).toEqual([
        "border",
        "border-transparent",
      ]);
    },
  );

  it("inks neutral in neutral-strong, not muted-fg", () => {
    const badge = badgeOf({ intent: "neutral" });
    expect(badge).toHaveClass("text-neutral-strong");
    expect(badge).not.toHaveClass("text-muted-fg");
  });

  it.each(["-1", "-2"] as const)(
    "shifts %s down from soft",
    (energy) => {
      const shifted = badgeOf({ energy });
      const absolute = badgeOf({ energy: energy === "-1" ? "1" : "0" });
      expect(shifted.className).toBe(absolute.className);
    },
  );

  it("shows no dot unless asked", () => {
    expect(badgeOf().querySelector("[aria-hidden]")).toBeNull();
  });

  it.each(["2", "1", "0"] as const)(
    "keeps the solid dot at %s, hidden from assistive tech",
    (energy) => {
      const dot = badgeOf({ energy, intent: "warning", dot: true })
        .firstElementChild;
      expect(dot).toHaveClass("bg-warning-solid", "size-[3px]");
      expect(dot).toHaveAttribute("aria-hidden", "true");
    },
  );

  describe("in an energy scope", () => {
    it.each(["2", "1", "0"] as const)(
      "takes level %s from the scope when given no energy",
      (level) => {
        expect(partIn({ scopes: [{ level }] }).className).toBe(
          badgeOf({ energy: level }).className,
        );
      },
    );

    it("clamps a solid scope to soft", () => {
      expect(partIn({ scopes: [{ level: "3" }] }).className).toBe(
        badgeOf({ energy: "2" }).className,
      );
    });

    it("still counts a shift from the potential", () => {
      const part = partIn({
        scopes: [{ level: "0" }],
        badge: { energy: "-1" },
      });
      expect(part.className).toBe(badgeOf({ energy: "1" }).className);
    });

    it("ignores the scope for an absolute level", () => {
      const part = partIn({ scopes: [{ level: "0" }], badge: { energy: "2" } });
      expect(classesOf(part, "bg-")).toEqual(["bg-neutral-subtle"]);
    });

    it.each(intents)(
      "glazes soft %s deep on a fill of its own intent",
      (intent) => {
        const part = partIn({
          scopes: [{ level: "2", fill: intent }],
          badge: { intent },
        });
        expect(classesOf(part, "bg-")).toEqual([`bg-${intent}-deep`]);
        expect(part).toHaveClass(`text-${intent}-strong`);
      },
    );

    it("keeps its own soft fill on a fill of another intent", () => {
      const part = partIn({
        scopes: [{ level: "2", fill: "neutral" }],
        badge: { intent: "danger" },
      });
      expect(classesOf(part, "bg-")).toEqual(["bg-danger-subtle"]);
    });

    it("takes its own default inside a reset scope", () => {
      const part = partIn({ scopes: [{ level: "0" }, undefined] });
      expect(part.className).toBe(badgeOf().className);
    });
  });
});
