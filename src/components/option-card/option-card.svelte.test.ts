import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { OptionCard } from "@gravity-community/svelte";

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
});
