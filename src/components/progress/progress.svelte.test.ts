import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { Progress } from "@gravity-community/svelte";

describe("Progress", () => {
  it("is a progressbar named by its label that reads its value label", () => {
    const { getByRole } = render(Progress, {
      props: { value: 3, max: 5, label: "Layers", valueLabel: "3 of 5 done" },
    });
    const bar = getByRole("progressbar", { name: "Layers" });
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuemax", "5");
    expect(bar).toHaveAttribute("aria-valuetext", "3 of 5 done");
  });

  it("fills one segment per unit when segmented", () => {
    const { getByRole } = render(Progress, {
      props: { value: 3, max: 5, segmented: true, "aria-label": "Layers" },
    });
    const segments = getByRole("progressbar", { name: "Layers" })
      .querySelectorAll(
        ":scope > div:last-child > span",
      );
    expect(segments).toHaveLength(5);
    expect(
      [...segments].filter((s) => s.className.includes("bg-primary-solid")),
    ).toHaveLength(3);
  });
});
