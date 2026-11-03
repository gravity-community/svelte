<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import DocumentPreview from "./document-preview.svelte";
import type { DocumentSection } from "./types.ts";

const sections: DocumentSection[] = [
  {
    heading: "1. Scope",
    paragraphs: [
      "1.1. These terms govern access to the registry and to the records it publishes, through the website and through the API.",
      "1.2. Whoever accepts them on behalf of an organization confirms that they may act for it and that the organization is bound by them.",
      "1.3. The registry holds records of companies and of the people who ultimately own or control them, together with the evidence behind each record.",
    ],
  },
  {
    heading: "2. Access",
    paragraphs: [
      "2.1. Access is granted to organizations, not to individuals. Each user signs in with a work email address at a domain the organization controls.",
      "2.2. What a user can see depends on the organization's role: the public view is open to everyone, fuller views need a legitimate interest or a legal mandate.",
    ],
  },
  {
    heading: "3. Use of records",
    paragraphs: [
      "3.1. Records may be used only for the purpose stated when access was granted, and may not be resold or republished in bulk.",
      "3.2. A record that appears to be wrong should be reported through the registry, so that it can be reviewed and corrected.",
    ],
  },
];

const { Story } = defineMeta({
  title: "Data display/DocumentPreview",
  component: DocumentPreview,
  parameters: {
    docs: {
      description: {
        component:
          "A fixed-height, scrollable preview of a long document, such as terms to accept.",
      },
    },
  },
  args: { title: "Terms of access", sections },
});
</script>

<Story name="Playground">
  {#snippet template(args)}
    <DocumentPreview {...args} class="w-[400px]" />
  {/snippet}
</Story>
