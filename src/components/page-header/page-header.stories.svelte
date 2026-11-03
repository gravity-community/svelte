<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import type { ComponentProps } from "svelte";
import Matrix from "../../storybook/matrix.svelte";
import PageHeader from "./page-header.svelte";

const sizes = ["sm", "md", "lg"] as const;
const leadings = ["none", "back", "avatar", "back + avatar"] as const;
const eyebrowIntents = [
  "neutral",
  "primary",
  "info",
  "success",
  "warning",
  "danger",
] as const;

const content = {
  eyebrow: "Organization",
  title: "Meridian Data Inc.",
  subtitle: "submitter",
  description: "Active since 11 Oct 2023 · 4 members · 12 records",
};
const back = { backHref: "#", backLabel: "Organizations" };
const avatar: ComponentProps<typeof PageHeader>["avatar"] = {
  userId: "4c9e12b7",
  name: "Meridian Data Inc.",
  organization: "Meridian Data Inc.",
  variant: "duo",
};
const leadingProps = {
  none: {},
  back,
  avatar: { avatar },
  "back + avatar": { ...back, avatar },
};

const { Story } = defineMeta({
  title: "Navigation/PageHeader",
  component: PageHeader,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Title block at the top of a page, in three sizes, with an optional eyebrow, back button, avatar, subtitle and description.",
      },
    },
  },
  args: { ...content, size: "md", eyebrowIntent: "neutral", ...back },
  argTypes: {
    size: { control: "inline-radio", options: sizes },
    eyebrowIntent: { control: "select", options: eyebrowIntents },
  },
});
</script>

<Story name="Playground" />

<Story name="Sizes" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={sizes}>
      {#snippet cell(size)}
        <PageHeader
          {...content}
          {...leadingProps["back + avatar"]}
          {size}
          class="w-[720px]"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- The eyebrow lines up with the title past whatever leads it. -->
<Story name="Back and avatar" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={leadings}>
      {#snippet cell(leading)}
        <PageHeader
          {...content}
          {...leadingProps[leading]}
          class="w-[720px]"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Title only" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <PageHeader title={content.title} class="w-[720px]" />
  {/snippet}
</Story>

<!-- The title truncates to one line; the subtitle always shows whole. -->
<Story name="Long title" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={sizes}>
      {#snippet cell(size)}
        <PageHeader
          {...back}
          title="Meridian Data International Holdings Inc."
          subtitle="verified submitter"
          {size}
          class="w-[400px]"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
