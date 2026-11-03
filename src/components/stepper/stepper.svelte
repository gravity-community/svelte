<script module lang="ts">
import { tv } from "../../utils/classes.ts";

const stepper = tv({
  slots: {
    base: "flex",
    item: "relative flex min-w-0",
    content: "group flex min-w-0 gap-3 no-underline",
    marker:
      "flex size-6 shrink-0 items-center justify-center rounded-full text-xs leading-none font-semibold tabular-nums",
    text: "flex min-w-0 flex-col pt-0.5",
    label: "text-sm leading-5 group-[[href]]:group-hover:underline",
    description: "text-[13px] leading-5 text-muted-fg",
    connector: "forced-colors:bg-[CanvasText]",
  },
  variants: {
    orientation: {
      vertical: {
        base: "flex-col",
        item: "pb-6 last:pb-0",
        connector: "absolute top-8 bottom-2 left-[11.5px] w-px",
      },
      horizontal: {
        base: "items-start gap-3",
        item: "flex-1 gap-3 last:flex-none",
        connector: "mt-3 h-px min-w-6 flex-1",
      },
    },
    status: {
      done: {
        marker: "bg-primary-solid text-on-primary forced-colors:border",
        label: "text-fg",
        connector: "bg-primary-solid",
      },
      current: {
        marker: "border-2 border-primary-solid text-primary-strong",
        label: "font-medium text-fg",
        connector: "bg-border",
      },
      upcoming: {
        marker: "border border-border-interactive text-muted-fg",
        label: "text-muted-fg",
        connector: "bg-border",
      },
      error: {
        marker: "bg-danger-solid text-on-danger forced-colors:border",
        label: "text-danger-strong",
        connector: "bg-border",
      },
    },
  },
  defaultVariants: { orientation: "vertical" },
});
</script>

<script lang="ts">
import type { HTMLOlAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";
import Icon from "../icon/icon.svelte";
import { statusOf } from "./status.ts";
import type { StepperStep } from "./types.ts";

type Props =
  & HTMLOlAttributes
  & Pick<VariantProps<typeof stepper>, "orientation">
  & {
    steps: StepperStep[];
    /** Index of the current step: earlier steps are done, later ones upcoming. */
    current?: number;
  };

let {
  steps,
  current = 0,
  orientation,
  class: className,
  ...rest
}: Props = $props();
</script>

<ol class={cn(stepper({ orientation }).base(), className)} {...rest}>
  {#each steps as step, index (index)}
    {@const status = statusOf(step, index, current)}
    {@const styles = stepper({ orientation, status })}
    {@const ariaCurrent = status === "current" ? "step" : undefined}
    <li class={styles.item()} aria-current={step.href ? undefined : ariaCurrent}>
      <svelte:element
        this={step.href ? "a" : "div"}
        href={step.href}
        aria-current={step.href ? ariaCurrent : undefined}
        class={styles.content()}
      >
        <span class={styles.marker()} aria-hidden="true">
          {#if status === "done"}
            <Icon glyph="check" class="size-3.5" />
          {:else if status === "error"}
            <Icon glyph="cross" class="size-3.5" />
          {:else}
            {index + 1}
          {/if}
        </span>
        <span class={styles.text()}>
          <span class={styles.label()}>
            {step.label}
            {#if status === "done" || status === "error"}
              <span class="sr-only">({status})</span>
            {/if}
          </span>
          {#if step.description}
            <span class={styles.description()}>{step.description}</span>
          {/if}
        </span>
      </svelte:element>
      {#if index < steps.length - 1}
        <span class={styles.connector()} aria-hidden="true"></span>
      {/if}
    </li>
  {/each}
</ol>
