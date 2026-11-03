import { fireEvent, render } from "@testing-library/svelte";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InputOtp } from "@gravity-community/svelte";

// PinInput re-syncs on 0/10/50 ms timers it never clears; let them run before each unmount.
afterEach(() => new Promise((resolve) => setTimeout(resolve, 60)));

const input = (c: HTMLElement) => c.querySelector("input") as HTMLInputElement;

const paste = (el: HTMLInputElement, text: string) =>
  fireEvent.paste(el, { clipboardData: { getData: () => text } });

const flushMicrotasks = () =>
  new Promise((resolve) => queueMicrotask(() => resolve(null)));

// Coming back to a full code selects its last digit.
async function typeAndReturn(
  user: UserEvent,
  el: HTMLInputElement,
  code: string,
) {
  await user.type(el, code);
  el.blur();
  await user.click(el);
}

describe("InputOtp", () => {
  it("renders one real input wired for OTP autofill", () => {
    const { container } = render(InputOtp, { props: { format: "3-3" } });
    const el = input(container);

    expect(container.querySelectorAll("input")).toHaveLength(1);
    expect(el.getAttribute("autocomplete")).toBe("one-time-code");
    expect(el.getAttribute("inputmode")).toBe("numeric");
    expect(el.getAttribute("maxlength")).toBe("6");
  });

  it("draws one cell per character in two groups", () => {
    const { container } = render(InputOtp, { props: { format: "4-4" } });
    expect(container.querySelectorAll("[data-pin-input-cell]")).toHaveLength(8);
    expect(input(container).getAttribute("inputmode")).toBe("text");
  });

  it("draws borderless tiles when tinted", () => {
    const cell = (variant?: "tinted") =>
      render(InputOtp, { props: { format: "3-3", variant } }).container
        .querySelector("[data-pin-input-cell]")!.className.split(" ");

    expect(cell()).toEqual(
      expect.arrayContaining([
        "border",
        "border-border-interactive",
        "bg-surface",
      ]),
    );
    expect(cell("tinted")).toEqual(
      expect.arrayContaining(["bg-field-tinted", "rounded-xl"]),
    );
    expect(cell("tinted")).not.toContain("border");
    expect(cell("tinted").some((c) => c.startsWith("border-"))).toBe(false);
  });

  it("keeps the segmented display hidden from assistive tech", () => {
    const { container } = render(InputOtp, {
      props: { format: "3-3", value: "914" },
    });
    const cells = container.querySelector('[aria-hidden="true"]');

    expect(cells?.textContent).toContain("9");
    expect(cells?.querySelector("input")).toBeNull();
  });

  it("strips non-digits and caps at 6 on format 3-3", async () => {
    const { container } = render(InputOtp, { props: { format: "3-3" } });
    const el = input(container);

    await fireEvent.input(el, { target: { value: "12a34b5678" } });
    expect(el.value).toBe("123456");
  });

  it("rejects letters outright on format 3-3", async () => {
    const { container } = render(InputOtp, { props: { format: "3-3" } });
    const el = input(container);

    await fireEvent.input(el, { target: { value: "abc" } });
    expect(el.value).toBe("");
  });

  it("blocks invalid keys while typing", async () => {
    const user = userEvent.setup();
    const { container } = render(InputOtp, { props: { format: "3-3" } });
    const el = input(container);

    await user.type(el, "1a2-3");
    expect(el.value).toBe("123");
  });

  it("uppercases and caps at 8 on format 4-4", async () => {
    const { container } = render(InputOtp, { props: { format: "4-4" } });
    const el = input(container);

    expect(el.getAttribute("maxlength")).toBe("8");
    await fireEvent.input(el, { target: { value: "7q2md4kx9z" } });
    expect(el.value).toBe("7Q2MD4KX");
  });

  it("uppercases a backup code as it is typed", async () => {
    const user = userEvent.setup();
    const { container } = render(InputOtp, { props: { format: "4-4" } });
    const el = input(container);

    await user.type(el, "7q2m");
    expect(el.value).toBe("7Q2M");
  });

  it("strips separators out of a pasted code", async () => {
    const { container } = render(InputOtp, { props: { format: "4-4" } });
    const el = input(container);

    await paste(el, "7Q2M-D4KX");
    expect(el.value).toBe("7Q2MD4KX");
  });

  it("replaces the whole value with a pasted code", async () => {
    const { container } = render(InputOtp, { props: { format: "3-3" } });
    const el = input(container);

    await fireEvent.input(el, { target: { value: "12" } });
    await paste(el, "914 203");
    expect(el.value).toBe("914203");
  });

  it("ignores a paste that filters to nothing instead of wiping the value", async () => {
    const user = userEvent.setup();
    const { container } = render(InputOtp, { props: { format: "3-3" } });
    const el = input(container);

    await user.type(el, "914");
    await user.paste("----");
    expect(el.value).toBe("914");

    await typeAndReturn(user, el, "203");
    expect([el.selectionStart, el.selectionEnd]).toEqual([5, 6]);
    await user.paste("----");
    expect(el.value).toBe("914203");

    el.setSelectionRange(0, 6);
    await user.paste("abc");
    expect(el.value).toBe("914203");
  });

  it("sets aria-invalid when invalid", () => {
    const { container } = render(InputOtp, {
      props: { format: "3-3", invalid: true },
    });
    expect(input(container).getAttribute("aria-invalid")).toBe("true");
  });

  it("carries name and id so a form posts the code and a label reaches it", () => {
    const { container } = render(InputOtp, {
      props: { format: "3-3", name: "code", id: "otp" },
    });
    expect(input(container).getAttribute("name")).toBe("code");
    expect(input(container).id).toBe("otp");
  });

  it("fires oncomplete once when the code reaches full length", async () => {
    const oncomplete = vi.fn();
    const { container } = render(InputOtp, {
      props: { format: "3-3", oncomplete },
    });
    const el = input(container);

    await fireEvent.input(el, { target: { value: "91420" } });
    expect(oncomplete).not.toHaveBeenCalled();

    await fireEvent.input(el, { target: { value: "914203" } });
    expect(oncomplete).toHaveBeenCalledWith("914203");

    await fireEvent.input(el, { target: { value: "914203" } });
    expect(oncomplete).toHaveBeenCalledTimes(1);
  });

  it("fires oncomplete on a full paste", async () => {
    const oncomplete = vi.fn();
    const { container } = render(InputOtp, {
      props: { format: "4-4", oncomplete },
    });

    await paste(input(container), "7q2m-d4kx");
    expect(oncomplete).toHaveBeenCalledWith("7Q2MD4KX");
  });

  it("fires oncomplete when a retyped digit changes a full code", async () => {
    const user = userEvent.setup();
    const oncomplete = vi.fn();
    const { container } = render(InputOtp, {
      props: { format: "3-3", oncomplete },
    });
    const el = input(container);

    await typeAndReturn(user, el, "914203");
    await user.keyboard("7");
    expect(el.value).toBe("914207");
    expect(oncomplete.mock.calls).toEqual([["914203"], ["914207"]]);
  });

  it("disables the input with the component", () => {
    const { container } = render(InputOtp, {
      props: { format: "3-3", disabled: true },
    });
    expect(input(container).disabled).toBe(true);
  });
});

