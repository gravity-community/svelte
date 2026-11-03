<script module lang="ts">
import { tv } from "../../utils/classes.ts";
import { inputShell } from "../input/shell.ts";

const phoneInput = tv({
  extend: inputShell,
  slots: {
    trigger:
      "flex shrink-0 cursor-pointer items-center rounded-md whitespace-nowrap tabular-nums disabled:cursor-not-allowed",
    flag: "",
    // The floating panel and its items match Select's.
    content:
      "z-50 flex max-h-72 w-72 flex-col rounded-xl border border-border-subtle bg-surface-raised p-1 text-fg outline-none",
    search:
      "mb-1 h-9 w-full shrink-0 rounded-lg bg-surface-muted px-2.5 text-sm text-fg focus-visible:outline-hidden placeholder:text-muted-fg",
    // Focus stays in the search, so the ring is what shows the keyboard's option.
    item:
      "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm select-none data-selected:bg-surface-muted data-selected:inset-ring-2 data-selected:inset-ring-border-focus data-selected:forced-colors:outline-2 data-selected:forced-colors:-outline-offset-2 data-selected:forced-colors:outline-[Highlight] data-disabled:pointer-events-none data-disabled:text-disabled-fg",
  },
  variants: {
    // Flags are 3:2 and track the type scale, not the field height.
    size: {
      sm: { trigger: "gap-1", flag: "h-3 w-[18px]" },
      md: { trigger: "gap-1.5", flag: "h-3.5 w-[21px]" },
      lg: { trigger: "gap-2", flag: "h-4 w-6" },
    },
  },
});
</script>

<script lang="ts">
import { Command, Popover } from "bits-ui";
import { tick } from "svelte";
import type { HTMLInputAttributes } from "svelte/elements";
import { cn } from "../../utils/classes.ts";
import Icon from "../icon/icon.svelte";
import type { InputSize, InputVariant } from "../input/types.ts";
import { COUNTRIES, countryOf, formatPhone } from "./countries.ts";
import Flag from "./flag.svelte";

type Props = Omit<HTMLInputAttributes, "size" | "type"> & {
  variant?: InputVariant;
  size?: InputSize;
  invalid?: boolean;
  /** ISO 3166-1 alpha-2, lowercase. Seed it from the visitor's locale when nothing is stored. */
  country: string;
  /** Posts the country under this name through a hidden input; `name` stays on the tel input. */
  countryName?: string;
};

let {
  variant,
  size,
  invalid = false,
  disabled,
  country = $bindable(),
  countryName,
  value = $bindable(),
  oninput,
  class: className,
  ...rest
}: Props = $props();

let open = $state(false);
let shell = $state<HTMLDivElement | null>(null);
let trigger = $state<HTMLButtonElement | null>(null);
let countryInput = $state<HTMLInputElement | null>(null);

const selected = $derived(countryOf(country));
// Names the selection and contains the visible dial code (WCAG 2.5.3).
const triggerLabel = $derived(
  selected
    ? `Country code: ${selected.name} (${selected.dial})`
    : "Country code",
);
const styles = $derived(
  phoneInput({
    variant,
    size,
    state: disabled ? "disabled" : invalid ? "invalid" : "default",
  }),
);

async function choose(code: string) {
  open = false;
  if (code === country) return;
  country = code;
  if (typeof value === "string" && value) value = formatPhone(code, value);
  // A native select fires these on a pick, and form-level listeners rely on them.
  await tick();
  for (const type of ["input", "change"]) {
    countryInput?.dispatchEvent(new Event(type, { bubbles: true }));
  }
}
</script>

<div bind:this={shell} class={cn(styles.base(), className)}>
  <Popover.Root bind:open>
    <Popover.Trigger
      bind:ref={trigger}
      {disabled}
      aria-label={triggerLabel}
      class={styles.trigger()}
    >
      {#if selected}
        <Flag country={selected.code} class={styles.flag()} />
        {selected.dial}
      {/if}
    </Popover.Trigger>
    <Popover.Portal>
      <Popover.Content
        customAnchor={shell}
        align="start"
        sideOffset={4}
        class={styles.content()}
        onInteractOutside={(event) => {
          // customAnchor would keep the list open on any click in the field; only the trigger should.
          if (event.target instanceof Node && !trigger?.contains(event.target)) {
            open = false;
          }
        }}
        onCloseAutoFocus={(event) => {
          // Safari doesn't focus a clicked button, so there may be nothing for bits-ui to return focus to.
          event.preventDefault();
          trigger?.focus();
        }}
      >
        <Command.Root
          label="Country code"
          value={selected?.name}
          class="flex min-h-0 flex-col"
        >
          <Command.Input placeholder="Search" class={styles.search()} />
          <Command.List aria-label="Countries" class="min-h-0 overflow-y-auto">
            <Command.Viewport>
              <Command.Empty class="px-2.5 py-2 text-sm text-muted-fg">
                No matches
              </Command.Empty>
              {#each COUNTRIES as c (c.code)}
                <Command.Item
                  value={c.name}
                  keywords={[c.dial, c.code]}
                  onSelect={() => choose(c.code)}
                  class={styles.item()}
                >
                  <Flag country={c.code} class="h-3.5 w-[21px]" />
                  <span class="truncate">{c.name}</span>
                  <span class="text-muted-fg tabular-nums">{c.dial}</span>
                  {#if c.code === selected?.code}
                    <Icon glyph="check" class="ms-auto size-4" />
                  {/if}
                </Command.Item>
              {/each}
            </Command.Viewport>
          </Command.List>
        </Command.Root>
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
  <input
    type="tel"
    class={styles.control()}
    bind:value
    {disabled}
    aria-invalid={invalid || undefined}
    {...rest}
    oninput={(event) => {
      // Only with the caret at the end: reformatting a mid-string edit would move the caret.
      const el = event.currentTarget;
      if (el.selectionStart === el.value.length) {
        const formatted = formatPhone(country, el.value);
        if (formatted !== el.value) value = formatted;
      }
      oninput?.(event);
    }}
  />
  {#if countryName}
    <input
      bind:this={countryInput}
      type="hidden"
      name={countryName}
      value={country}
      {disabled}
    />
  {/if}
</div>
