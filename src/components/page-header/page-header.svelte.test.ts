import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { PageHeader } from "@gravity-community/svelte";

describe("PageHeader", () => {
  it.each(
    [
      [undefined, "size-10"],
      ["sm", "size-8"],
      ["lg", "size-12"],
    ] as const,
  )(
    "sizes the back link for size %s over the button's own size",
    (size, sizeClass) => {
      const { getByRole } = render(PageHeader, {
        props: {
          title: "Interzone Inc.",
          backHref: "/search",
          backLabel: "Search",
          size,
        },
      });
      const back = getByRole("link", { name: "Search" });
      expect(back).toHaveAttribute("href", "/search");
      expect([...back.classList].filter((c) => c.startsWith("size-")))
        .toEqual([sizeClass]);
    },
  );

  it.each(
    [
      [undefined, "size-10"],
      ["sm", "size-8"],
      ["lg", "size-12"],
    ] as const,
  )("sizes the avatar for size %s", (size, sizeClass) => {
    const { getByText } = render(PageHeader, {
      props: {
        title: "Meridian Data Inc.",
        size,
        avatar: {
          userId: "4c9e12b7",
          name: "Meridian Data Inc.",
          organization: "Meridian Data Inc.",
          variant: "duo",
        },
      },
    });
    expect(getByText("MD")).toHaveClass(sizeClass);
  });

  it("has no back link without backHref", () => {
    const { getByRole, queryByRole } = render(PageHeader, {
      props: { title: "Overview" },
    });
    expect(getByRole("heading", { level: 1, name: "Overview" }))
      .toBeInTheDocument();
    expect(queryByRole("link")).toBeNull();
  });
});
