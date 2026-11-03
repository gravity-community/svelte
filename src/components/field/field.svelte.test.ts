import { render, screen } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import { describe, expect, it } from "vitest";
import { Field } from "@gravity-community/svelte";

const control = createRawSnippet(() => ({
  render: () => `<input id="email" />`,
}));

describe("Field", () => {
  it("labels the control it points at", () => {
    render(Field, {
      props: { label: "Email", for: "email", children: control },
    });
    expect(screen.getByLabelText("Email")).toHaveAttribute("id", "email");
  });

  it("shows a hint under the control", () => {
    render(Field, {
      props: { label: "Email", hint: "We never share it", children: control },
    });
    expect(screen.getByText("We never share it")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows a read-only value in place of the control", () => {
    render(Field, {
      props: { label: "Company", value: "Interzone s.r.o.", children: control },
    });
    expect(screen.getByText("Interzone s.r.o.")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("announces the error", () => {
    render(Field, {
      props: { label: "Email", error: "Required", children: control },
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
  });

  it("lets a long label wrap", () => {
    const label =
      "Has the client been subject to sanctions in the last five years?";
    render(Field, { props: { label, for: "email", children: control } });
    expect(screen.getByText(label)).not.toHaveClass("whitespace-nowrap");
  });

  it("renders no label without one", () => {
    const { container } = render(Field, { props: { children: control } });
    expect(container.querySelector("label")).toBeNull();
  });
});
