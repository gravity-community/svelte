<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const combobox = tv({
  slots: {
    // The list hangs from the whole field, glyph included, not from the bare <input>.
    root: "relative w-full",
    // A held pick covers the field, which stays mounted and focused: only its glyph and text hide.
    // Forced colours repaint transparent text, so there it takes the background's colour.
    hidden:
      "[&_input]:cursor-default [&_input]:text-transparent [&_input]:caret-transparent [&_input]:selection:bg-transparent [&_input]:forced-colors:text-[Canvas] [&_input]:forced-colors:caret-[Canvas] [&>span:first-child]:invisible",
    selection: "pointer-events-none absolute flex items-center",
    text: "flex min-w-0 flex-1 flex-col",
    title: "truncate font-medium text-fg",
    meta: "truncate text-muted-fg",
    // Muted like Input's reveal; its hit area reaches the field's edge but only into the gap toward the text.
    remove:
      "pointer-events-auto relative flex shrink-0 items-center justify-center text-muted-fg transition-colors before:absolute before:-inset-y-2 before:-start-1 before:-end-2.5 before:content-[''] hover:text-fg",
    busy: "flex shrink-0 items-center justify-center text-muted-fg",
    // The panel and its items match Select's.
    content:
      "z-50 max-h-72 w-(--bits-combobox-anchor-width) overflow-clip rounded-xl border border-border-subtle bg-surface-raised text-fg outline-none",
    scroll:
      "flex cursor-default items-center justify-center py-1 text-subtle-fg",
  },
  variants: {
    // Bordered fields inset their content by the border.
    variant: {
      default: { selection: "inset-px" },
      tinted: { selection: "inset-0" },
      outline: { selection: "inset-px" },
    },
    // The two lines fit the field's own height, so a pick moves nothing below it.
    size: {
      sm: {
        selection: "gap-1.5 px-2.5",
        title: "text-xs leading-4",
        meta: "text-[11px] leading-3.5",
        remove: "size-3.5",
        busy: "size-3.5",
      },
      md: {
        selection: "gap-2 px-3.5",
        title: "text-sm leading-5",
        meta: "text-xs leading-4",
        remove: "size-4",
        busy: "size-4",
      },
      lg: {
        selection: "gap-2.5 px-4.5",
        title: "text-base leading-6",
        meta: "text-sm leading-5",
        remove: "size-[18px]",
        busy: "size-[18px]",
      },
    },
    disabled: {
      true: {
        selection: "opacity-60",
        title: "text-disabled-fg",
        meta: "text-disabled-fg",
      },
    },
  },
});
</script>

<script lang="ts">
import { Combobox } from "bits-ui";
import { flushSync } from "svelte";
import { cn } from "../../utils/classes.ts";
import { OptionFocus } from "../../utils/option-focus.svelte.ts";
import Icon from "../icon/icon.svelte";
import type { InputSize, InputVariant } from "../input/types.ts";
import ResultOption from "../result-option/result-option.svelte";
import SearchInput from "../search-input/search-input.svelte";
import Spinner from "../spinner/spinner.svelte";
import type { ComboboxItem } from "./types.ts";

type Props =
  & Omit<
    Combobox.InputProps,
    | "child"
    | "children"
    | "ref"
    | "defaultValue"
    | "size"
    | "type"
    | "name"
    | "disabled"
    | "required"
    | "readonly"
  >
  & {
    /** The matches; the list stays closed while there are none. A held pick is shown from here, so keep it among them. */
    items: ComboboxItem[];
    /** The picked item's value; "" while nothing is picked. */
    value?: string;
    /** The typed text. A held pick leaves it as it is, so removing the pick brings it back. */
    inputValue?: string;
    open?: boolean;
    /** Holds a pick in the field, its title and meta with a cross, until the user removes it. Without it a pick is the caller's cue to move on. */
    holdPick?: boolean;
    variant?: InputVariant;
    size?: InputSize;
    invalid?: boolean;
    /** Trailing spinner while matches load, typing staying live; on a held pick, in place of its cross. */
    loading?: boolean;
    disabled?: boolean;
    /** Renders a hidden input so a form post carries the value. */
    name?: string;
    required?: boolean;
    ref?: HTMLInputElement | null;
    onValueChange?: (value: string) => void;
    onOpenChange?: (open: boolean) => void;
  };

let {
  items,
  value = $bindable(""),
  inputValue = $bindable(""),
  open = $bindable(false),
  holdPick = false,
  variant = "tinted",
  size = "md",
  invalid = false,
  loading = false,
  disabled = false,
  name,
  required = false,
  ref = $bindable(null),
  onValueChange,
  onOpenChange,
  oninput,
  onkeydown,
  onpaste,
  class: className,
  "aria-describedby": describedBy,
  ...rest
}: Props = $props();

const metaId = $props.id();
let field = $state<HTMLDivElement | null>(null);
const focus = new OptionFocus(["Enter"]);

const styles = $derived(combobox({ variant, size, disabled }));
const options = $derived(
  items.map((item) => ({
    value: item.value,
    label: item.title,
    disabled: item.disabled,
  })),
);
const picked = $derived(
  holdPick && value !== ""
    ? items.find((item) => item.value === value)
    : undefined,
);
const description = $derived(
  [describedBy, picked?.meta && metaId].filter(Boolean).join(" ") ||
    undefined,
);

