import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Probe from "./energy-scope-probe.svelte";

describe("EnergyScope", () => {
  it("gives nothing outside any scope", () => {
    render(Probe);
    const probe = screen.getByTestId("probe");
    expect(probe).not.toHaveAttribute("data-level");
    expect(probe).not.toHaveAttribute("data-fill");
  });

  it("reaches a component rendered in its children snippet", () => {
    render(Probe, { props: { scopes: [{ level: "1", fill: "info" }] } });
    const probe = screen.getByTestId("probe");
    expect(probe).toHaveAttribute("data-level", "1");
    expect(probe).toHaveAttribute("data-fill", "info");
  });

  it("lets an inner scope win over an outer one", () => {
    render(Probe, {
      props: { scopes: [{ level: "2", fill: "info" }, { level: "0" }] },
    });
    const probe = screen.getByTestId("probe");
    expect(probe).toHaveAttribute("data-level", "0");
    expect(probe).not.toHaveAttribute("data-fill");
  });

  it("resets the scope when given none, as overlays do", () => {
    render(Probe, {
      props: { scopes: [{ level: "2", fill: "danger" }, undefined] },
    });
    const probe = screen.getByTestId("probe");
    expect(probe).not.toHaveAttribute("data-level");
    expect(probe).not.toHaveAttribute("data-fill");
  });

  it("updates its parts in place when the level changes", async () => {
    const { rerender } = render(Probe, {
      props: { scopes: [{ level: "2", fill: "success" }] },
    });
    const probe = screen.getByTestId("probe");
    await rerender({ scopes: [{ level: "1" }] });
    expect(screen.getByTestId("probe")).toBe(probe);
    expect(probe).toHaveAttribute("data-level", "1");
    expect(probe).not.toHaveAttribute("data-fill");
  });
});
