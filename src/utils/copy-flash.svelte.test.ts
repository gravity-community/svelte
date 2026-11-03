import { flushSync } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CopyFlash } from "@gravity-community/svelte";

function stubClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn(writeText) },
    configurable: true,
  });
}

describe("CopyFlash", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    stubClipboard(() => Promise.resolve());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts idle", () => {
    expect(new CopyFlash().copied()).toBe(false);
  });

  it("writes the text and flashes", async () => {
    const flash = new CopyFlash();
    await flash.copy("hello");
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("hello");
    expect(flash.copied()).toBe(true);
  });

  it("clears the flash after the reset window", async () => {
    const flash = new CopyFlash();
    await flash.copy("hello");
    vi.advanceTimersByTime(1500);
    expect(flash.copied()).toBe(false);
  });

  it("flashes only the copied key", async () => {
    const flash = new CopyFlash();
    await flash.copy("value", "row-a");
    expect(flash.copied("row-a")).toBe(true);
    expect(flash.copied("row-b")).toBe(false);
  });

  it("re-arms the window when a second row is copied", async () => {
    const flash = new CopyFlash();
    await flash.copy("a", "row-a");
    vi.advanceTimersByTime(1000);
    await flash.copy("b", "row-b");
    vi.advanceTimersByTime(1000);
    expect(flash.copied("row-b")).toBe(true);
  });

  it("does not flash when the clipboard is unavailable", async () => {
    stubClipboard(() => Promise.reject(new Error("insecure context")));
    const flash = new CopyFlash();
    await flash.copy("hello");
    expect(flash.copied()).toBe(false);
  });

  it("drops the pending reset once nothing reads the flash", async () => {
    const flash = new CopyFlash();
    const teardown = $effect.root(() => {
      $effect(() => {
        flash.copied();
      });
    });
    flushSync();
    await flash.copy("hello");
    expect(vi.getTimerCount()).toBe(1);
    teardown();
    await Promise.resolve();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps the reset while something still reads the flash", async () => {
    const flash = new CopyFlash();
    const teardown = $effect.root(() => {
      $effect(() => {
        flash.copied();
      });
    });
    flushSync();
    await flash.copy("hello");
    await Promise.resolve();
    expect(vi.getTimerCount()).toBe(1);
    teardown();
  });

  it("honours a custom reset window", async () => {
    const flash = new CopyFlash(500);
    await flash.copy("hello");
    vi.advanceTimersByTime(499);
    expect(flash.copied()).toBe(true);
    vi.advanceTimersByTime(1);
    expect(flash.copied()).toBe(false);
  });
});
