import { fireEvent, render } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { createRawSnippet } from "svelte";
import { Input } from "@gravity-community/svelte";
import { GLYPHS } from "../icon/glyphs.ts";
import Harness from "./input-form-harness.svelte";

// Icon renders a bare <svg>, so its path data is the only way to tell glyphs apart.
const glyphOf = (b: HTMLButtonElement | null) => {
  const d = b?.querySelector("svg path")?.getAttribute("d");
  return d == null
    ? undefined
    : Object.keys(GLYPHS).find((k) =>
      GLYPHS[k as keyof typeof GLYPHS].includes(`d="${d}"`)
    );
};

const toggle = (c: HTMLElement) =>
  c.querySelector<HTMLButtonElement>(
    '[aria-label="Show password"], [aria-label="Hide password"]',
  );
const up = (c: HTMLElement) =>
  c.querySelector<HTMLButtonElement>('[aria-label="Increase value"]');
const down = (c: HTMLElement) =>
  c.querySelector<HTMLButtonElement>('[aria-label="Decrease value"]');
const field = (c: HTMLElement) => c.querySelector("input") as HTMLInputElement;

describe("Input", () => {
  it("merges a caller class over the shell", () => {
    const { container } = render(Input, { props: { class: "w-80" } });
    const shell = field(container).parentElement as HTMLElement;
    expect(shell).toHaveClass("w-80");
    expect(shell).not.toHaveClass("w-full");
  });

  it("marks an invalid field aria-invalid", () => {
    const { container } = render(Input, { props: { invalid: true } });
    expect(field(container)).toHaveAttribute("aria-invalid", "true");
  });
});

describe("Input password reveal", () => {
  it("renders a reveal toggle on type=password", () => {
    const { container } = render(Input, { props: { type: "password" } });
    expect(toggle(container)).not.toBeNull();
  });

  it("gives the toggle type=button", () => {
    const { container } = render(Input, { props: { type: "password" } });
    expect(toggle(container)?.type).toBe("button");
  });

  it("does not submit the surrounding form when toggled", async () => {
    const { container, getByTestId, getByText } = render(Harness, {
      props: { type: "password" },
    });

    await fireEvent.click(toggle(container)!);
    expect(getByTestId("submits").textContent).toBe("0");

    // Positive control: jsdom does submit on button activation.
    await fireEvent.click(getByText("Go"));
    expect(getByTestId("submits").textContent).toBe("1");
  });

  it("flips the native type between password and text", async () => {
    const { container } = render(Input, { props: { type: "password" } });
    const input = field(container);

    expect(input.type).toBe("password");
    await fireEvent.click(toggle(container)!);
    expect(input.type).toBe("text");
    await fireEvent.click(toggle(container)!);
    expect(input.type).toBe("password");
  });

  it("tracks state in aria-pressed and the aria-label", async () => {
    const { container } = render(Input, { props: { type: "password" } });

    expect(toggle(container)?.getAttribute("aria-pressed")).toBe("false");
    expect(toggle(container)?.getAttribute("aria-label")).toBe("Show password");

    await fireEvent.click(toggle(container)!);
    expect(toggle(container)?.getAttribute("aria-pressed")).toBe("true");
    expect(toggle(container)?.getAttribute("aria-label")).toBe("Hide password");
  });

  it("swaps the eye for a crossed eye while revealed", async () => {
    const { container } = render(Input, { props: { type: "password" } });

    expect(glyphOf(toggle(container))).toBe("eye");
    await fireEvent.click(toggle(container)!);
    expect(glyphOf(toggle(container))).toBe("eye-off");
    await fireEvent.click(toggle(container)!);
    expect(glyphOf(toggle(container))).toBe("eye");
  });

  it("starts hidden and is disabled with the input", () => {
    const { container } = render(Input, {
      props: { type: "password", disabled: true },
    });
    expect(field(container).type).toBe("password");
    expect(toggle(container)?.disabled).toBe(true);
  });

  it("is keyboard reachable", () => {
    const { container } = render(Input, { props: { type: "password" } });
    expect(toggle(container)?.getAttribute("tabindex")).toBeNull();
  });
});

