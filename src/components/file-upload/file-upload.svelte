<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const fileUpload = tv({
  slots: {
    // min-height (not height) carries the collapse once files land, so it animates.
    base:
      "flex w-full flex-col overflow-clip rounded-xl font-sans text-[13px] leading-5 transition-[min-height,background-color,border-color,color] duration-300 ease-out forced-colors:border",
    // The base clips, so the dropzone's ring sits inside its edge.
    dropzone:
      "flex w-full flex-1 flex-col items-center justify-center gap-2 rounded-xl px-6 py-9 focus-visible:-outline-offset-2",
    browse: "flex w-full items-center gap-2 rounded-sm text-left",
    prompt: "",
    remove:
      "shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100",
  },
  variants: {
    state: {
      default: { base: "bg-upload text-upload-fg" },
      selected: { base: "bg-upload-active text-upload-active-fg" },
      disabled: {
        base: "cursor-not-allowed bg-upload-disabled text-upload-disabled-fg",
        prompt: "opacity-70",
      },
      invalid: {
        base: "border border-danger-solid bg-upload-error text-upload-error-fg",
      },
    },
    filled: {
      true: { base: "min-h-0 items-stretch gap-2 px-4 py-3" },
      false: { base: "min-h-[118px]" },
    },
    dragOver: {
      true: {
        base:
          "inset-ring-2 inset-ring-border-focus forced-colors:outline-2 forced-colors:-outline-offset-2",
      },
    },
    inert: {
      true: { dropzone: "cursor-not-allowed", browse: "cursor-not-allowed" },
      false: { dropzone: "cursor-pointer", browse: "cursor-pointer" },
    },
  },
  defaultVariants: {
    state: "default",
    filled: false,
    dragOver: false,
    inert: false,
  },
});

const clamp = (n: number) => Math.min(100, Math.max(0, n));

const sameFile = (a: File, b: File) =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;
</script>

<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";
import Icon from "../icon/icon.svelte";
import Spinner from "../spinner/spinner.svelte";
import type { FileUploadFile } from "./types.ts";

type Props = HTMLAttributes<HTMLDivElement> & {
  disabled?: boolean;
  /** Turns the card red; the message belongs to the surrounding Field. */
  invalid?: boolean;
  /** Shows a spinner in the dropzone and suspends interaction. */
  loading?: boolean;
  /** Prompt in the empty dropzone, e.g. "Public key (PEM)". */
  placeholder?: string;
  /** Defaults to "Add more files" when `multiple`, "Replace file" when not. */
  addLabel?: string;
  /** Each file carries its own status, so a batch can mix accepted and refused. */
  files?: FileUploadFile[];
  /** Single-file shorthand for `files`, ignored once `files` is non-empty. */
  filename?: string | null;
  /** Progress 0-100 for the single-file shorthand. */
  progress?: number;
  accept?: string;
  /** Names the file input so a form post carries the files. */
  name?: string;
  multiple?: boolean;
  onfiles?: (files: FileList) => void;
  onremove?: (index: number) => void;
};

let {
  disabled = false,
  invalid = false,
  loading = false,
  placeholder = "Drag & drop files here or click to browse",
  addLabel,
  files = [],
  filename,
  progress,
  accept,
  name,
  multiple = true,
  onfiles,
  onremove,
  class: className,
  ...rest
}: Props = $props();

let input: HTMLInputElement | undefined;
let dragOver = $state(false);
// The picker replaces input.files, so "add more" needs what was held before it opened.
let selected: File[] = [];

const inert = $derived(disabled || loading);
const rows = $derived.by(() => {
  const list: FileUploadFile[] = files.length ? files : filename
    ? [{
      name: filename,
      status: progress === undefined ? "idle" : "uploading",
      progress,
    }]
    : [];
  return list.map((file) => ({
    ...file,
    status: file.status ?? "idle",
    percent: clamp(file.progress ?? 0),
  }));
});
const filled = $derived(rows.length > 0);
const cardState = $derived(
  disabled
    ? "disabled"
    : invalid || rows.some((row) => row.status === "invalid")
    ? "invalid"
    : filled
    ? "selected"
    : "default",
);
const styles = $derived(
  fileUpload({ state: cardState, filled, dragOver, inert }),
);
const label = $derived(
  addLabel ?? (multiple ? "Add more files" : "Replace file"),
);

