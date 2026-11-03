import { render } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { DataList } from "@gravity-community/svelte";

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
});
