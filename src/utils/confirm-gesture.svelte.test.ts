import { describe, expect, it } from "vitest";
import { ConfirmGesture } from "@gravity-community/svelte";

describe("ConfirmGesture", () => {
  it("starts idle", () => {
    const gesture = new ConfirmGesture();
    expect(gesture.pending).toBe(false);
  });

  it("first confirm() arms without committing", () => {
    const gesture = new ConfirmGesture();
    expect(gesture.confirm()).toBe(false);
    expect(gesture.pending).toBe(true);
  });

  it("second confirm() commits and clears pending", () => {
    const gesture = new ConfirmGesture();
    gesture.confirm();
    expect(gesture.confirm()).toBe(true);
    expect(gesture.pending).toBe(false);
  });

  it("a third confirm() after commit re-arms rather than double-firing", () => {
    const gesture = new ConfirmGesture();
    gesture.confirm();
    gesture.confirm();
    expect(gesture.confirm()).toBe(false);
    expect(gesture.pending).toBe(true);
  });

  it("cancel() clears pending", () => {
    const gesture = new ConfirmGesture();
    gesture.confirm();
    gesture.cancel();
    expect(gesture.pending).toBe(false);
  });

  it("cancel() is a no-op when already idle", () => {
    const gesture = new ConfirmGesture();
    gesture.cancel();
    expect(gesture.pending).toBe(false);
  });

  it("gestures are independent of each other", () => {
    const a = new ConfirmGesture();
    const b = new ConfirmGesture();
    a.confirm();
    expect(a.pending).toBe(true);
    expect(b.pending).toBe(false);
  });
});
