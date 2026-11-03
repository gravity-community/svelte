<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy } from "../../utils/energy.ts";
import Textarea from "./textarea.svelte";

const answer = "Monthly reporting for the finance team.";
const energies = ["2", "1"] as const;
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
    energy: "2",
    rows: 4,
    placeholder: "What will you use it for?",
    invalid: false,
    loading: false,
    disabled: false,
  },
  argTypes: {
    energy: { control: "inline-radio", options: energies },
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
    <Matrix rows={energies}>
      {#snippet cell(energy)}
        <div class="w-72">
          <Textarea {energy} placeholder="What will you use it for?" />
        </div>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states} columns={energies}>
      {#snippet cell(state, energy)}
        <div class="w-72">
          <Textarea
            {energy}
            placeholder="What will you use it for?"
            {...stateProps[state]}
          />
        </div>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Rows name the level each field is given; one well down both decay to faint, passed by hand, and the frame glazes. -->
<Story name="In a well" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Well>
      <Matrix rows={energies}>
        {#snippet cell(energy)}
          <div class="w-72">
            <Textarea
              energy={resolveEnergy(energy, energies, 1)}
              placeholder="What will you use it for?"
            />
          </div>
        {/snippet}
      </Matrix>
    </Well>
  {/snippet}
</Story>