describe("Input number steppers", () => {
  it("renders both steppers as type=button on type=number", () => {
    const { container } = render(Input, { props: { type: "number" } });
    expect(up(container)?.type).toBe("button");
    expect(down(container)?.type).toBe("button");
  });

  it("does not submit the surrounding form when stepped", async () => {
    const { container, getByTestId } = render(Harness, {
      props: { type: "number", value: 1 },
    });
    await fireEvent.click(up(container)!);
    await fireEvent.click(down(container)!);
    expect(getByTestId("submits").textContent).toBe("0");
  });

  it("writes a number back to the bound value, matching the native input", async () => {
    const { container, getByTestId } = render(Harness, {
      props: { type: "number", value: 1 },
    });

    await fireEvent.click(up(container)!);
    expect(getByTestId("bound").textContent).toBe("2");
    expect(getByTestId("bound-type").textContent).toBe("number");
  });

  // Pins the native side of the contract above, so the two cannot drift apart.
  it("agrees with what typing into the native input produces", async () => {
    const { container, getByTestId } = render(Harness, {
      props: { type: "number", value: 1 },
    });

    await fireEvent.input(field(container), { target: { value: "7" } });
    expect(getByTestId("bound-type").textContent).toBe("number");
  });

  it("honours step", async () => {
    const { container, getByTestId } = render(Harness, {
      props: { type: "number", value: 10, step: 5 },
    });

    await fireEvent.click(up(container)!);
    expect(getByTestId("bound").textContent).toBe("15");
    await fireEvent.click(down(container)!);
    await fireEvent.click(down(container)!);
    expect(getByTestId("bound").textContent).toBe("5");
  });

  it("keeps fractional steps free of float drift", async () => {
    const { container, getByTestId } = render(Harness, {
      props: { type: "number", value: 0.2, step: 0.1 },
    });
    await fireEvent.click(up(container)!);
    expect(getByTestId("bound").textContent).toBe("0.3");
  });

  it("does not step past max or min, and disables at the bound", async () => {
    const { container, getByTestId } = render(Harness, {
      props: { type: "number", value: 4, min: 0, max: 5 },
    });

    await fireEvent.click(up(container)!);
    expect(getByTestId("bound").textContent).toBe("5");
    expect(up(container)?.disabled).toBe(true);
    expect(down(container)?.disabled).toBe(false);

    for (let i = 0; i < 6; i++) await fireEvent.click(down(container)!);
    expect(getByTestId("bound").textContent).toBe("0");
    expect(down(container)?.disabled).toBe(true);
    expect(up(container)?.disabled).toBe(false);
  });

  // min=1 max=4 step=2 allows only 1 and 3; parking on 4 would fail validation with no way forward.
  it("clamps to the last on-grid value, not to a bare max", async () => {
    const { container, getByTestId } = render(Harness, {
      props: { type: "number", value: 1, min: 1, max: 4, step: 2 },
    });
    const input = field(container);

    await fireEvent.click(up(container)!);
    expect(getByTestId("bound").textContent).toBe("3");
    await fireEvent.click(up(container)!);
    expect(getByTestId("bound").textContent).toBe("3");

    expect(input.validity.stepMismatch).toBe(false);
    expect(input.checkValidity()).toBe(true);
    expect(up(container)?.disabled).toBe(true);
  });

  it("snaps an off-grid value onto the grid in the direction of travel", async () => {
    const { container, getByTestId } = render(Harness, {
      props: { type: "number", value: 3, min: 0, step: 5 },
    });

    await fireEvent.click(up(container)!);
    expect(getByTestId("bound").textContent).toBe("5");
    expect(field(container).validity.stepMismatch).toBe(false);
  });

  // 0.05 + 0.1 is 0.15000000000000002; rounding to the step's one decimal would give an off-grid 0.2.
  it("keeps a min finer than its step on the grid", async () => {
    const { container, getByTestId } = render(Harness, {
      props: { type: "number", value: 0.05, min: 0.05, step: 0.1 },
    });

    await fireEvent.click(up(container)!);
    expect(getByTestId("bound").textContent).toBe("0.15");
    expect(field(container).validity.stepMismatch).toBe(false);
  });

  // String(1e-7) is "1e-7", which has no "." for a decimal count to find.
  it("keeps steps finer than 1e-6 on the grid", async () => {
    const { container, getByTestId } = render(Harness, {
      props: { type: "number", value: 0, step: "0.0000001" },
    });

    await fireEvent.click(up(container)!);
    expect(getByTestId("bound").textContent).toBe("1e-7");
    await fireEvent.click(up(container)!);
    expect(getByTestId("bound").textContent).toBe("2e-7");
  });

  it("snaps an off-grid fractional value onto the grid", async () => {
    const { container, getByTestId } = render(Harness, {
      props: { type: "number", value: 0.1, step: 0.2 },
    });

    await fireEvent.click(up(container)!);
    expect(getByTestId("bound").textContent).toBe("0.2");
  });

  it.each([0, -1, "any"])("treats a step of %s as 1", async (step) => {
    const { container, getByTestId } = render(Harness, {
      props: { type: "number", value: 5, step },
    });

    await fireEvent.click(up(container)!);
    expect(getByTestId("bound").textContent).toBe("6");
    expect(getByTestId("bound-type").textContent).toBe("number");
  });

  it("snaps an off-grid value downward on decrement", async () => {
    const { container, getByTestId } = render(Harness, {
      props: { type: "number", value: 3, min: 0, step: 5 },
    });

    await fireEvent.click(down(container)!);
    expect(getByTestId("bound").textContent).toBe("0");
  });

  it("steps an empty field up to the nearer bound", async () => {
    const { container, getByTestId } = render(Harness, {
      props: { type: "number", min: 3, max: 9 },
    });

    await fireEvent.click(up(container)!);
    expect(getByTestId("bound").textContent).toBe("3");
  });

  // An empty field counts as 0, so a decrement goes to -step and clamps; it never jumps to max.
  it("steps an empty field down, never up to max", async () => {
    const { container, getByTestId } = render(Harness, {
      props: { type: "number", min: 0, max: 100 },
    });

    await fireEvent.click(down(container)!);
    expect(getByTestId("bound").textContent).toBe("0");
  });

  it("steps an empty unbounded field down to negative step", async () => {
    const { container, getByTestId } = render(Harness, {
      props: { type: "number" },
    });

    await fireEvent.click(down(container)!);
    expect(getByTestId("bound").textContent).toBe("-1");
  });

  it("does not let min/max flip the direction of a step", async () => {
    const { container, getByTestId } = render(Harness, {
      props: { type: "number", min: 3, max: 9 },
    });

    await fireEvent.click(down(container)!);
    expect(getByTestId("bound").textContent).toBe("3");
  });

  it("disables both steppers with the input", () => {
    const { container } = render(Input, {
      props: { type: "number", disabled: true },
    });
    expect(up(container)?.disabled).toBe(true);
    expect(down(container)?.disabled).toBe(true);
  });

  it("hides the native spinner and forwards min/max/step to the element", () => {
    const { container } = render(Input, {
      props: { type: "number", min: 1, max: 4, step: 2 },
    });
    const input = field(container);

    expect(input).toHaveClass("[appearance:textfield]");
    expect(input.getAttribute("min")).toBe("1");
    expect(input.getAttribute("max")).toBe("4");
    expect(input.getAttribute("step")).toBe("2");
  });
});

