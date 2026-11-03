<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import InputOtp from "./input-otp.svelte";

const formats = ["3-3", "4-4"] as const;
const variants = ["default", "tinted"] as const;
const codes = { "3-3": "914203", "4-4": "7Q2MD4KX" };
const states = ["default", "filled", "invalid", "disabled"] as const;

// PinInput's rest goes to its hidden <input>, so docgen lists every <input> attribute.
const ownProps = [
  "format",
  "variant",
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
    variant: "tinted",
    value: "",
    invalid: false,
    disabled: false,
  },
  argTypes: {
    format: { control: "inline-radio", options: formats },
    variant: { control: "inline-radio", options: variants },
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
    <Matrix rows={variants} columns={formats}>
      {#snippet cell(variant, format)}
        <InputOtp
          {variant}
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
    <Matrix rows={states} columns={variants}>
      {#snippet cell(state, variant)}
        <InputOtp
          format="3-3"
          {variant}
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
        variant="tinted"
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
