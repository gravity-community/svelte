<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const select = tv({
  slots: {
    trigger:
      "relative flex w-full cursor-pointer items-center gap-2 font-sans font-normal focus-visible:outline-hidden forced-colors:border",
    chevron: "pointer-events-none absolute top-1/2 -translate-y-1/2",
    // Items run edge to edge, so the list lines up with the field; the panel's corners clip the first and last.
    content:
      "z-50 max-h-72 min-w-(--bits-select-anchor-width) overflow-clip rounded-xl border border-border-subtle bg-surface-raised text-fg outline-none",
    scroll:
      "flex cursor-default items-center justify-center py-1 text-subtle-fg",
    // Wraps the trigger and its clear button, which can't sit inside the trigger, a button itself.
    field: "relative w-full",
    // Muted like Input's reveal, just before the chevron; its hit area grows to the field's height but only into the gaps beside it.
    clear:
      "absolute top-1/2 flex -translate-y-1/2 items-center justify-center text-muted-fg transition-colors before:absolute before:-inset-y-2 before:content-[''] hover:text-fg",
    heading: "px-3.5 pt-2 pb-1",
    rule: "my-1",
    // Focus stays on the trigger, so the fill is what shows the keyboard's option.
    item:
      "flex cursor-pointer items-center gap-2 px-3.5 py-2 text-sm select-none data-highlighted:bg-surface-muted data-highlighted:forced-colors:outline-2 data-highlighted:forced-colors:-outline-offset-2 data-highlighted:forced-colors:outline-[Highlight] data-disabled:pointer-events-none data-disabled:text-disabled-fg",
  },
  variants: {
    // -me-px cancels the 1px border, so the chevron's inset counts from the outer edge.
    variant: {
      default: { chevron: "-me-px" },
      tinted: {},
      outline: { chevron: "-me-px" },
    },
    // End padding = inset + chevron + gap, so the value never runs under the chevron.
    size: {
      sm: {
        trigger: "h-9 rounded-[10px] ps-2.5 pe-7 text-sm",
        chevron: "end-2.5 size-3.5",
        clear: "end-7 size-3.5 before:-inset-x-1",
      },
      md: {
        trigger: "h-12 rounded-xl ps-3.5 pe-9 text-base",
        chevron: "end-3.5 size-4",
        clear: "end-9 size-4 before:-inset-x-1.5",
      },
      lg: {
        trigger: "h-14 rounded-[14px] ps-4.5 pe-11 text-lg",
        chevron: "end-4.5 size-[18px]",
        clear: "end-11 size-[18px] before:-inset-x-2",
      },
    },
    state: {
      default: { trigger: "text-fg data-placeholder:text-placeholder-fg" },
      invalid: {
        trigger: "text-danger-strong data-placeholder:text-placeholder-fg",
      },
      disabled: { trigger: "cursor-not-allowed text-disabled-fg opacity-60" },
    },
    // End padding grows by the clear button and the chevron's gap.
    clearing: { true: {} },
  },
  // deno-fmt-ignore
  compoundVariants: [
    { variant: ["default", "outline"], state: "default", class: { trigger: "border border-border-interactive bg-surface focus:border-border-focus focus:inset-ring focus:inset-ring-border-focus" } },
    { variant: ["default", "outline"], state: "invalid", class: { trigger: "border border-danger-solid bg-surface focus:inset-ring focus:inset-ring-danger-solid" } },
    { variant: ["default", "outline"], state: "disabled", class: { trigger: "border border-border-subtle bg-surface" } },
    { variant: "tinted", state: "default", class: { trigger: "bg-field-tinted data-placeholder:text-muted-fg focus:bg-field-tinted-focus" } },
    { variant: "tinted", state: "invalid", class: { trigger: "bg-danger-subtle data-placeholder:text-muted-fg focus:bg-danger-muted" } },
    { variant: "tinted", state: "disabled", class: { trigger: "bg-surface-muted" } },
    { variant: "outline", class: { trigger: "rounded-full" } },
    { clearing: true, size: "sm", class: { trigger: "pe-11.5" } },
    { clearing: true, size: "md", class: { trigger: "pe-14.5" } },
    { clearing: true, size: "lg", class: { trigger: "pe-17.5" } },
  ],
  defaultVariants: {
    variant: "default",
    size: "md",
    state: "default",
    clearing: false,
  },
});
</script>

<script lang="ts">
import { Select } from "bits-ui";
import type { ClassValue } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";
import { OptionFocus } from "../../utils/option-focus.svelte.ts";
import Dot from "../dot/dot.svelte";
import Eyebrow from "../eyebrow/eyebrow.svelte";
import Icon from "../icon/icon.svelte";
import Separator from "../separator/separator.svelte";
import type { SelectGroup, SelectItem } from "./types.ts";

type Props =
  & Omit<
    Select.TriggerProps,
    "child" | "children" | "value" | "name" | "disabled"
  >
  & Pick<VariantProps<typeof select>, "variant" | "size">
  & {
    items: (SelectItem | SelectGroup)[];
    /** "" while nothing is chosen. */
    value?: string;
    open?: boolean;
    placeholder?: string;
    /** Renders a hidden input so a form post carries the value. */
    name?: string;
    required?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    /** Shows a cross that empties a chosen value; Backspace and Delete on the trigger do too. */
    clearable?: boolean;
    onValueChange?: (value: string) => void;
    onOpenChange?: (open: boolean) => void;
  };