describe("InputOtp autofocus and autosubmit", () => {
  it("takes focus on mount when asked", () => {
    const { container } = render(InputOtp, { format: "3-3", autofocus: true });
    expect(document.activeElement).toBe(input(container));
  });

  it("leaves focus alone by default", () => {
    const { container } = render(InputOtp, { format: "3-3" });
    expect(document.activeElement).not.toBe(input(container));
  });

  it("never steals focus while disabled", () => {
    const { container } = render(InputOtp, {
      format: "3-3",
      autofocus: true,
      disabled: true,
    });
    expect(document.activeElement).not.toBe(input(container));
  });

  it("submits the surrounding form once the code is complete", async () => {
    const form = document.createElement("form");
    document.body.appendChild(form);
    const submit = vi.fn();
    form.requestSubmit = submit;

    render(InputOtp, {
      props: { format: "3-3", autosubmit: true },
      target: form,
    });
    const el = form.querySelector("input")!;

    await fireEvent.input(el, { target: { value: "12345" } });
    await flushMicrotasks();
    expect(submit).not.toHaveBeenCalled();

    await fireEvent.input(el, { target: { value: "123456" } });
    await flushMicrotasks();
    expect(submit).toHaveBeenCalledOnce();

    form.remove();
  });

  it("submits again when a pasted code replaces a full one", async () => {
    const user = userEvent.setup();
    const form = document.createElement("form");
    document.body.appendChild(form);
    const submit = vi.fn();
    form.requestSubmit = submit;
    const oncomplete = vi.fn();

    render(InputOtp, {
      props: { format: "3-3", autosubmit: true, oncomplete },
      target: form,
    });
    const el = form.querySelector("input")!;

    await typeAndReturn(user, el, "914203");
    await user.paste("123456");
    await flushMicrotasks();
    expect(el.value).toBe("123456");
    expect(oncomplete.mock.calls).toEqual([["914203"], ["123456"]]);
    expect(submit).toHaveBeenCalledTimes(2);

    form.remove();
  });

  it("does not submit when autosubmit is off", async () => {
    const form = document.createElement("form");
    document.body.appendChild(form);
    const submit = vi.fn();
    form.requestSubmit = submit;

    render(InputOtp, { props: { format: "3-3" }, target: form });
    const el = form.querySelector("input")!;

    await fireEvent.input(el, { target: { value: "123456" } });
    await flushMicrotasks();
    expect(submit).not.toHaveBeenCalled();

    form.remove();
  });
});
