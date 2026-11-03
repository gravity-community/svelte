import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRawSnippet } from "svelte";
import { prefersReducedMotion } from "svelte/motion";
import { render, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { BottomSheet } from "@gravity-community/svelte";
import Harness from "./bottom-sheet-harness.svelte";

const SHEET_HEIGHT = 460;
const PEEK = 132;
const PEEK_OFFSET = SHEET_HEIGHT - PEEK;

// jsdom lays nothing out; without a height every rest position would be 0.
Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
  configurable: true,
  get: () => SHEET_HEIGHT,
});

const body = createRawSnippet(() => ({ render: () => "<p>detail</p>" }));

// svelte/motion reads matchMedia once at import, so the reading itself is faked.
function reducedMotion(on: boolean) {
  vi.spyOn(prefersReducedMotion, "current", "get").mockReturnValue(on);
}

const mount = (props: Record<string, unknown> = {}) =>
  render(BottomSheet, {
    props: {
      label: "Details",
      peekHeight: PEEK,
      expandedHeight: SHEET_HEIGHT,
      children: body,
      ...props,
    },
  });

const sheetOf = (c: HTMLElement) =>
  c.querySelector<HTMLElement>('[aria-label="Details"]')!;
const scrimOf = () =>
  document.querySelector<HTMLElement>('[aria-hidden="true"]')!;