let {
  items,
  value = $bindable(""),
  open = $bindable(false),
  placeholder,
  name,
  required = false,
  disabled = false,
  invalid = false,
  clearable = false,
  variant,
  size,
  onValueChange,
  onOpenChange,
  onkeydown,
  ref = $bindable(null),
  class: className,
  ...rest
}: Props = $props();

const options = $derived(
  items.flatMap((entry) => isGroup(entry) ? entry.items : entry),
);
const chosen = $derived(options.find((option) => option.value === value));
const clearing = $derived(clearable && !!chosen && !disabled);
const styles = $derived(
  select({
    variant,
    size,
    state: disabled ? "disabled" : invalid ? "invalid" : "default",
    clearing,
  }),
);
const focus = new OptionFocus(["Enter", " "]);

function clear() {
  value = "";
  onValueChange?.("");
  ref?.focus();
}

function isGroup(entry: SelectItem | SelectGroup): entry is SelectGroup {
  return "items" in entry;
}
</script>

<!-- aria-label, as name computation can space a hidden span off ("AML , New work"). -->
{#snippet option({ value, label, disabled, status }: SelectItem)}
  <Select.Item
  {value}
  {label}
  {disabled}
  aria-label={status && `${label}, ${status.label}`}
  class={styles.item()}
>
    {#snippet child({ props, selected })}
      <div {...focus.option(props)}>
        {#if status}<Dot intent={status.intent} filled={status.filled} />{/if}
        {label}
        {#if selected}<Icon glyph="check" class="ms-auto size-4" />{/if}
      </div>
    {/snippet}
  </Select.Item>
{/snippet}

{#snippet trigger(triggerClass?: ClassValue | null)}
  <Select.Trigger
  bind:ref
  aria-invalid={invalid || undefined}
  class={cn(styles.trigger(), triggerClass)}
  {...rest}
  onkeydown={(event) => {
      if (clearing && !open && ["Backspace", "Delete"].includes(event.key)) {
        event.preventDefault();
        clear();
      } else focus.onkeydown(event);
      onkeydown?.(event);
    }}
>
    {#snippet child({ props })}
      <button {...focus.field(props)}>
        {#if chosen?.status}
          <Dot intent={chosen.status.intent} filled={chosen.status.filled} />
        {/if}
        <!-- Glued to the value, so it reads "AML, New work". -->
        <Select.Value {placeholder} class="truncate" />{#if chosen?.status}<span class="sr-only">, {chosen.status.label}</span>{/if}
        <Icon glyph="chevron-down" class={styles.chevron()} />
      </button>
    {/snippet}
  </Select.Trigger>
{/snippet}

<Select.Root
  type="single"
  bind:value
  bind:open
  items={options}
  {name}
  {required}
  {disabled}
  {onValueChange}
  onOpenChange={(next) => {
    if (!next) focus.reset();
    onOpenChange?.(next);
  }}
>
  {#if clearable}
    <div class={cn(styles.field(), className)}>
      {@render trigger()}
      {#if clearing}
        <!-- Out of the tab order: Backspace and Delete on the trigger do the same, and a Tab commit moves on past it. -->
        <button
          type="button"
          tabindex="-1"
          aria-label="Remove {chosen?.label}"
          class={styles.clear()}
          onclick={clear}
        >
          <Icon glyph="cross" class="size-full" />
        </button>
      {/if}
    </div>
  {:else}
    {@render trigger(className)}
  {/if}
  <Select.Portal>
    <Select.Content
      bind:ref={focus.list}
      sideOffset={8}
      class={styles.content()}
    >
      <!-- bits-ui hides the viewport's scrollbar; these show while the list can scroll. -->
      <Select.ScrollUpButton class={styles.scroll()}>
        <Icon glyph="chevron-up" />
      </Select.ScrollUpButton>
      <!-- The viewport is what scrolls the highlighted item into view. -->
      <Select.Viewport>
        {#each items as entry, index (index)}
          {#if index > 0 && (isGroup(entry) || isGroup(items[index - 1]))}
            <Separator decorative class={styles.rule()} />
          {/if}
          {#if isGroup(entry)}
            <Select.Group>
              {#if entry.label}
                <Select.GroupHeading>
                  {#snippet child({ props })}
                    <Eyebrow {...props} class={styles.heading()}>
                      {entry.label}
                    </Eyebrow>
                  {/snippet}
                </Select.GroupHeading>
              {/if}
              {#each entry.items as item (item.value)}
                {@render option(item)}
              {/each}
            </Select.Group>
          {:else}
            {@render option(entry)}
          {/if}
        {/each}
      </Select.Viewport>
      <Select.ScrollDownButton class={styles.scroll()}>
        <Icon glyph="chevron-down" />
      </Select.ScrollDownButton>
    </Select.Content>
  </Select.Portal>
</Select.Root>
