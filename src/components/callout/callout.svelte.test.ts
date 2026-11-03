import { isInaccessible, render, waitFor } from "@testing-library/svelte";
import { type ComponentProps, createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { Callout } from "@gravity-community/svelte";

const body = createRawSnippet(() => ({
  render: () => "<span>Nothing is published until you submit.</span>",
}));

const setup = (props: Partial<ComponentProps<typeof Callout>> = {}) =>
  render(Callout, {
    props: { title: "Saved as a draft", children: body, ...props },
  });

describe("Callout live region", () => {
  it("stays out of live regions by default", () => {
    const { queryByRole } = setup();
    expect(queryByRole("status")).toBeNull();
    expect(queryByRole("alert")).toBeNull();
  });

  it("alerts with its text at once when assertive", () => {
    const { getByRole, getByText } = setup({ live: "assertive" });
    const text = getByText("Nothing is published until you submit.");
    expect(getByRole("alert")).toContainElement(text);
    expect(isInaccessible(text)).toBe(false);
  });

  it("fills a polite status once registered, so the text is announced as it appears", async () => {
    const { getByRole, getByText } = setup({ live: "polite" });
    const title = getByText("Saved as a draft");
    expect(getByRole("status")).toContainElement(title);
    expect(isInaccessible(title)).toBe(true);
    await waitFor(() => expect(isInaccessible(title)).toBe(false));
  });
});
