import { render } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { DataList } from "@gravity-community/svelte";

const entries = [{ label: "Type", value: "TXT" }];

describe("DataList", () => {
  it("copies a value and flashes only its row", async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    const { getByRole, findByRole } = render(DataList, {
      props: {
        entries: [
          { label: "Type", value: "TXT" },
          { label: "Name", value: "example.com" },
        ],
      },
    });

    getByRole("button", { name: "Copy Type" }).click();

    expect(await findByRole("button", { name: "Copied Type" }))
      .toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith("TXT");
    expect(getByRole("button", { name: "Copy Name" })).toBeInTheDocument();
  });

  it("shows a dash and no copy button for an empty value", () => {
    const { getByText, queryByRole } = render(DataList, {
      props: { entries: [{ label: "TTL", value: "" }] },
    });
    expect(getByText("–")).toBeInTheDocument();
    expect(queryByRole("button")).toBeNull();
  });

  it("copies from a labelled ghost neutral Button inside a filled well", () => {
    const { getByRole } = render(DataList, {
      props: { entries: [{ label: "Type", value: "TXT" }] },
    });
    const copy = getByRole("button", { name: "Copy Type" });
    expect(copy).toHaveAttribute("type", "button");
    expect(copy).toHaveTextContent("Copy");
    expect(copy).toHaveClass(
      "text-neutral-strong",
      "hover:bg-neutral-subtle",
      "text-sm",
    );
    expect(copy.closest(".filled-well")).not.toBeNull();
  });
  it("fills the panel with the grey well at 2, its default", () => {
    const { getByTestId } = render(DataList, {
      props: { entries, "data-testid": "panel" },
    });
    expect(getByTestId("panel")).toHaveClass(
      "filled-well",
      "border",
      "border-transparent",
      "bg-well",
      "rounded-xl",
      "p-4",
    );
  });

  it.each(["1", "-1"] as const)(
    "draws a neutral edge and no fill at %s",
    (energy) => {
      const { getByTestId } = render(DataList, {
        props: { energy, entries, "data-testid": "panel" },
      });
      const panel = getByTestId("panel");
      expect(panel).toHaveClass("border", "border-neutral-subtle", "p-4");
      expect(panel).not.toHaveClass("filled-well");
      expect(panel).not.toHaveClass("bg-well");
    },
  );

  it("keeps the padding but drops the edge and fill at 0", () => {
    const { getByTestId } = render(DataList, {
      props: { energy: "0", entries, "data-testid": "panel" },
    });
    const panel = getByTestId("panel");
    expect(panel).toHaveClass("border", "border-transparent", "p-4");
    expect(panel).not.toHaveClass("filled-well");
    expect(panel).not.toHaveClass("bg-well");
  });

  it.each(
    [
      ["2", "text-fg"],
      ["1", "text-quiet-fg"],
      ["0", "text-quiet-fg"],
    ] as const,
  )("inks the title and values for level %s", (energy, ink) => {
    const { getByText } = render(DataList, {
      props: { energy, title: "DNS TXT record", entries },
    });
    expect(getByText("DNS TXT record")).toHaveClass(ink);
    expect(getByText("TXT")).toHaveClass(ink);
    expect(getByText("Type")).toHaveClass("text-muted-fg");
  });

  it.each(["2", "1", "0"] as const)(
    "keeps Copy at ghost neutral at level %s",
    (energy) => {
      const { getByRole } = render(DataList, { props: { energy, entries } });
      const copy = getByRole("button", { name: "Copy Type" });
      expect(copy).toHaveClass(
        "text-neutral-strong",
        "hover:bg-neutral-subtle",
      );
      expect(copy).not.toHaveClass("bg-neutral-subtle");
      expect(copy).not.toHaveClass("bg-plate");
    },
  );
});
