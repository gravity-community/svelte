import { fireEvent, render } from "@testing-library/svelte";
import { describe, expect, it, vi } from "vitest";
import { FileUpload } from "@gravity-community/svelte";

const removeButton = (c: HTMLElement, name: string) =>
  c.querySelector(`[aria-label="Remove ${name}"]`) as HTMLButtonElement | null;

describe("FileUpload removal", () => {
  it("offers removal on a row the server refused", () => {
    const { container } = render(FileUpload, {
      props: {
        files: [{
          name: "ed25519.pem",
          status: "invalid",
          reason: "not an RSA key",
        }],
        onremove: () => {},
      },
    });

    expect(container.querySelector('[role="alert"]')?.textContent?.trim())
      .toBe("not an RSA key");
    expect(removeButton(container, "ed25519.pem")).not.toBeNull();
  });

  it("reports the removed row to the caller", async () => {
    const onremove = vi.fn();
    const { container } = render(FileUpload, {
      props: {
        files: [{
          name: "ed25519.pem",
          status: "invalid",
          reason: "not an RSA key",
        }],
        onremove,
      },
    });

    await fireEvent.click(removeButton(container, "ed25519.pem")!);
    expect(onremove).toHaveBeenCalledWith(0);
  });

  it("removes the right row out of several", async () => {
    const onremove = vi.fn();
    const { container } = render(FileUpload, {
      props: {
        files: [
          { name: "a.pem" },
          { name: "b.pem", status: "invalid", reason: "not an RSA key" },
        ],
        onremove,
      },
    });

    await fireEvent.click(removeButton(container, "b.pem")!);
    expect(onremove).toHaveBeenCalledWith(1);
  });

  it("still offers removal on an accepted row", () => {
    const { container } = render(FileUpload, {
      props: { filename: "public.pem", onremove: () => {} },
    });
    expect(removeButton(container, "public.pem")).not.toBeNull();
  });

  it("gives the remove control type=button so it never submits a form", () => {
    const { container } = render(FileUpload, {
      props: { filename: "public.pem", onremove: () => {} },
    });
    expect(removeButton(container, "public.pem")?.type).toBe("button");
  });

  it("leaves a row mid-upload alone", () => {
    const { container } = render(FileUpload, {
      props: {
        files: [{ name: "big.core", status: "uploading", progress: 40 }],
        onremove: () => {},
      },
    });
    expect(removeButton(container, "big.core")).toBeNull();
  });

  it("renders no remove control when the caller offers no handler", () => {
    const { container } = render(FileUpload, {
      props: {
        files: [{
          name: "public.pem",
          status: "invalid",
          reason: "not an RSA key",
        }],
      },
    });
    expect(removeButton(container, "public.pem")).toBeNull();
  });
});

describe("FileUpload multiple", () => {
  const affordance = (c: HTMLElement) =>
    Array.from(c.querySelectorAll("button"))
      .map((s) => s.textContent?.trim())
      .find((t) => t === "Add more files" || t === "Replace file");

  it("offers more files when multiple", () => {
    const { container } = render(FileUpload, {
      props: { files: [{ name: "a.pem" }], multiple: true },
    });
    expect(affordance(container)).toBe("Add more files");
  });

  it("offers a replacement when single", () => {
    const { container } = render(FileUpload, {
      props: { filename: "entity-graph.core", multiple: false },
    });
    expect(affordance(container)).toBe("Replace file");
  });

  it("lets an explicit label win over both defaults", () => {
    const { container } = render(FileUpload, {
      props: {
        files: [{ name: "a.pem" }],
        multiple: true,
        addLabel: "Add another key",
      },
    });
    expect(affordance(container)).toBeUndefined();
    expect(container.textContent).toContain("Add another key");
  });

  it("passes multiple through to the file input", () => {
    const { container } = render(FileUpload, { props: { multiple: false } });
    const input = container.querySelector<HTMLInputElement>(
      'input[type="file"]',
    );
    expect(input?.multiple).toBe(false);
  });
});

describe("FileUpload state", () => {
  const input = (c: HTMLElement) =>
    c.querySelector<HTMLInputElement>('input[type="file"]')!;

  it("marks the input invalid", () => {
    const { container } = render(FileUpload, {
      props: { filename: "bundle.core", invalid: true },
    });
    expect(input(container).getAttribute("aria-invalid")).toBe("true");
  });

  it("leaves a valid input unmarked", () => {
    const { container } = render(FileUpload, {
      props: { filename: "bundle.core" },
    });
    expect(input(container).hasAttribute("aria-invalid")).toBe(false);
  });

  it("disables the input and the browse button", () => {
    const { container, getByRole } = render(FileUpload, {
      props: { disabled: true, placeholder: "Drop a bundle" },
    });
    expect(input(container).disabled).toBe(true);
    expect(getByRole("button", { name: "Drop a bundle" })).toBeDisabled();
  });

  it("opens the picker from the browse button", async () => {
    const { container, getByRole } = render(FileUpload, {
      props: { placeholder: "Drop a bundle" },
    });
    const click = vi.spyOn(input(container), "click");
    await fireEvent.click(getByRole("button", { name: "Drop a bundle" }));
    expect(click).toHaveBeenCalledOnce();
  });

  it("takes a drop on the input's parent", async () => {
    const onfiles = vi.fn();
    const { container } = render(FileUpload, { props: { onfiles } });
    const file = new File(["key"], "public.pem");
    await fireEvent.drop(input(container).parentElement!, {
      dataTransfer: { files: [file] },
    });
    expect(onfiles).toHaveBeenCalledOnce();
  });

  it("ignores a drop while disabled", async () => {
    const onfiles = vi.fn();
    const { container } = render(FileUpload, {
      props: { disabled: true, onfiles },
    });
    await fireEvent.drop(input(container).parentElement!, {
      dataTransfer: { files: [new File(["key"], "public.pem")] },
    });
    expect(onfiles).not.toHaveBeenCalled();
  });
});
