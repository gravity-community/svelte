<script lang="ts">
import type { ComponentProps } from "svelte";
import { Badge, Button, IconCircle, ListItem } from "@gravity-community/svelte";

// Test harness: a row with a leading IconCircle, a Badge and an action (test ids "leading", "badge", "action"), each taking the props given.
type Props =
  & Omit<
    ComponentProps<typeof ListItem>,
    "title" | "leading" | "badge" | "actions"
  >
  & {
    leadingProps?: ComponentProps<typeof IconCircle>;
    badgeProps?: ComponentProps<typeof Badge>;
    actionProps?: ComponentProps<typeof Button>;
  };

let { leadingProps, badgeProps, actionProps, ...props }: Props = $props();
</script>

<ListItem title="Interzone Inc." {...props}>
  {#snippet leading()}
    <IconCircle data-testid="leading" {...leadingProps} />
  {/snippet}
  {#snippet badge()}
    <Badge data-testid="badge" {...badgeProps}>New</Badge>
  {/snippet}
  {#snippet actions()}
    <Button data-testid="action" size="sm" {...actionProps}>Open</Button>
  {/snippet}
</ListItem>
