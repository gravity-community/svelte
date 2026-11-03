import { render } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { GlossaryTerm } from "@gravity-community/svelte";

const props = {
  term: "Beneficial owner",
  translation: "skutečný majitel",
  definition: "The natural person who ultimately owns or controls a company.",
};

// A plain click hovers first, and the hover alone would open the popover.
const click = (element: Element) =>
  userEvent.setup({ skipHover: true }).click(element);

describe("GlossaryTerm", () => {
  it("opens on click and shows the definition", async () => {
    const { getByRole, getByText } = render(GlossaryTerm, { props });
    const trigger = getByRole("button", { name: "Beneficial owner" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await click(trigger);
    await tick();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(getByText(props.definition)).toBeInTheDocument();
    expect(getByText(props.translation)).toBeInTheDocument();
  });

  it("opens on Enter", async () => {
    const { getByRole, getByText } = render(GlossaryTerm, { props });
    const trigger = getByRole("button", { name: "Beneficial owner" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await tick();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(getByText(props.definition)).toBeInTheDocument();
  });

  it("opens on hover", async () => {
    const { getByRole, findByText } = render(GlossaryTerm, { props });
    await userEvent.hover(getByRole("button", { name: "Beneficial owner" }));
    expect(await findByText(props.definition)).toBeInTheDocument();
  });

  it("opens when told to", () => {
    const { getByRole, getByText } = render(GlossaryTerm, {
      props: { ...props, open: true },
    });
    expect(getByRole("button", { name: "Beneficial owner" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(getByText(props.definition)).toBeInTheDocument();
  });

  it("reports open changes", async () => {
    const onOpenChange = vi.fn();
    const { getByRole } = render(GlossaryTerm, {
      props: { ...props, onOpenChange },
    });
    await click(getByRole("button", { name: "Beneficial owner" }));
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
  });
});
