import { render } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { createRawSnippet } from "svelte";
import { describe, expect, it, vi } from "vitest";
import { Link } from "@gravity-community/svelte";

const label = createRawSnippet(() => ({ render: () => "<span>Docs</span>" }));

describe("Link", () => {
  it("renders an anchor with href", () => {
    const { getByRole } = render(Link, {
      props: { href: "/docs", target: "_blank", children: label },
    });
    const link = getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders a non-submitting button without href", async () => {
    const onclick = vi.fn();
    const onsubmit = vi.fn((event: Event) => event.preventDefault());
    const form = document.body.appendChild(document.createElement("form"));
    form.addEventListener("submit", onsubmit);
    const { getByRole } = render(Link, {
      target: form,
      props: { onclick, children: label },
    });

    const button = getByRole("button", { name: "Docs" });
    expect(button).toHaveAttribute("type", "button");
    await userEvent.click(button);
    expect(onclick).toHaveBeenCalledOnce();
    expect(onsubmit).not.toHaveBeenCalled();
  });

  it("keeps a caller's type", () => {
    const { getByRole } = render(Link, {
      props: { type: "submit", children: label },
    });
    expect(getByRole("button", { name: "Docs" })).toHaveAttribute(
      "type",
      "submit",
    );
  });
});
