<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Icon from "../icon/icon.svelte";
import OptionCard from "./option-card.svelte";

const states = ["default", "selected", "disabled"] as const;
const stateProps = {
  default: {},
  selected: { selected: true },
  disabled: { disabled: true },
};

const { Story } = defineMeta({
  title: "Navigation/OptionCard",
  component: OptionCard,
  parameters: {
    docs: {
      description: {
        component:
          "Card link to one of several options, such as a role to sign up as, that marks the current one as selected.",
      },
    },
  },
  args: {
    title: "Submitter",
    description: "Publish ownership records to the registry.",
    href: "#",
    selected: false,
    disabled: false,
  },
});
</script>

{#snippet upload()}
  <Icon glyph="upload" class="size-full" />
{/snippet}

<Story name="Playground">
  {#snippet template(args)}
    <OptionCard {...args} icon={upload} class="w-[400px]" />
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template(args)}
    <Matrix rows={states}>
      {#snippet cell(state)}
        <OptionCard
          {...args}
          {...stateProps[state]}
          icon={upload}
          class="w-[400px]"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
