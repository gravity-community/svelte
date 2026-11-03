<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Well from "../../storybook/well.svelte";
import { resolveEnergy } from "../../utils/energy.ts";
import InputOtp from "./input-otp.svelte";

const formats = ["3-3", "4-4"] as const;
const energies = ["2", "1"] as const;
const codes = { "3-3": "914203", "4-4": "7Q2MD4KX" };
const states = ["default", "filled", "invalid", "disabled"] as const;

// PinInput's rest goes to its hidden <input>, so docgen lists every <input> attribute.
const ownProps = [
  "format",
  "energy",
  "value",
  "invalid",
  "disabled",
  "autofocus",
  "autosubmit",
  "oncomplete",
  "onValueChange",
  "name",
  "required",
  "ref",
];

const { Story } = defineMeta({
  title: "Inputs/InputOtp",
  component: InputOtp,
  parameters: {
    docs: {
      description: {
        component:
          "Entry for a one-time code in two groups of cells, built on bits-ui PinInput.",
      },
      controls: { include: ownProps },
    },
    controls: { include: ownProps },
  },
  args: {
    format: "3-3",
    energy: "2",
    value: "",
    invalid: false,
    disabled: false,
  },
  argTypes: {
    format: { control: "inline-radio", options: formats },
    energy: { control: "inline-radio", options: energies },
  },
});
</script>

<script lang="ts">
let posted = $state("");
</script>

<Story name="Playground">
  {#snippet template(args)}
    <InputOtp {...args} aria-label="Verification code" class="w-80" />
  {/snippet}
</Story>

<Story name="Variants" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={energies} columns={formats}>
      {#snippet cell(energy, format)}
        <InputOtp
          {energy}
          {format}
          aria-label="Verification code"
          class="w-80"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states} columns={energies}>
      {#snippet cell(state, energy)}
        <InputOtp
          format="3-3"
          {energy}
          value={state === "filled" || state === "invalid" ? codes["3-3"] : ""}
          invalid={state === "invalid"}
          disabled={state === "disabled"}
          aria-label="Verification code"
          class="w-80"
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Rows name the level each field is given; one well down both decay to faint, passed by hand, and the frame glazes. -->
<Story name="In a well" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Well>
      <Matrix rows={energies} columns={formats}>
        {#snippet cell(energy, format)}
          <InputOtp
            energy={resolveEnergy(energy, energies, 1)}
            {format}
            aria-label="Verification code"
            class="w-80"
          />
        {/snippet}
      </Matrix>
    </Well>
  {/snippet}
</Story>

<!-- With autosubmit, the last digit submits the surrounding form, which posts the code under the field's name. -->
<Story name="In a form" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <form
      class="flex w-80 flex-col gap-3"
      onsubmit={(event) => {
        event.preventDefault();
        posted = String(new FormData(event.currentTarget).get("code"));
      }}
    >
      <InputOtp
        format="3-3"
        name="code"
        autosubmit
        aria-label="Verification code"
      />
      <p class="font-sans text-sm text-subtle-fg">
        {posted ? `Posted ${posted}` : "Enter the six digits to submit."}
      </p>
    </form>
  {/snippet}
</Story>
