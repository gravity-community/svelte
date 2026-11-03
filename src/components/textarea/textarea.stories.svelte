<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Textarea from "./textarea.svelte";

const answer = "Monthly reporting for the finance team.";
const variants = ["default", "tinted"] as const;
const states = ["default", "filled", "invalid", "disabled", "loading"] as const;
const stateProps = {
  default: {},
  filled: { value: answer },
  invalid: { value: answer, invalid: true },
  disabled: { disabled: true },
  loading: { value: answer, loading: true },
};

const { Story } = defineMeta({
  title: "Inputs/Textarea",
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component:
          "Multi-line text field, with a corner spinner for async work.",
      },
    },
  },
  args: {
    variant: "tinted",
    rows: 4,
    placeholder: "What will you use it for?",
    invalid: false,
    loading: false,
    disabled: false,
  },
  argTypes: {
    variant: { control: "inline-radio", options: variants },
  },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <div class="w-80"><Textarea {...args} /></div>
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={variants}>
      {#snippet cell(variant)}
        <div class="w-72">
          <Textarea {variant} placeholder="What will you use it for?" />
        </div>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states} columns={variants}>
      {#snippet cell(state, variant)}
        <div class="w-72">
          <Textarea
            {variant}
            placeholder="What will you use it for?"
            {...stateProps[state]}
          />
        </div>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>
