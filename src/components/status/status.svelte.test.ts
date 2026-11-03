import { render, within } from "@testing-library/svelte";
import type { ComponentProps } from "svelte";
import { describe, expect, it } from "vitest";
import { Status } from "@gravity-community/svelte";
import StatusHarness from "./status-harness.svelte";

const intents = ["neutral", "info", "success", "warning", "danger"] as const;
const energies = ["2", "1", "0"] as const;

const statusOf = (props: Partial<ComponentProps<typeof Status>> = {}) => {
  const { container } = render(Status, {
    props: { title: "Request submitted", eyebrow: "STEP 3", ...props },
  });
  const box = container.firstElementChild as HTMLElement;
  const circle = box.firstElementChild as HTMLElement;
  return {
    box,
    circle,
    eyebrow: within(box).getByText("STEP 3"),
    title: within(box).getByText("Request submitted"),
  };
};

const actionsOf = (props: Partial<ComponentProps<typeof StatusHarness>>) => {
  const { getByRole } = render(StatusHarness, {
    props: { title: "Request submitted", ...props },
  });
  return {
    main: getByRole("button", { name: "Main" }),
    second: getByRole("button", { name: "Second" }),
  };
};

const classesOf = (element: Element, prefix: string) =>
  [...element.classList].filter((c) => c.startsWith(prefix));

describe("Status", () => {
  it("defaults to the soft neutral box", () => {
    const { box } = statusOf();
    expect(box).toHaveClass("filled-well", "bg-neutral-subtle", "p-12");
  });

  it.each(intents)(
    "fills the soft %s box with its subtle colour as a filled well",
    (intent) => {
      const { box } = statusOf({ intent, energy: "2" });
      expect(box).toHaveClass("filled-well", "rounded-2xl");
      expect(classesOf(box, "bg-")).toEqual([`bg-${intent}-subtle`]);
      expect(classesOf(box, "border")).toEqual([]);
    },
  );

  it.each(intents)(
    "lays the faint %s box on the plate as a filled well",
    (intent) => {
      const { box } = statusOf({ intent, energy: "1" });
      expect(box).toHaveClass("filled-well", "rounded-2xl");
      expect(classesOf(box, "bg-")).toEqual(["bg-plate"]);
      expect(classesOf(box, "border")).toEqual([]);
    },
  );

  it.each(intents)("drops the ghost %s box and its padding", (intent) => {
    const { box } = statusOf({ intent, energy: "0" });
    expect(classesOf(box, "bg-")).toEqual([]);
    expect(classesOf(box, "border")).toEqual([]);
    expect(classesOf(box, "p-")).toEqual([]);
    expect(box).not.toHaveClass("filled-well");
    expect(box).not.toHaveClass("rounded-2xl");
    expect(box).not.toHaveClass("forced-colors:border");
  });

  it.each(
    [
      ["sm", "p-6"],
      ["md", "p-12"],
      ["lg", "p-16"],
    ] as const,
  )("pads the %s box by its size", (size, padding) => {
    expect(statusOf({ size, energy: "2" }).box).toHaveClass(padding);
    expect(statusOf({ size, energy: "1" }).box).toHaveClass(padding);
  });

  it.each(
    [
      ["sm", "size-10"],
      ["md", "size-16"],
      ["lg", "size-20"],
    ] as const,
  )("sizes the %s IconCircle as before", (size, circleSize) => {
    expect(statusOf({ size }).circle).toHaveClass(circleSize);
  });

  it.each(intents)(
    "sets the soft %s IconCircle on the deep glaze of its own box",
    (intent) => {
      const { circle } = statusOf({ intent, energy: "2" });
      expect(circle).toHaveAttribute("aria-hidden", "true");
      expect(classesOf(circle, "bg-")).toEqual([`bg-${intent}-deep`]);
      expect(circle).toHaveClass(`text-${intent}-strong`);
    },
  );

  it.each(intents)("matches the faint %s IconCircle", (intent) => {
    const { circle } = statusOf({ intent, energy: "1" });
    expect(classesOf(circle, "bg-")).toEqual(["bg-plate"]);
    expect(circle).toHaveClass(`text-${intent}-glyph-faint`);
  });

  it.each(intents)("leaves the ghost %s glyph bare", (intent) => {
    const { circle } = statusOf({ intent, energy: "0" });
    expect(classesOf(circle, "bg-")).toEqual([]);
    expect(circle).toHaveClass(`text-${intent}-glyph-ghost`);
  });

  it.each(["2", "1"] as const)(
    "keeps the eyebrow in the intent's ink when %s",
    (energy) => {
      expect(statusOf({ intent: "warning", energy }).eyebrow).toHaveClass(
        "text-warning-strong",
      );
      expect(statusOf({ energy }).eyebrow).toHaveClass("text-neutral-strong");
    },
  );

  it("quiets the ghost eyebrow", () => {
    expect(statusOf({ intent: "warning", energy: "0" }).eyebrow).toHaveClass(
      "text-warning-quiet",
    );
    expect(statusOf({ energy: "0" }).eyebrow).toHaveClass("text-muted-fg");
  });

  it.each(
    [
      ["2", "text-fg"],
      ["1", "text-quiet-fg"],
      ["0", "text-quiet-fg"],
    ] as const,
  )("inks the title at %s in %s", (energy, ink) => {
    const { title } = statusOf({ energy });
    expect(classesOf(title, "text-").filter((c) => c.endsWith("fg"))).toEqual([
      ink,
    ]);
  });

  it.each(energies)(
    "pulses the IconCircle in the strong ink when %s, only when motion is allowed",
    (energy) => {
      const { circle } = statusOf({ intent: "info", energy, pulse: true });
      expect(circle).toHaveClass(
        "motion-safe:animate-status-pulse",
        "text-info-strong",
      );
      expect(circle).not.toHaveClass("animate-status-pulse");
      expect(circle).not.toHaveClass("animate-pulse");
      expect(classesOf(circle, "text-info-glyph")).toEqual([]);
    },
  );

  it("draws the boxes' edge in forced colours", () => {
    expect(statusOf({ energy: "2" }).box).toHaveClass("forced-colors:border");
    expect(statusOf({ energy: "1" }).box).toHaveClass("forced-colors:border");
  });
});

describe("Status actions", () => {
  it.each(
    [
      ["2", "bg-primary-subtle"],
      ["1", "bg-plate"],
    ] as const,
  )(
    "matches a main action given no energy to the box at %s",
    (energy, fill) => {
      const { main } = actionsOf({ intent: "info", energy });
      expect(classesOf(main, "bg-").filter((c) => c !== "bg-transparent"))
        .toEqual([fill]);
      expect(main).toHaveClass("text-primary-strong");
    },
  );

  it("matches a main action to the ghost Status", () => {
    const { main } = actionsOf({ intent: "info", energy: "0" });
    expect(classesOf(main, "bg-").filter((c) => c !== "bg-transparent"))
      .toEqual([]);
    expect(main).toHaveClass("text-primary-strong");
  });

  it("sets a soft action of the box's own intent on the deep glaze", () => {
    const { main } = actionsOf({ intent: "success", main: "success" });
    expect(main).toHaveClass("bg-success-deep/75", "hover:bg-success-deep");
    expect(main).not.toHaveClass("bg-success-subtle");
  });

  it.each(energies)("keeps the second action ghost neutral at %s", (energy) => {
    const { second } = actionsOf({ intent: "success", energy });
    expect(classesOf(second, "bg-").filter((c) => c !== "bg-transparent"))
      .toEqual([]);
    expect(second).toHaveClass("text-neutral-strong");
  });
});
