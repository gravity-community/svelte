import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { Separator } from "@gravity-community/svelte";

describe("Separator", () => {
  it("renders a horizontal separator by default", () => {
    const { getByRole } = render(Separator);
    expect(getByRole("separator")).toHaveAttribute(
      "aria-orientation",
      "horizontal",
    );
  });

  it("hides a decorative separator from assistive tech", () => {
    const { container, queryByRole } = render(Separator, {
      props: { orientation: "vertical", decorative: true },
    });
    expect(queryByRole("separator")).toBeNull();
    expect(container.querySelector("[data-orientation=vertical]"))
      .toHaveAttribute("aria-hidden", "true");
  });
});