/** Downward translate written to the sheet, px. */
const offsetOf = (el: HTMLElement) =>
  Number(/translate3d\(0, (-?[\d.]+)px/.exec(el.style.transform)?.[1] ?? NaN);

afterEach(() => reducedMotion(false));

describe("BottomSheet", () => {
  it("rests at peek on mount, with the scrim fully clear", () => {
    reducedMotion(false);
    const { container } = mount();
    expect(offsetOf(sheetOf(container))).toBeCloseTo(PEEK_OFFSET, 1);
    expect(scrimOf().style.opacity).toBe("0");
  });

  it("mounts already expanded when told to", () => {
    reducedMotion(false);
    const { container } = mount({ expanded: true });
    expect(offsetOf(sheetOf(container))).toBeCloseTo(0, 1);
    expect(scrimOf().style.opacity).toBe("1");
  });

  it("springs to expanded and drives the scrim in the same frame", async () => {
    reducedMotion(false);
    const { container, rerender } = mount();
    const sheet = sheetOf(container);
    await rerender({ expanded: true });
    await waitFor(() => expect(offsetOf(sheet)).toBeCloseTo(0, 1), {
      timeout: 2000,
    });
    expect(scrimOf().style.opacity).toBe("1");
  });

  it("springs back to peek when collapsed", async () => {
    reducedMotion(false);
    const { container, rerender } = mount({ expanded: true });
    const sheet = sheetOf(container);
    await rerender({ expanded: false });
    await waitFor(
      () => expect(offsetOf(sheet)).toBeCloseTo(PEEK_OFFSET, 1),
      { timeout: 2000 },
    );
    expect(scrimOf().style.opacity).toBe("0");
  });

  it("snaps without animating under prefers-reduced-motion", async () => {
    reducedMotion(true);
    const { container, rerender } = mount();
    const sheet = sheetOf(container);
    expect(offsetOf(sheet)).toBeCloseTo(PEEK_OFFSET, 1);
    await rerender({ expanded: true });
    // No frame has passed, so arriving means it snapped.
    expect(offsetOf(sheet)).toBeCloseTo(0, 1);
  });

  it("expands from the grabber and reports a user collapse", async () => {
    reducedMotion(true);
    const onclose = vi.fn();
    const { container } = mount({ onclose });
    const grabber = container.querySelector("button")!;
    grabber.click();
    await waitFor(() => expect(offsetOf(sheetOf(container))).toBeCloseTo(0, 1));
    expect(onclose).not.toHaveBeenCalled();
    grabber.click();
    await waitFor(() =>
      expect(offsetOf(sheetOf(container))).toBeCloseTo(PEEK_OFFSET, 1)
    );
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it("traps focus while expanded and releases it at peek", async () => {
    reducedMotion(true);
    const outside = document.body.appendChild(document.createElement("button"));
    outside.focus();
    const { container, rerender } = mount();
    const sheet = sheetOf(container);
    expect(outside).toHaveFocus();

    await rerender({ expanded: true });
    expect(sheet).toHaveFocus();
    outside.focus();
    expect(sheet).toHaveFocus();

    await rerender({ expanded: false });
    await waitFor(() => expect(outside).toHaveFocus());
    outside.remove();
  });

  it("leaves an Escape to a nested layer, then collapses on the next", async () => {
    reducedMotion(true);
    const onclose = vi.fn();
    const { container, getByRole, findByText, queryByText } = render(Harness, {
      props: {
        label: "Details",
        peekHeight: PEEK,
        expandedHeight: SHEET_HEIGHT,
        expanded: true,
        onclose,
      },
    });
    const sheet = sheetOf(container);
    // Hover opens the popover without moving focus out of the sheet.
    await userEvent.hover(getByRole("button", { name: "Beneficial owner" }));
    await findByText(/natural person/);

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(queryByText(/natural person/)).toBeNull());
    expect(offsetOf(sheet)).toBeCloseTo(0, 1);
    expect(onclose).not.toHaveBeenCalled();

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(offsetOf(sheet)).toBeCloseTo(PEEK_OFFSET, 1));
    expect(onclose).toHaveBeenCalledOnce();
  });

  describe("under bits-ui layers", () => {
    // Competing focus traps recurse until the stack overflows, which jsdom reports as a window error.
    const errors: unknown[] = [];
    const onError = (event: ErrorEvent) => errors.push(event.error);
    beforeEach(() => {
      errors.length = 0;
      globalThis.addEventListener("error", onError);
      reducedMotion(true);
    });
    afterEach(() => {
      globalThis.removeEventListener("error", onError);
      expect(errors).toEqual([]);
    });

    const mountLayers = () =>
      render(Harness, {
        props: {
          label: "Details",
          peekHeight: PEEK,
          expandedHeight: SHEET_HEIGHT,
          expanded: true,
        },
      });

    it("gives focus to the Header's drawer, and traps it again after", async () => {
      const { container, getByRole } = mountLayers();
      const sheet = sheetOf(container);
      await userEvent.click(getByRole("button", { name: "Open menu" }));
      await waitFor(() =>
        expect(getByRole("dialog", { name: "Menu" })).toHaveFocus()
      );

      await userEvent.keyboard("{Escape}");
      await waitFor(() => expect(sheet).toHaveFocus());
      expect(offsetOf(sheet)).toBeCloseTo(0, 1);
      const outside = document.body.appendChild(
        document.createElement("button"),
      );
      outside.focus();
      expect(sheet).toHaveFocus();
      outside.remove();
    });

    it("gives focus to a popover opened inside", async () => {
      const { getByRole } = mountLayers();
      await userEvent.setup({ skipHover: true }).click(
        getByRole("button", { name: "Beneficial owner" }),
      );
      await waitFor(() =>
        expect(document.querySelector("[data-popover-content]"))
          .toContainElement(
            document.activeElement as HTMLElement,
          )
      );
    });

    it("gives focus to the phone country search", async () => {
      const { getByRole, findByPlaceholderText } = mountLayers();
      await userEvent.click(getByRole("button", { name: /^Country code/ }));
      const search = await findByPlaceholderText("Search");
      await waitFor(() => expect(search).toHaveFocus());
    });
  });

  it("spreads element attributes onto the sheet and merges its class", () => {
    reducedMotion(false);
    const { container } = mount({
      id: "details",
      "aria-describedby": "details-hint",
      class: "rounded-t-none",
    });
    const sheet = sheetOf(container);
    expect(sheet).toHaveAttribute("id", "details");
    expect(sheet).toHaveAttribute("aria-describedby", "details-hint");
    expect(sheet).toHaveClass("rounded-t-none", "bg-surface-raised");
    expect(sheet).not.toHaveClass("rounded-t-[22px]");
  });

  // `buttons: 1`: use-gesture drops a pointerdown without the primary button held.
  const pointer = (type: string, clientY: number) =>
    new PointerEvent(type, {
      bubbles: true,
      clientY,
      pointerId: 1,
      isPrimary: true,
      buttons: 1,
    });

  /**
   * Drags with a zero release velocity, so only the midpoint rule applies: a
   * pointerup more than 32 ms after the last move makes use-gesture recompute
   * kinematics from a zero delta.
   */
  async function drag(el: HTMLElement, from: number, to: number) {
    el.dispatchEvent(pointer("pointerdown", from));
    el.dispatchEvent(pointer("pointermove", (from + to) / 2));
    el.dispatchEvent(pointer("pointermove", to));
    await new Promise((r) => setTimeout(r, 40));
    el.dispatchEvent(pointer("pointerup", to));
  }

  it("collapses when dragged down past the midpoint", async () => {
    reducedMotion(true);
    const onclose = vi.fn();
    const { container } = mount({ expanded: true, onclose });
    const sheet = sheetOf(container);
    await drag(sheet, 0, PEEK_OFFSET);
    await waitFor(() => expect(offsetOf(sheet)).toBeCloseTo(PEEK_OFFSET, 1));
    expect(onclose).toHaveBeenCalledTimes(1);
  });

  it("expands when dragged up past the midpoint", async () => {
    reducedMotion(true);
    const { container } = mount();
    const sheet = sheetOf(container);
    await drag(sheet, PEEK_OFFSET, 0);
    await waitFor(() => expect(offsetOf(sheet)).toBeCloseTo(0, 1));
  });

  it("returns to its origin when the drag never crosses the midpoint", async () => {
    reducedMotion(true);
    const onclose = vi.fn();
    const { container } = mount({ expanded: true, onclose });
    const sheet = sheetOf(container);
    await drag(sheet, 0, 40);
    await waitFor(() => expect(offsetOf(sheet)).toBeCloseTo(0, 1));
    expect(onclose).not.toHaveBeenCalled();
  });

  it("does not toggle when a drag ends on the grabber", async () => {
    reducedMotion(true);
    const { container } = mount({ expanded: true });
    const sheet = sheetOf(container);
    const grabber = container.querySelector("button")!;
    // The ghost click after the drag must not collapse it (filterTaps).
    await drag(grabber, 0, 40);
    grabber.dispatchEvent(
      new MouseEvent("click", { bubbles: true, detail: 1 }),
    );
    await waitFor(() => expect(offsetOf(sheet)).toBeCloseTo(0, 1));
  });

  it("yields to the scroller when expanded and scrolled away from the top", async () => {
    reducedMotion(true);
    const { container } = mount({ expanded: true });
    const sheet = sheetOf(container);
    const scroller = container.querySelector<HTMLElement>(".overflow-y-auto")!;
    Object.defineProperty(scroller, "scrollTop", {
      configurable: true,
      value: 120,
    });
    await drag(scroller, 0, PEEK_OFFSET);
    expect(offsetOf(sheet)).toBeCloseTo(0, 1);
  });

  it("keeps the reserved chrome strip clear and stays non-modal", () => {
    reducedMotion(false);
    const { container } = mount({ expanded: true, bottomInset: 64 });
    const sheet = sheetOf(container);
    expect(sheet.style.bottom).toBe("64px");
    expect(sheet.getAttribute("aria-modal")).toBeNull();
    expect(sheet).not.toHaveFocus();
    expect(sheet.className).toContain("z-30");
  });
});
