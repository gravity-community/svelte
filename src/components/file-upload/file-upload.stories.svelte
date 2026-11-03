<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Matrix from "../../storybook/matrix.svelte";
import FileUpload from "./file-upload.svelte";
import type { FileUploadFile } from "./types.ts";

const states = ["default", "loading", "disabled", "invalid"] as const;
const stateProps = {
  default: {},
  loading: { loading: true },
  disabled: { disabled: true },
  invalid: { invalid: true },
};
const statuses = ["idle", "uploading", "ok", "invalid"] as const;

const { Story } = defineMeta({
  title: "Inputs/FileUpload",
  component: FileUpload,
  parameters: {
    docs: {
      description: {
        component:
          "Drop zone and file picker that lists each file with its upload status.",
      },
    },
  },
  args: { disabled: false, invalid: false, loading: false, multiple: true },
  argTypes: {
    filename: { control: "text" },
    progress: { control: { type: "range", min: 0, max: 100 } },
  },
});
</script>

<script lang="ts">
let picked = $state<FileUploadFile[]>([]);
</script>

<Story name="Playground">
  {#snippet template(args)}
    <FileUpload {...args} class="w-96" />
  {/snippet}
</Story>

<!-- The invalid card only turns red; its message belongs to the surrounding Field. -->
<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={states}>
      {#snippet cell(state)}
        <FileUpload class="w-96" {...stateProps[state]} />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<!-- Each file carries its own status, and one refused file turns the whole card red. -->
<Story name="File statuses" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <Matrix rows={statuses}>
      {#snippet cell(status)}
        <FileUpload
          class="w-96"
          files={[
            {
              name: "quarterly-report.pdf",
              status,
              progress: 64,
              reason: "Larger than 10 MB",
            },
          ]}
          onremove={() => {}}
        />
      {/snippet}
    </Matrix>
  {/snippet}
</Story>

<Story name="Single file" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <FileUpload
      class="w-96"
      multiple={false}
      accept=".pdf"
      filename="quarterly-report.pdf"
      onremove={() => {}}
    />
  {/snippet}
</Story>

<Story name="Interactive" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <FileUpload
      class="w-96"
      files={picked}
      onfiles={(list) => (picked = Array.from(list, (file) => ({ name: file.name })))}
      onremove={(index) => (picked = picked.filter((_, i) => i !== index))}
    />
  {/snippet}
</Story>