// A held pick never keeps a list open, even one opened from outside, so none pops up once the pick goes.
$effect(() => {
  if (picked && open) setOpen(false);
});

function setOpen(next: boolean) {
  if (open === next) return;
  open = next;
  if (!next) focus.reset();
  onOpenChange?.(next);
}

/** Takes the held pick away: the typed text, which the pick left alone, comes back with its matches. */
function remove() {
  value = "";
  onValueChange?.("");
  focus.reset();
  setOpen(inputValue !== "");
  ref?.focus();
}

// Typing or pasting over a held pick lets go of it and edits the field to `text`, so the caller sees an ordinary input.
function replace(text: string) {
  value = "";
  onValueChange?.("");
  flushSync();
  if (!ref) return;
  ref.value = text;
  ref.dispatchEvent(
    new InputEvent("input", {
      bubbles: true,
      data: text,
      inputType: "insertText",
    }),
  );
}

// A character, AltGr's (Ctrl+Alt) and Option's included, and not a shortcut.
function isCharacter(event: KeyboardEvent) {
  return event.key.length === 1 && !event.metaKey &&
    !(event.ctrlKey && !event.altKey);
}

// While a pick is held the field is read-only; other keys go on to bits-ui, whose attempts to open are ignored.
function onHeldKeydown(event: KeyboardEvent) {
  if (event.key === "Backspace" || event.key === "Delete") {
    event.preventDefault();
    remove();
  } else if (isCharacter(event)) {
    event.preventDefault();
    replace(event.key);
  }
}
</script>

<!-- While a pick is held bits-ui sees the list closed, so it leaves Enter to the form. -->
<Combobox.Root
  type="single"
  bind:value
  bind:open={
    () => open && !picked,
    (next) => {
      if (!(picked && next)) open = next;
    }
  }
  items={options}
  {inputValue}
  {name}
  {required}
  {disabled}
  allowDeselect={false}
  {onValueChange}
  onOpenChange={(next) => {
    if (picked && next) return;
    if (!next) focus.reset();
    onOpenChange?.(next);
  }}
>
  <Combobox.Input
    bind:ref
    {...rest}
    readonly={!!picked}
    aria-describedby={description}
    onkeydown={(event) => {
      if (picked) onHeldKeydown(event);
      else focus.onkeydown(event);
      onkeydown?.(event);
    }}
    onpaste={(event) => {
      if (picked) {
        event.preventDefault();
        replace(event.clipboardData?.getData("text") ?? "");
      }
      onpaste?.(event);
    }}
    oninput={(event) => {
      inputValue = event.currentTarget.value;
      // New text, new matches: no option is active until the user moves again.
      focus.reset();
      // bits-ui opens on key presses only; a paste, autofill or dictation types none.
      if (inputValue) setOpen(true);
      oninput?.(event);
    }}
  >
    {#snippet child({ props })}
      <div bind:this={field} class={cn(styles.root(), className)}>
        <!-- bits-ui writes a pick's label into the field; a held pick keeps the typed text there instead, and its title is what assistive tech reads. -->
        <SearchInput
          {...focus.field(props)}
          value={holdPick ? (picked?.title ?? inputValue) : props.value}
          class={picked && styles.hidden()}
          {variant}
          {size}
          {invalid}
          loading={loading && !picked}
          {disabled}
        />
        {#if picked}
          <div class={styles.selection()}>
            <span class={styles.text()}>
              <span class={styles.title()}>{picked.title}</span>
              {#if picked.meta}
                <span id={metaId} class={styles.meta()}>{picked.meta}</span>
              {/if}
            </span>
            {#if loading}
              <span class={styles.busy()}><Spinner class="size-full" /></span>
            {:else if !disabled}
              <!-- Out of the tab order: Backspace and Delete in the field do the same, and a Tab commit moves on past it. -->
              <button
                type="button"
                tabindex="-1"
                aria-label="Remove {picked.title}"
                class={styles.remove()}
                onclick={remove}
              >
                <Icon glyph="cross" class="size-full" />
              </button>
            {/if}
          </div>
        {/if}
      </div>
    {/snippet}
  </Combobox.Input>
  {#if items.length > 0}
    <Combobox.Portal>
      <Combobox.Content
        bind:ref={focus.list}
        customAnchor={field}
        sideOffset={8}
        align="start"
        class={styles.content()}
      >
        <!-- bits-ui hides the viewport's scrollbar; these show while the list can scroll. -->
        <Combobox.ScrollUpButton class={styles.scroll()}>
          <Icon glyph="chevron-up" />
        </Combobox.ScrollUpButton>
        <Combobox.Viewport>
          {#each items as item (item.value)}
            <Combobox.Item
              value={item.value}
              label={item.title}
              disabled={item.disabled}
            >
              {#snippet child({ props })}
                <ResultOption {...focus.option(props)} title={item.title} meta={item.meta} />
              {/snippet}
            </Combobox.Item>
          {/each}
        </Combobox.Viewport>
        <Combobox.ScrollDownButton class={styles.scroll()}>
          <Icon glyph="chevron-down" />
        </Combobox.ScrollDownButton>
      </Combobox.Content>
    </Combobox.Portal>
  {/if}
</Combobox.Root>
