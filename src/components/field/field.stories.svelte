<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import Input from "../input/input.svelte";
import Field from "./field.svelte";

const hint = "We only use it to send sign-in links.";
const states = ["default", "invalid", "read-only"] as const;
const stateProps = {
  default: { hint },
  invalid: { error: "Enter a valid email address." },
  "read-only": { value: "jane@example.com" },
};

const { Story } = defineMeta({
  title: "Inputs/Field",
  component: Field,
  parameters: {
    docs: {
      description: {
        component:
          "Gives a form control its label, a hint and a validation message, built on bits-ui Label.",
      },
    },
  },
  args: { label: "Email", hint, error: "" },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <Field {...args} for="field-playground" class="w-80">
      <Input
        id="field-playground"
        variant="tinted"
        type="email"
        placeholder="name@example.com"
        invalid={!!args.error}
      />
    </Field>
  {/snippet}
</Story>

<!-- The message is the Field's, the red outline the control's: pair error with the control's invalid. -->
<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states}>
      {#snippet cell(state)}
        <Field
          label="Email"
          for="field-{state}"
          class="w-80"
          {...stateProps[state]}
        >
          <Input
            id="field-{state}"
            variant="tinted"
            type="email"
            placeholder="name@example.com"
            value={state === "invalid" ? "jane.example.com" : undefined}
            invalid={state === "invalid"}
          />
        </Field>
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- A label longer than the field wraps; a short one stays on its line. -->
<Story name="Long label" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Field
      label="Has the client, or anyone acting on its behalf, been subject to sanctions or an investigation for money laundering or terrorist financing in the last five years?"
      for="field-long-label"
      class="w-80"
    >
      <Input id="field-long-label" variant="tinted" placeholder="Describe it" />
    </Field>
  {/snippet}
</Story>
