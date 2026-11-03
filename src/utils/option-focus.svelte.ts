type Props = Record<string, unknown>;

const STARTS = ["ArrowDown", "ArrowUp"];
const MOVES = ["Home", "End", "PageUp", "PageDown"];

/**
 * Keeps a bits-ui Select or Combobox from showing an active option until the user moves to one.
 * bits-ui highlights the selected or first option as the list opens, which reads as a choice made
 * for the user, and Enter would pick it. Until the user moves, the highlight and the field's
 * aria-activedescendant are hidden and the pick keys do nothing. ArrowDown then goes to the
 * selected option or the first, ArrowUp to the selected option or the last, and Tab commits an
 * option the user moved to, as WAI-ARIA's select-only combobox does.
 */
export class OptionFocus {
  /** Whether the user has moved to an option since the list opened. */
  moved = $state(false);
  /** The open list: the content's `ref`. */
  list = $state<HTMLElement | null>(null);

  #picks: readonly string[];

  /** `picks`: the keys that pick the active option. */
  constructor(picks: readonly string[]) {
    this.#picks = picks;
  }

  reset = () => {
    this.moved = false;
  };

  /** The field's keydown. It runs ahead of bits-ui's, which a prevented event skips. */
  onkeydown = (event: KeyboardEvent) => {
    const list = this.list;
    if (!list) {
      // An arrow that opens the list shows its active option at once.
      if (STARTS.includes(event.key)) this.moved = true;
      return;
    }
    if (event.key === "Tab") {
      if (this.moved && list.querySelector("[data-highlighted]")) {
        // Svelte delegates keydown to the root, so the event must bubble to reach bits-ui.
        event.currentTarget?.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
            cancelable: true,
          }),
        );
      }
      return;
    }
    if (this.moved) return;
    if (STARTS.includes(event.key)) {
      event.preventDefault();
      this.moved = true;
      const options = [
        ...list.querySelectorAll<HTMLElement>(
          "[role=option]:not([data-disabled])",
        ),
      ];
      const start = options.find((o) =>
        o.getAttribute("aria-selected") === "true"
      ) ??
        (event.key === "ArrowDown" ? options[0] : options.at(-1));
      // bits-ui moves its highlight to the option a pointer moves over.
      start?.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          pointerType: "mouse",
        }),
      );
      start?.scrollIntoView?.({ block: "nearest" });
    } else if (this.#picks.includes(event.key)) {
      event.preventDefault();
    } else if (MOVES.includes(event.key) || event.key.length === 1) {
      // bits-ui's own moves, and a select's typeahead.
      this.moved = true;
    }
  };

  /** The field's bits-ui props, announcing no active option until the user moves. */
  field = (props: Props): Props => ({
    ...props,
    "aria-activedescendant": this.moved
      ? props["aria-activedescendant"]
      : undefined,
  });

  /** An option's bits-ui props, its highlight hidden until the user moves, and a disabled one announced as such. */
  option = (props: Props): Props => ({
    ...props,
    // bits-ui marks a disabled option with data-disabled only.
    "aria-disabled": props["data-disabled"] === undefined ? undefined : "true",
    "data-highlighted": this.moved ? props["data-highlighted"] : undefined,
    onpointermove: (event: PointerEvent) => {
      this.moved = true;
      (props.onpointermove as ((event: PointerEvent) => void) | undefined)?.(
        event,
      );
    },
  });
}
