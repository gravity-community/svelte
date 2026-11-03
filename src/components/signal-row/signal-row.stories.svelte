<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Link from "../link/link.svelte";
import SignalRow from "./signal-row.svelte";

const severities = ["pass", "info", "medium", "high", "fail"] as const;

const signals = {
  pass: "Sanctions screening — no matches",
  info: "Submission received — 6 files",
  medium: "Possible duplicate — Acme Ltd ≈ Acme Limited",
  high: "Circular ownership between two shareholders",
  fail: "Validation failed — voting shares sum to 110%",
} satisfies Record<(typeof severities)[number], string>;

const { Story } = defineMeta({
  title: "Feedback/SignalRow",
  component: SignalRow,
  parameters: {
    docs: {
      description: {
        component:
          "One line of an analysis or activity feed, led by a severity glyph.",
      },
    },
  },
  args: { severity: "medium" },
  argTypes: {
    severity: { control: "select", options: severities },
    timestamp: { control: "text" },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <SignalRow {...args} class="w-[352px]">{signals.medium}</SignalRow>
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={severities}>
      {#snippet cell(severity)}
        <SignalRow {severity} class="w-[352px]">{signals[severity]}</SignalRow>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="With action" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <SignalRow severity="medium" class="w-[352px]">
      {#snippet action()}
        <Link intent="neutral" href="#">Merge →</Link>
      {/snippet}
      {signals.medium}
    </SignalRow>
  {/snippet}
</Story>

<Story name="Timeline" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex w-[480px] flex-col gap-2">
      <SignalRow severity="info" timestamp="20 May 09:02">
        Submission received — 6 files
      </SignalRow>
      <SignalRow severity="fail" timestamp="20 May 09:16">
        Analysis run — 1 fail, 4 signals
      </SignalRow>
      <SignalRow severity="pass" timestamp="20 May 09:40">
        Identity verified
      </SignalRow>
      <SignalRow severity="medium" timestamp="23 May 10:05">
        Flagged for manual review
      </SignalRow>
    </div>
  {/snippet}
</Story>