// A FileList can't be edited or built empty: rebuild it through DataTransfer, clear it through value.
function writeInput(next: File[]) {
  selected = next;
  if (!input) return;
  if (next.length === 0) {
    input.value = "";
    return;
  }
  if (typeof DataTransfer === "undefined") return;
  const transfer = new DataTransfer();
  for (const file of next) transfer.items.add(file);
  input.files = transfer.files;
}

// Appends when `multiple` (skipping files already held), replaces when not.
function absorb(incoming: FileList) {
  const arriving = Array.from(incoming);
  writeInput(
    multiple
      ? [
        ...selected,
        ...arriving.filter((file) => !selected.some((s) => sameFile(s, file))),
      ]
      : arriving.slice(0, 1),
  );
}

function browse() {
  if (!inert) input?.click();
}

function handleDragOver(event: DragEvent) {
  if (inert) return;
  event.preventDefault();
  dragOver = true;
}

// The picker fills the input natively; a drop doesn't, and the form post must carry it.
function handleDrop(event: DragEvent) {
  if (inert) return;
  event.preventDefault();
  dragOver = false;
  const dropped = event.dataTransfer?.files;
  if (!dropped?.length) return;
  absorb(dropped);
  onfiles?.(input?.files?.length ? input.files : dropped);
}

function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
  const picked = event.currentTarget.files;
  if (!picked?.length) return;
  absorb(picked);
  onfiles?.(input?.files?.length ? input.files : picked);
}

// A row is only a view of the input, so the file leaves the input too.
function handleRemove(index: number) {
  if (input?.files?.length) {
    writeInput(Array.from(input.files).filter((_, i) => i !== index));
  }
  onremove?.(index);
}
</script>

<!-- A group, not a button: it holds the remove buttons, so browsing is its own button. -->
<div
  role="group"
  class={cn(styles.base(), className)}
  ondragover={handleDragOver}
  ondragleave={() => (dragOver = false)}
  ondrop={handleDrop}
  {...rest}
>
  {#if filled}
    <div class="flex w-full flex-col gap-2">
      {#each rows as row, i (`${row.name}-${i}`)}
        <div class="flex w-full items-center gap-2">
          <Icon
            glyph={row.status === "invalid" ? "warning" : "document"}
            class="size-[18px] shrink-0"
          />
          <span class="min-w-0 flex-1 truncate text-left">{row.name}</span>
          {#if row.status === "uploading"}
            <span
              class="h-1 w-14 shrink-0 overflow-hidden rounded-full bg-border-hairline"
            >
              <span
                class="block h-full rounded-full bg-accent-solid transition-[width] duration-300 ease-out forced-colors:bg-[Highlight]"
                style:width={`${row.percent}%`}
              ></span>
            </span>
            <span class="shrink-0 text-xs text-muted-fg tabular-nums">
              {Math.round(row.percent)}%
            </span>
          {:else if row.status === "ok"}
            <Icon glyph="check" class="size-[18px] shrink-0" />
          {:else if row.status === "invalid" && row.reason}
            <span role="alert" class="shrink-0 text-xs text-danger-strong">
              {row.reason}
            </span>
          {/if}
          {#if onremove && (row.status === "idle" || row.status === "invalid")}
            <button
              type="button"
              class={styles.remove()}
              aria-label="Remove {row.name}"
              onclick={() => handleRemove(i)}
            >
              <Icon glyph="cross" class="size-[18px]" />
            </button>
          {/if}
        </div>
      {/each}
    </div>
    <span
      class="w-full border-t border-dashed border-border-hairline"
      aria-hidden="true"
    ></span>
    <button
      type="button"
      class={styles.browse()}
      disabled={inert}
      onclick={browse}
    >
      <Icon glyph="upload" class="size-[18px] shrink-0" />
      {label}
    </button>
  {:else}
    <button
      type="button"
      class={styles.dropzone()}
      disabled={inert}
      onclick={browse}
    >
      <Icon glyph="upload" class={cn("size-[18px] shrink-0", styles.prompt())} />
      {#if loading}<Spinner size="sm" />{/if}
      <span class={styles.prompt()}>{placeholder}</span>
    </button>
  {/if}
  <input
    bind:this={input}
    type="file"
    class="hidden"
    {accept}
    {name}
    {multiple}
    disabled={inert}
    aria-invalid={cardState === "invalid" || undefined}
    oninput={handleInput}
  />
</div>
