import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { DocumentPreview } from "@gravity-community/svelte";

describe("DocumentPreview", () => {
  it("is a focusable region named by its title", () => {
    const { getByRole, getAllByText } = render(DocumentPreview, {
      props: {
        title: "Terms",
        sections: [{
          heading: "1. Scope",
          paragraphs: ["Reserved.", "Reserved."],
        }],
      },
    });
    expect(getByRole("region", { name: "Terms" })).toHaveAttribute(
      "tabindex",
      "0",
    );
    expect(getAllByText("Reserved.")).toHaveLength(2);
  });
});
