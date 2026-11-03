import { render } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VerdictActions } from "@gravity-community/svelte";

describe("VerdictActions", () => {
  it("reports the chosen verdict", async () => {
    const user = userEvent.setup();
    const onverdict = vi.fn();
    const { getByRole } = render(VerdictActions, { props: { onverdict } });

    await user.click(getByRole("button", { name: "Reject" }));
    await user.click(getByRole("button", { name: "Flag" }));

    expect(onverdict.mock.calls).toEqual([["reject"], ["flag"]]);
  });

  it("is one toolbar tab stop, with arrow keys between verdicts", async () => {
    const user = userEvent.setup();
    const { getByRole } = render(VerdictActions);

    expect(getByRole("toolbar", { name: "Verdict" })).toBeInTheDocument();
    await user.tab();
    expect(getByRole("button", { name: "Approve" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(getByRole("button", { name: "Reject" })).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
  });
});
