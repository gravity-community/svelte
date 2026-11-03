import { render, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { type ComponentProps, createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { StepList, type StepListStep } from "@gravity-community/svelte";

const steps: StepListStep[] = [
  { title: "Company", meta: "Northwind Ltd · 04512839", status: "done" },
  { title: "Bank account", status: "current" },
  { title: "Documents", meta: "After Bank account", status: "waiting" },
  { title: "Review", meta: "Can't be done yet", status: "blocked", value: "r" },
];

const content = createRawSnippet((step: () => StepListStep) => ({
  render: () => `<p>${step().title} body</p>`,
}));

const setup = (props: Partial<ComponentProps<typeof StepList>> = {}) =>
  render(StepList, { props: { steps, content, ...props } });

// The header button is named by its title, its state and its meta line.
const header = (title: string) => ({ name: new RegExp(`^${title} \\(`) });

describe("StepList", () => {
  it("shows each state in the circle and names it for assistive tech", () => {
    const { getByRole } = setup();
    const circle = (title: string) =>
      getByRole("button", header(title)).querySelector(".rounded-full");

    expect(getByRole("button", header("Company"))).toHaveAccessibleName(
      "Company (done) Northwind Ltd · 04512839",
    );
    expect(circle("Company")).toHaveClass("bg-success-subtle");
    expect(circle("Company")?.querySelector("svg")).not.toBeNull();

    expect(getByRole("button", header("Bank account"))).toHaveAccessibleName(
      "Bank account (current)",
    );
    expect(circle("Bank account")).toHaveClass("bg-info-subtle");
    expect(circle("Bank account")).toHaveTextContent("2");

    expect(getByRole("button", header("Documents"))).toHaveAccessibleName(
      "Documents (waiting) After Bank account",
    );
    expect(circle("Documents")).toHaveClass("bg-neutral-subtle");
    expect(circle("Documents")).toHaveTextContent("3");

    expect(getByRole("button", header("Review"))).toHaveAccessibleName(
      "Review (blocked) Can't be done yet",
    );
    expect(circle("Review")).toHaveClass("bg-warning-subtle");
    expect(circle("Review")?.querySelector("svg")).not.toBeNull();
  });

  it("is an ordered list of level-3 headings, ruled between steps", () => {
    const { container, getByRole, getAllByRole } = setup();
    expect(getByRole("list").tagName).toBe("OL");
    expect(getAllByRole("listitem")).toHaveLength(4);
    expect(getAllByRole("heading", { level: 3 })).toHaveLength(4);
    expect(container.querySelectorAll("[data-separator-root]")).toHaveLength(3);
  });

  it("opens the step whose value, or else title, matches", () => {
    const { getByRole, getByText, rerender } = setup({ value: "Bank account" });
    expect(getByRole("button", header("Bank account"))).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(getByText("Bank account body")).toBeVisible();
    expect(getByText("Company body")).not.toBeVisible();

    rerender({ value: "r" });
    expect(getByRole("button", header("Review"))).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(getByRole("button", header("Bank account"))).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("keeps one step open at a time, and lets the open one close", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getByRole, getByText } = setup({ onValueChange });
    const company = getByRole("button", header("Company"));
    const bank = getByRole("button", header("Bank account"));

    await user.click(company);
    expect(company).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => expect(getByText("Company body")).toBeVisible());

    await user.click(bank);
    expect(company).toHaveAttribute("aria-expanded", "false");
    expect(bank).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => expect(getByText("Company body")).not.toBeVisible());

    await user.click(bank);
    expect(bank).toHaveAttribute("aria-expanded", "false");
    expect(onValueChange.mock.calls).toEqual([
      ["Company"],
      ["Bank account"],
      [""],
    ]);
  });

  it("opens a waiting or a blocked step", async () => {
    const user = userEvent.setup();
    const { getByRole, getByText } = setup();

    await user.click(getByRole("button", header("Documents")));
    await waitFor(() => expect(getByText("Documents body")).toBeVisible());

    await user.click(getByRole("button", header("Review")));
    await waitFor(() => expect(getByText("Review body")).toBeVisible());
  });

  it("swaps plus for minus on the open step", async () => {
    const { getByRole } = setup();
    const bank = getByRole("button", header("Bank account"));
    const icon = () => bank.querySelector("svg")!.innerHTML;
    const closed = icon();

    await userEvent.click(bank);
    expect(icon()).not.toBe(closed);
    await userEvent.click(bank);
    expect(icon()).toBe(closed);
  });

  it("moves between headers with the arrow keys, Home and End", async () => {
    const user = userEvent.setup();
    const { getByRole } = setup();
    const [company, bank, , review] = steps.map(({ title }) =>
      getByRole("button", header(title))
    );

    await user.tab();
    expect(company).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(bank).toHaveFocus();
    await user.keyboard("{End}");
    expect(review).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(company).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(review).toHaveFocus();
    await user.keyboard("{Home}");
    expect(company).toHaveFocus();
  });

  it("toggles the focused step with Enter and Space", async () => {
    const user = userEvent.setup();
    const { getByRole } = setup();
    const documents = getByRole("button", header("Documents"));

    documents.focus();
    await user.keyboard("{Enter}");
    expect(documents).toHaveAttribute("aria-expanded", "true");
    await user.keyboard(" ");
    expect(documents).toHaveAttribute("aria-expanded", "false");
  });
});

