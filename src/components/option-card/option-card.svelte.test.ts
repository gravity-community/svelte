import { render, within } from "@testing-library/svelte";
import type { ComponentProps } from "svelte";
import { describe, expect, it } from "vitest";
import { OptionCard } from "@gravity-community/svelte";

const cardOf = (props: Partial<ComponentProps<typeof OptionCard>>) => {
  const all = { title: "Submitter", href: "#", ...props };
  const { container } = render(OptionCard, { props: all });
  const card = container.firstElementChild as HTMLElement;
  const chip = card.querySelector("[aria-hidden='true']")!;
  const title = within(card).getByText(all.title);
  return { card, chip, title };
};

/** The ones of `names` that `element` carries. */
const classesIn = (element: Element, names: string[]) =>
  names.filter((name) => element.classList.contains(name));

describe("OptionCard", () => {
  it("renders a link, marked current when selected", () => {
    const { getByRole } = render(OptionCard, {
      props: { title: "Submitter", href: "/join/submitter", selected: true },
    });
    const card = getByRole("link", { name: /Submitter/ });
    expect(card).toHaveAttribute("href", "/join/submitter");
    expect(card).toHaveAttribute("aria-current", "true");
  });

  it("renders a static aria-disabled card when disabled", () => {
    const { getByText, queryByRole } = render(OptionCard, {
      props: { title: "Auditor", href: "/join/auditor", disabled: true },
    });
    expect(queryByRole("link")).toBeNull();
    expect(getByText("Auditor").closest("div")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("defaults to soft neutral: the grey well behind a transparent edge, with a deep chip", () => {
    const { card, chip, title } = cardOf({ description: "Publish records." });
    expect(card).toHaveClass(
      "filled-well",
      "border",
      "border-transparent",
      "bg-well",
      "hover:bg-well-active",
    );
    expect(chip).toHaveClass("bg-neutral-deep", "text-neutral-strong");
    expect(title).toHaveClass("text-fg");
    expect(within(card).getByText("Publish records.")).toHaveClass(
      "text-muted-fg",
    );
  });

  it("draws faint neutral as a neutral-subtle edge with no fill, its chip on the plate", () => {
    const { card, chip, title } = cardOf({ energy: "1" });
    expect(card).toHaveClass(
      "border",
      "border-neutral-subtle",
      "hover:bg-well",
    );
    expect(classesIn(card, ["filled-well", "bg-surface", "bg-plate"]))
      .toEqual([]);
    expect(card.className).not.toMatch(/hover:border/);
    expect(chip).toHaveClass("bg-plate", "text-neutral-glyph-faint");
    expect(title).toHaveClass("text-quiet-fg");
  });

  it("paints an intent card in its tint at soft and on the plate at faint", () => {
    const soft = cardOf({ intent: "success" });
    expect(soft.card).toHaveClass(
      "filled-well",
      "bg-success-subtle",
      "hover:bg-success-subtle-hover",
    );
    expect(soft.chip).toHaveClass("bg-success-deep", "text-success-strong");

    const faint = cardOf({ intent: "success", energy: "1" });
    expect(faint.card).toHaveClass(
      "filled-well",
      "border-transparent",
      "bg-plate",
      "hover:bg-success-subtle",
    );
    expect(faint.chip).toHaveClass("bg-plate", "text-success-glyph-faint");
    expect(faint.title).toHaveClass("text-quiet-fg");
  });

  it("marks a selected card with a 2px edge at both levels, a neutral one in primary", () => {
    for (const energy of ["2", "1"] as const) {
      const { card } = cardOf({ selected: true, energy });
      expect(card).toHaveClass(
        "filled-well",
        "border-2",
        "border-border-focus",
        "bg-primary-subtle",
        "p-[15px]",
      );
      expect(
        classesIn(card, ["p-4", "border", "border-transparent", "bg-well"]),
      )
        .toEqual([]);
      expect(card.className).not.toMatch(/(^|\s)hover:/);
    }
  });

  it("lifts a selected card's chip one level", () => {
    const soft = cardOf({ selected: true });
    expect(soft.chip).toHaveClass("bg-primary-solid", "text-on-primary");
    expect(soft.title).toHaveClass("text-fg");

    const faint = cardOf({ selected: true, energy: "1" });
    expect(faint.chip).toHaveClass("bg-primary-deep", "text-primary-strong");
    expect(faint.chip).not.toHaveClass("bg-plate");
    expect(faint.title).toHaveClass("text-quiet-fg");
  });

  it("selects an intent card in its own colour", () => {
    const soft = cardOf({ intent: "success", selected: true });
    expect(soft.card).toHaveClass(
      "border-2",
      "border-success-solid",
      "bg-success-subtle",
    );
    expect(soft.chip).toHaveClass("bg-success-solid", "text-on-success");

    const faint = cardOf({ intent: "success", selected: true, energy: "1" });
    expect(faint.card).toHaveClass("border-success-solid", "bg-success-subtle");
    expect(faint.card).not.toHaveClass("bg-plate");
    expect(faint.chip).toHaveClass("bg-success-deep", "text-success-strong");
  });

  it("greys out a disabled card at every level and intent", () => {
    const cards = [
      cardOf({ title: "Soft", description: "Not open yet.", disabled: true }),
      cardOf({ title: "Faint", disabled: true, energy: "1" }),
      cardOf({ title: "Success", disabled: true, intent: "success" }),
      cardOf({ title: "Selected", disabled: true, selected: true }),
    ];
    for (const { card, chip, title } of cards) {
      expect(card).toHaveClass(
        "filled-well",
        "border-transparent",
        "bg-surface-muted",
      );
      expect(
        classesIn(card, [
          "bg-well",
          "bg-plate",
          "bg-success-subtle",
          "bg-primary-subtle",
          "border-2",
          "border-neutral-subtle",
        ]),
      ).toEqual([]);
      // A filled well, so the chip glazes off the grey box.
      expect(chip).toHaveClass("bg-neutral-subtle", "text-disabled-fg");
      expect(chip).not.toHaveClass("bg-plate");
      expect(title).toHaveClass("text-disabled-fg");
    }
    expect(within(cards[0].card).getByText("Not open yet.")).toHaveClass(
      "text-disabled-fg",
    );
  });
});