describe("Input trailing-slot precedence", () => {
  const callerTrailing = createRawSnippet(() => ({
    render: () => '<i data-testid="caller-trailing"></i>',
  }));

  it("renders neither affordance on type=text", () => {
    const { container } = render(Input, { props: { type: "text" } });
    expect(toggle(container)).toBeNull();
    expect(up(container)).toBeNull();
    expect(container.querySelector("button")).toBeNull();
  });

  it("lets loading win over the type-driven affordance", () => {
    const { container } = render(Input, {
      props: { type: "password", loading: true },
    });
    expect(toggle(container)).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  // Loading hides the toggle, so a revealed password would be stranded on screen.
  it("re-hides a revealed password while loading owns the slot", async () => {
    const { container, rerender } = render(Input, {
      props: { type: "password" },
    });
    const input = field(container);

    await fireEvent.click(toggle(container)!);
    expect(input.type).toBe("text");

    await rerender({ type: "password", loading: true });
    expect(input.type).toBe("password");
  });

  it("lets the type-driven affordance win over a caller's trailingIcon", () => {
    const { container } = render(Input, {
      props: { type: "password", trailingIcon: callerTrailing },
    });
    expect(toggle(container)).not.toBeNull();
    expect(container.querySelector('[data-testid="caller-trailing"]'))
      .toBeNull();
  });

  it("still renders a trailingIcon on a plain text field", () => {
    const { container } = render(Input, {
      props: { type: "text", trailingIcon: callerTrailing },
    });
    expect(container.querySelector('[data-testid="caller-trailing"]'))
      .not.toBeNull();
  });
});

describe("Input mask", () => {
  it("formats a pattern as it is typed, and binds what it shows", async () => {
    const { container, getByTestId } = render(Harness, {
      props: { mask: "### ## ###" },
    });
    await userEvent.type(field(container), "27082440");
    expect(field(container)).toHaveValue("270 82 440");
    expect(getByTestId("bound")).toHaveTextContent("270 82 440");
  });

  it("sets the case of letter slots", async () => {
    const { container } = render(Input, { props: { mask: "AAAA" } });
    await userEvent.type(field(container), "ab12");
    expect(field(container)).toHaveValue("AB12");
  });

  it("formats a value it starts with", () => {
    const { container, getByTestId } = render(Harness, {
      props: { mask: "### ##", value: "11000" },
    });
    expect(field(container)).toHaveValue("110 00");
    expect(getByTestId("bound")).toHaveTextContent("110 00");
  });
});
