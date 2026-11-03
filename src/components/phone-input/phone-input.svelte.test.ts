import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "svelte";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import { PhoneInput } from "@gravity-community/svelte/phone-input";
import {
  composeOptionalPhone,
  composePhone,
  COUNTRIES,
  splitPhone,
} from "@gravity-community/svelte/phone";

const tel = (c: HTMLElement) =>
  c.querySelector('input[type="tel"]') as HTMLInputElement;
const trigger = () => screen.getByRole("button", { name: /^Country code/ });
const option = (name: string) =>
  screen.getByRole("option", { name: new RegExp(`^${name}`) });
const closed = () =>
  waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());

async function pick(name: string) {
  const user = userEvent.setup();
  await user.click(trigger());
  await user.click(
    await screen.findByRole("option", { name: new RegExp(`^${name}`) }),
  );
}

// A real form, so a test can watch what reaches it.
function renderInForm(props: ComponentProps<typeof PhoneInput>) {
  const form = document.body.appendChild(document.createElement("form"));
  const submit = vi.fn((event: Event) => event.preventDefault());
  form.addEventListener("submit", submit);
  render(PhoneInput, { target: form, props });
  return { form, submit };
}

describe("PhoneInput", () => {
  it("renders a tel input and a trigger with the country's flag, dial code and name", () => {
    const { container } = render(PhoneInput, { props: { country: "cz" } });
    expect(tel(container).type).toBe("tel");
    expect(trigger()).toHaveTextContent("+420");
    expect(trigger()).toHaveAccessibleName("Country code: Czechia (+420)");
    expect(trigger().querySelector("svg")).not.toBeNull();
  });

  it("opens a searchable list with one option per country", async () => {
    render(PhoneInput, { props: { country: "cz" } });
    await userEvent.setup().click(trigger());

    expect(await screen.findAllByRole("option")).toHaveLength(COUNTRIES.length);
    await waitFor(() => expect(screen.getByRole("combobox")).toHaveFocus());
    expect(option("Czechia")).toHaveAttribute("aria-selected", "true");
  });

  // "de" is no fuzzy match for "Germany", so only the ISO code can find it.
  it("filters by name, dial code or ISO code", async () => {
    render(PhoneInput, { props: { country: "cz" } });
    await userEvent.setup().click(trigger());
    const search = await screen.findByPlaceholderText("Search");

    for (
      const [query, name] of [
        ["Slovak", "Slovakia"],
        ["+421", "Slovakia"],
        ["de", "Germany"],
      ] as const
    ) {
      await fireEvent.input(search, { target: { value: query } });
      expect(option(name)).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: /^Czechia/ })).toBeNull();
    }
  });

  it("selects a country, closes the list and refocuses the trigger", async () => {
    render(PhoneInput, { props: { country: "cz" } });
    await pick("Slovakia");

    expect(trigger()).toHaveTextContent("+421");
    await waitFor(() =>
      expect(trigger()).toHaveAccessibleName("Country code: Slovakia (+421)")
    );
    await closed();
    await waitFor(() => expect(trigger()).toHaveFocus());
  });

  // fireEvent.click leaves focus where it was, as Safari does, so bits-ui has nothing to restore.
  it("returns focus to the trigger when the click did not focus it (Safari)", async () => {
    render(PhoneInput, { props: { country: "cz" } });
    await fireEvent.click(trigger());
    const search = await screen.findByPlaceholderText("Search");
    await waitFor(() => expect(search).toHaveFocus());

    await userEvent.setup().keyboard("{ArrowDown}{Enter}");
    await closed();
    await waitFor(() => expect(trigger()).toHaveFocus());
  });

  it("picks a country with the arrow keys and Enter", async () => {
    render(PhoneInput, { props: { country: "cz" } });
    const user = userEvent.setup();
    trigger().focus();
    await user.keyboard("{Enter}");
    const search = await screen.findByPlaceholderText("Search");
    await waitFor(() => expect(search).toHaveFocus());

    await user.keyboard("{ArrowDown}{Enter}");
    const next = COUNTRIES[COUNTRIES.findIndex((c) => c.code === "cz") + 1];
    expect(trigger()).toHaveTextContent(next.dial);
  });

  it("opens the list 4px below the whole field, from its start edge", async () => {
    // jsdom lays nothing out, so the viewport, the field and its trigger get boxes by hand.
    vi.spyOn(document.documentElement, "clientWidth", "get")
      .mockReturnValue(1024);
    vi.spyOn(document.documentElement, "clientHeight", "get")
      .mockReturnValue(768);
    onTestFinished(() => {
      vi.restoreAllMocks();
    });
    const box = (x: number, y: number, width: number, height: number) => () =>
      DOMRect.fromRect({ x, y, width, height });
    const { container } = render(PhoneInput, { props: { country: "cz" } });
    const shell = container.firstElementChild as HTMLElement;
    shell.getBoundingClientRect = box(100, 200, 320, 48);
    trigger().getBoundingClientRect = box(114, 212, 60, 24);

    await userEvent.setup().click(trigger());
    const panel = (await screen.findByRole("listbox")).closest<HTMLElement>(
      "[data-bits-floating-content-wrapper]",
    );
    await waitFor(() =>
      expect(panel?.style.transform).toBe("translate(100px, 252px)")
    );
  });

  // jsdom boxes are empty, so a click only lands outside the list with coordinates off it.
  it("closes the list when the number field is clicked", async () => {
    const { container } = render(PhoneInput, { props: { country: "cz" } });
    const user = userEvent.setup();
    await user.click(trigger());
    await screen.findByRole("listbox");

    await user.pointer({
      keys: "[MouseLeft]",
      target: tel(container),
      coords: { clientX: 200, clientY: 200 },
    });
    await closed();
  });

  // The delay outlasts bits-ui's 10 ms outside-click debounce, as a real click does.
  it("closes the list, and keeps it closed, when the trigger is clicked again", async () => {
    render(PhoneInput, { props: { country: "cz" } });
    const user = userEvent.setup({ delay: 20 });
    await user.click(trigger());
    await screen.findByRole("listbox");

    const coords = { clientX: 200, clientY: 200 };
    await user.pointer([
      { keys: "[MouseLeft>]", target: trigger(), coords },
      { keys: "[/MouseLeft]", target: trigger(), coords },
    ]);
    await closed();
  });

  it("groups digits as they are typed", async () => {
    const { container } = render(PhoneInput, { props: { country: "cz" } });
    const input = tel(container);
    input.value = "601123456";
    await fireEvent.input(input);
    expect(input.value).toBe("601 123 456");
  });

  it("forwards the caller's oninput", async () => {
    const oninput = vi.fn();
    const { container } = render(PhoneInput, {
      props: { country: "cz", oninput },
    });
    const input = tel(container);
    input.value = "601123456";
    await fireEvent.input(input);
    expect(oninput).toHaveBeenCalledOnce();
    expect(input.value).toBe("601 123 456");
  });

  // Under sk these digits match no format; correcting the country to cz groups them.
  it("reformats the number when the country changes", async () => {
    const { container } = render(PhoneInput, {
      props: { country: "sk", value: "601123456" },
    });
    await pick("Czechia");
    expect(tel(container).value).toBe("601 123 456");
  });

  it("posts the country through a hidden input under its own name", async () => {
    const { container } = render(PhoneInput, {
      props: { country: "cz", name: "phone", countryName: "phone_country" },
    });
    const hidden = container.querySelector<HTMLInputElement>(
      'input[type="hidden"]',
    );
    expect(tel(container).name).toBe("phone");
    expect(hidden?.name).toBe("phone_country");
    expect(hidden?.value).toBe("cz");

    await pick("Slovakia");
    expect(hidden?.value).toBe("sk");
  });

  it("fires input and change from the hidden input when the country changes", async () => {
    const { form } = renderInForm({
      country: "cz",
      countryName: "phone_country",
    });
    const seen: string[] = [];
    for (const type of ["input", "change"]) {
      form.addEventListener(type, (event) => {
        const { name, value } = event.target as HTMLInputElement;
        seen.push(`${event.type} ${name}=${value}`);
      });
    }

    await pick("Slovakia");
    await waitFor(() =>
      expect(seen).toEqual([
        "input phone_country=sk",
        "change phone_country=sk",
      ])
    );

    // Like a native select, re-picking the current country fires nothing.
    await closed();
    await pick("Slovakia");
    await closed();
    expect(seen).toHaveLength(2);
  });

  it("never submits the surrounding form", async () => {
    const { form, submit } = renderInForm({ country: "cz" });
    await pick("Slovakia");
    expect(submit).not.toHaveBeenCalled();

    // Positive control: jsdom does submit on button activation.
    await userEvent.setup().click(
      form.appendChild(document.createElement("button")),
    );
    expect(submit).toHaveBeenCalledOnce();
  });

  it("disables all three controls together", () => {
    const { container } = render(PhoneInput, {
      props: { country: "cz", countryName: "phone_country", disabled: true },
    });
    expect(tel(container)).toBeDisabled();
    expect(trigger()).toBeDisabled();
    expect(container.querySelector('input[type="hidden"]')).toBeDisabled();
  });

  it("marks only the tel input aria-invalid", () => {
    const { container } = render(PhoneInput, {
      props: { country: "cz", invalid: true },
    });
    expect(tel(container)).toHaveAttribute("aria-invalid", "true");
    expect(trigger()).not.toHaveAttribute("aria-invalid");
  });
});

describe("country data", () => {
  it("keeps codes lowercase and unique", () => {
    const codes = COUNTRIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes.every((c) => /^[a-z]{2}$/.test(c))).toBe(true);
  });

  // Names are the picker's item values, so they must be unique too.
  it("keeps names unique and dial codes in +digits form", () => {
    const names = COUNTRIES.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
    expect(COUNTRIES.every((c) => /^\+\d+( \d+)?$/.test(c.dial))).toBe(true);
  });

  it("round-trips a national number through E.164", () => {
    expect(composePhone("cz", "601 123 456")).toBe("+420601123456");
    expect(splitPhone("+420601123456")).toEqual({
      country: "cz",
      national: "601 123 456",
    });
    expect(composeOptionalPhone("cz", "  ")).toBe("");
  });
});
