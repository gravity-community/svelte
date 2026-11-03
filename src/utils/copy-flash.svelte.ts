import { createSubscriber } from "svelte/reactivity";

/**
 * Copies text to the clipboard and flashes the copied key for `resetMs`, so a
 * copy button can swap its glyph. A failed write doesn't flash. The pending
 * reset is dropped once nothing reads `copied()`, so callers need no teardown.
 */
export class CopyFlash {
  /** The just-copied key: `""` for a single target, `null` while idle. */
  key = $state<string | null>(null);

  #timer: ReturnType<typeof setTimeout> | undefined;
  #resetMs: number;
  #subscribe = createSubscriber(() => () => {
    clearTimeout(this.#timer);
    this.#timer = undefined;
  });

  constructor(resetMs = 1500) {
    this.#resetMs = resetMs;
  }

  copied(key = ""): boolean {
    this.#subscribe();
    return this.key === key;
  }

  async copy(text: string, key = ""): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    this.key = key;
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => (this.key = null), this.#resetMs);
  }
}
