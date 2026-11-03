<script module lang="ts">
import type { IconGlyph } from "../icon/glyphs.ts";
import type { IconCircleIntent } from "../icon-circle/types.ts";
import type { StepListStatus } from "./types.ts";

const INTENT: Record<StepListStatus, IconCircleIntent> = {
  done: "success",
  current: "info",
  waiting: "neutral",
  blocked: "warning",
};

const GLYPH: Partial<Record<StepListStatus, IconGlyph>> = {
  done: "check",
  blocked: "lock",
};
</script>

<script lang="ts">
import { Accordion, type AccordionRootSingleProps } from "bits-ui";
import type { Snippet } from "svelte";
import { cn } from "../../utils/classes.ts";
import Icon from "../icon/icon.svelte";
import IconCircle from "../icon-circle/icon-circle.svelte";
import Separator from "../separator/separator.svelte";
import type { StepListStep } from "./types.ts";

type Props =
  & Omit<AccordionRootSingleProps, "type" | "orientation" | "disabled">
  & {
    steps: StepListStep[];
    /** The open step's body. */
    content: Snippet<[StepListStep]>;
    /** Lets the open step close from its header. When false, an open step stays open until another opens, its header showing no minus. */
    collapsible?: boolean;
    ref?: HTMLElement | null;
  };

let {
  steps,
  content,
  collapsible = true,
  value = $bindable(""),
  onValueChange,
  ref = $bindable(null),
  class: className,
  ...rest
}: Props = $props();

const keyOf = (step: StepListStep) => step.value ?? step.title;
</script>

<!-- An ordered list, so assistive tech announces each step's place. -->
<!-- bits-ui's single accordion always lets the open item close, so a list that can't collapse drops the change to none. -->
<Accordion.Root
  type="single"
  bind:value={
    () => value,
    (next) => {
      if (collapsible || next) value = next;
    }
  }
  onValueChange={(next) => {
    if (collapsible || next) onValueChange?.(next);
  }}
  bind:ref
  class={cn("flex flex-col", className)}
  {...rest}
>
  {#snippet child({ props })}
    <ol {...props}>
      {#each steps as step, index (keyOf(step))}
        {@const key = keyOf(step)}
        {@const glyph = GLYPH[step.status]}
        {@const held = !collapsible && value === key}
        <Accordion.Item value={key}>
          {#snippet child({ props: itemProps })}
            <li {...itemProps}>
              {#if index > 0}
                <Separator decorative />
              {/if}
              <!-- Level 3: the list sits under a panel's or popover's h2. -->
              <Accordion.Header level={3}>
                <Accordion.Trigger>
                  {#snippet child({ props: triggerProps })}
                    <!-- WAI-ARIA's accordion pattern marks an open header that can't close aria-disabled; bits-ui's own "false" would win over a prop. -->
                    <button
                      type="button"
                      {...triggerProps}
                      aria-disabled={held}
                      class="flex w-full items-start gap-3 py-3 text-start aria-disabled:cursor-default"
                    >
                      <IconCircle
                        size="sm"
                        intent={INTENT[step.status]}
                        text={glyph ? undefined : String(index + 1)}
                      >
                        {#if glyph}
                          <Icon {glyph} class="size-full" />
                        {/if}
                      </IconCircle>
                      <!-- pt-1 centres the title's 20px line on the 28px circle. -->
                      <span class="flex min-w-0 flex-1 flex-col pt-1">
                        <span class="text-sm leading-5 font-medium text-fg">
                          {step.title}
                          <span class="sr-only">({step.status})</span>
                        </span>
                        {#if step.meta}
                          <span class="text-[13px] leading-5 text-muted-fg">
                            {step.meta}
                          </span>
                        {/if}
                      </span>
                      {#if !held}
                        <span
                          class="flex h-7 shrink-0 items-center text-subtle-fg"
                        >
                          <Icon glyph={value === key ? "minus" : "plus"} />
                        </span>
                      {/if}
                    </button>
                  {/snippet}
                </Accordion.Trigger>
              </Accordion.Header>
              <!-- Primary ink, so prose here doesn't read as another meta line. -->
              <Accordion.Content
                class="ps-10 pb-4 text-sm leading-5 text-fg transition-[opacity,translate] duration-180 ease-out data-starting-style:-translate-y-1 data-starting-style:opacity-0 motion-reduce:transition-none"
              >
                {@render content(step)}
              </Accordion.Content>
            </li>
          {/snippet}
        </Accordion.Item>
      {/each}
    </ol>
  {/snippet}
</Accordion.Root>