describe("StepList that can't collapse", () => {
  it("keeps the open step open on a click, Enter or Space", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getByRole, getByText } = setup({
      value: "Bank account",
      collapsible: false,
      onValueChange,
    });
    const bank = getByRole("button", header("Bank account"));

    await user.click(bank);
    expect(bank).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(bank).toHaveAttribute("aria-expanded", "true");
    expect(getByText("Bank account body")).toBeVisible();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("marks only the open header aria-disabled, without its minus", () => {
    const { getByRole } = setup({ value: "Bank account", collapsible: false });
    const bank = getByRole("button", header("Bank account"));
    const documents = getByRole("button", header("Documents"));

    // Both circles show a number, so an icon is the disclosure.
    expect(bank).toHaveAttribute("aria-disabled", "true");
    expect(bank.querySelector("svg")).toBeNull();
    expect(documents).toHaveAttribute("aria-disabled", "false");
    expect(documents.querySelector("svg")).not.toBeNull();
  });

  it("hands the open state to another step, which then holds it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { getByRole, getByText } = setup({
      value: "Bank account",
      collapsible: false,
      onValueChange,
    });
    const bank = getByRole("button", header("Bank account"));
    const documents = getByRole("button", header("Documents"));

    await user.click(documents);
    expect(documents).toHaveAttribute("aria-expanded", "true");
    expect(documents).toHaveAttribute("aria-disabled", "true");
    expect(documents.querySelector("svg")).toBeNull();
    expect(bank).toHaveAttribute("aria-expanded", "false");
    expect(bank).toHaveAttribute("aria-disabled", "false");
    expect(bank.querySelector("svg")).not.toBeNull();
    await waitFor(() =>
      expect(getByText("Bank account body")).not.toBeVisible()
    );

    await user.click(documents);
    expect(documents).toHaveAttribute("aria-expanded", "true");
    expect(onValueChange.mock.calls).toEqual([["Documents"]]);
  });

  it("opens a first step when none is open", async () => {
    const user = userEvent.setup();
    const { getByRole } = setup({ collapsible: false });
    const company = getByRole("button", header("Company"));

    await user.click(company);
    expect(company).toHaveAttribute("aria-expanded", "true");
    await user.click(company);
    expect(company).toHaveAttribute("aria-expanded", "true");
  });

  it("still moves between headers from the open one", async () => {
    const user = userEvent.setup();
    const { getByRole } = setup({ value: "Bank account", collapsible: false });
    const bank = getByRole("button", header("Bank account"));

    bank.focus();
    await user.keyboard("{ArrowDown}");
    expect(getByRole("button", header("Documents"))).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(bank).toHaveFocus();
  });

  it("follows a value set from outside, none included", async () => {
    const { getByRole, rerender } = setup({
      value: "Bank account",
      collapsible: false,
    });
    await rerender({ value: "" });
    expect(getByRole("button", header("Bank account"))).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
