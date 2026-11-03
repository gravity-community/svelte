import { render } from "@testing-library/svelte";
import type { ComponentProps } from "svelte";
import { afterEach, describe, expect, it } from "vitest";
import Harness from "./bind-ref-harness.svelte";

// InputOtp's PinInput re-syncs on 0/10/50 ms timers it never clears; let them run before each unmount.
afterEach(() => new Promise((resolve) => setTimeout(resolve, 60)));

// What each wrapper's bind:ref receives: the element its caller's class lands on.
const cases: [ComponentProps<typeof Harness>["name"], string][] = [
  ["Checkbox", "button[data-checkbox-root]"],
  ["Collapsible", "div[data-collapsible-root]"],
  ["GlossaryTerm", "button[data-popover-trigger]"],
  ["InputOtp", "div[data-pin-input-root]"],
  ["Link", "a[data-button-root]"],
  ["SegmentedControl", "div[data-toggle-group-root]"],
  ["SegmentedControl links", "div[role=group]"],
  ["Select", "button[data-select-trigger]"],
  ["Separator", "div[data-separator-root]"],
  ["StepList", "ol[data-accordion-root]"],
  ["Tab", "button[data-button-root]"],
  ["VerdictActions", "div[data-toolbar-root]"],
];

describe("bind:ref", () => {
  it.each(cases)("%s binds %s", (name, selector) => {
    const bound: { ref: HTMLElement | null } = { ref: null };
    const { container } = render(Harness, {
      props: {
        name,
        get ref() {
          return bound.ref;
        },
        set ref(next: HTMLElement | null) {
          bound.ref = next;
        },
      },
    });
    expect(bound.ref).toBeInstanceOf(HTMLElement);
    expect(bound.ref).toBe(container.querySelector(selector));
  });
});
