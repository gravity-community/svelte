import { render } from "@testing-library/svelte";
import { type ComponentProps, createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { InfoCard } from "@gravity-community/svelte";

const glyph = createRawSnippet(() => ({ render: () => "<svg></svg>" }));

const cardOf = (props: Partial<ComponentProps<typeof InfoCard>>) => {
  const { container } = render(InfoCard, {
    props: { title: "Structures", icon: glyph, ...props },
  });
  const card = container.firstElementChild as HTMLElement;
  const chip = card.querySelector("[aria-hidden='true']")!;
  return { card, chip };
};

describe("InfoCard", () => {
  it("defaults to soft neutral, the grey well behind a transparent edge", () => {
    const { getByText } = render(InfoCard, {
      props: { title: "Structures", meta: "5 records" },
    });
    const card = getByText("Structures").parentElement;
    expect(card).toHaveClass("border", "border-transparent", "bg-well");
    expect(getByText("Structures")).toHaveClass("text-fg");
    expect(getByText("5 records")).toHaveClass("text-muted-fg");
  });

  it("draws faint neutral as a neutral-subtle edge with no fill", () => {
    const { getByText } = render(InfoCard, {
      props: { title: "Structures", meta: "5 records", energy: "1" },
    });
    const card = getByText("Structures").parentElement;
    expect(card).toHaveClass("border", "border-neutral-subtle");
    for (const name of ["filled-well", "bg-well", "bg-surface", "bg-plate"]) {
      expect(card).not.toHaveClass(name);
    }
    expect(getByText("Structures")).toHaveClass("text-quiet-fg");
    expect(getByText("5 records")).toHaveClass("text-muted-fg");
  });

  it("glazes what the soft well holds, as a filled well", () => {
    const { getByText } = render(InfoCard, { props: { title: "Soft" } });
    render(InfoCard, { props: { title: "Faint", energy: "1" } });
    expect(getByText("Soft").parentElement).toHaveClass("filled-well");
    expect(getByText("Faint").parentElement).not.toHaveClass("filled-well");
  });

  it("paints an intent card in its tint at soft and on the plate at faint", () => {
    expect(cardOf({ intent: "success" }).card).toHaveClass(
      "filled-well",
      "bg-success-subtle",
    );
    const faint = cardOf({ intent: "success", energy: "1" }).card;
    expect(faint).toHaveClass("filled-well", "border-transparent", "bg-plate");
    expect(faint).not.toHaveClass("border-neutral-subtle");
  });

  it("matches the chip to the card's intent and level", () => {
    expect(cardOf({}).chip).toHaveClass(
      "bg-neutral-deep",
      "text-neutral-strong",
    );
    expect(cardOf({ energy: "1" }).chip).toHaveClass(
      "bg-plate",
      "text-neutral-glyph-faint",
    );
    expect(cardOf({ intent: "warning" }).chip).toHaveClass(
      "bg-warning-deep",
      "text-warning-strong",
    );
    expect(cardOf({ intent: "warning", energy: "1" }).chip).toHaveClass(
      "bg-plate",
      "text-warning-glyph-faint",
    );
  });
});
