import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { Stepper } from "@gravity-community/svelte";

const steps = [
  { label: "The record", href: "/record" },
  { label: "Verified subject", href: "/subject" },
  { label: "Structure" },
  { label: "Evidence" },
];

describe("Stepper", () => {
  it("marks the current step and links the others that have an href", () => {
    const { getByRole, getAllByRole } = render(Stepper, {
      props: { steps, current: 2, "aria-label": "Steps" },
    });
    const items = getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[2]).toHaveAttribute("aria-current", "step");
    expect(getByRole("link", { name: "The record (done)" })).toHaveAttribute(
      "href",
      "/record",
    );
  });

  it("puts aria-current on the link when the current step is one", () => {
    const { getByRole } = render(Stepper, { props: { steps, current: 1 } });
    expect(getByRole("link", { name: "Verified subject" })).toHaveAttribute(
      "aria-current",
      "step",
    );
  });

  it("names a step's error for screen readers", () => {
    const { getByText } = render(Stepper, {
      props: {
        steps: [{ label: "Evidence", status: "error" as const }],
      },
    });
    expect(getByText("(error)")).toHaveClass("sr-only");
  });
});
