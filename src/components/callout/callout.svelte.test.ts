import { isInaccessible, render, waitFor } from "@testing-library/svelte";
import { type ComponentProps, createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { Callout } from "@gravity-community/svelte";
import CalloutHarness from "./callout-harness.svelte";

const intents = ["info", "warning"] as const;

const body = createRawSnippet(() => ({
  render: () => "<span>Nothing is published until you submit.</span>",
}));

const setup = (props: Partial<ComponentProps<typeof Callout>> = {}) =>
  render(Callout, {
    props: { title: "Saved as a draft", children: body, ...props },
  });

const calloutOf = (props: Partial<ComponentProps<typeof Callout>> = {}) => {
  const { container, getByText } = setup(props);
  const box = container.firstElementChild as HTMLElement;
  return {
    box,
    icon: box.firstElementChild as HTMLElement,
    title: getByText("Saved as a draft"),
  };
};

const classesOf = (element: Element, prefix: string) =>
  [...element.classList].filter((c) => c.startsWith(prefix));

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

describe("Callout well", () => {
  it("glazes what it holds, as a filled well", () => {
    const { getByText } = setup();
    expect(getByText("Saved as a draft").closest(".filled-well")).toHaveClass(
      "bg-info-subtle",
    );
  });
});

describe("Callout energy", () => {
  it.each(intents)("defaults to the soft %s box", (intent) => {
    const { box, icon, title } = calloutOf({ intent });
    expect(box).toHaveClass("filled-well", "forced-colors:border");
    expect(classesOf(box, "bg-")).toEqual([`bg-${intent}-subtle`]);
    expect(icon).toHaveClass(`text-${intent}-strong`);
    expect(title).toHaveClass("text-fg");
  });

  it.each(intents)("lays the faint %s box on the plate", (intent) => {
    const { box, icon, title } = calloutOf({ intent, energy: "1" });
    expect(box).toHaveClass("filled-well", "forced-colors:border");
    expect(classesOf(box, "bg-")).toEqual(["bg-plate"]);
    expect(icon).toHaveClass(`text-${intent}-glyph-faint`);
    expect(title).toHaveClass("text-quiet-fg");
  });

  it.each(intents)("drops the ghost %s box but keeps its padding", (intent) => {
    const { box, icon, title } = calloutOf({ intent, energy: "0" });
    expect(classesOf(box, "bg-")).toEqual([]);
    expect(box).not.toHaveClass("filled-well");
    expect(box).not.toHaveClass("forced-colors:border");
    expect(box).toHaveClass("px-4", "py-3.5");
    expect(icon).toHaveClass(`text-${intent}-glyph-ghost`);
    expect(title).toHaveClass("text-quiet-fg");
  });

  it("keeps the body in the secondary ink at every level", () => {
    for (const energy of ["2", "1", "0"] as const) {
      const { getByText, unmount } = setup({ energy });
      expect(
        getByText("Nothing is published until you submit.").parentElement,
      ).toHaveClass("text-muted-fg");
      unmount();
    }
  });
});

describe("Callout actions", () => {
  it.each(
    [
      ["2", "bg-primary-subtle"],
      ["1", "bg-plate"],
    ] as const,
  )("matches an action given no energy to the box at %s", (energy, fill) => {
    const { getByRole } = render(CalloutHarness, { props: { energy } });
    const action = getByRole("button", { name: "Submit" });
    expect(classesOf(action, "bg-").filter((c) => c !== "bg-transparent"))
      .toEqual([fill]);
  });

  it("matches an action to the ghost Callout", () => {
    const { getByRole } = render(CalloutHarness, { props: { energy: "0" } });
    const action = getByRole("button", { name: "Submit" });
    expect(classesOf(action, "bg-").filter((c) => c !== "bg-transparent"))
      .toEqual([]);
    expect(action).toHaveClass("text-primary-strong");
  });

  it("sets a soft action of the box's own intent on the deep glaze", () => {
    const { getByRole } = render(CalloutHarness, {
      props: { intent: "warning", main: "warning" },
    });
    expect(getByRole("button", { name: "Submit" })).toHaveClass(
      "bg-warning-deep/75",
    );
  });

  it("lays the actions out under the body", () => {
    const { getByRole, getByText } = render(CalloutHarness);
    const row = getByRole("button", { name: "Submit" }).parentElement;
    expect(row).toHaveClass("mt-3", "flex", "flex-wrap", "gap-2");
    expect(
      getByText("Nothing is published until you submit.").nextElementSibling,
    ).toBe(row);
  });
});
