<script module lang="ts">
import { defineMeta } from "@storybook/addon-svelte-csf";
import Button from "../../components/button/button.svelte";
import Matrix from "../../storybook/matrix.svelte";
import { gravity } from "./gravity.svelte.ts";
import {
  type ForceShape,
  GRAVITY_DEFAULTS,
  type GravityOptions,
} from "./types.ts";

type Args = {
  maxTilt: number;
  reach: number;
  lift: number;
  stiffness: number;
  damping: number;
  shape: string;
  debug: boolean;
};

// Each returns 0 at t = 0; undefined is the default smoothstep.
const shapes: Record<string, ForceShape | undefined> = {
  smooth: undefined,
  linear: (t) => t,
  eager: (t) => 1 - (1 - t) * (1 - t),
  dense: (t) => t * t * t,
};

const states = ["default", "disabled", "loading", "opted out"] as const;
const stateProps = {
  default: {},
  disabled: { disabled: true },
  loading: { loading: true },
  "opted out": { gravity: false },
};

const { maxTilt, lift, perspective, stiffness, damping } = GRAVITY_DEFAULTS;

const description = `
**Gravity** is the behaviour identity of Gravity DS: the pointer acts as a heavy
object, and interactive elements lean toward it.

Inside an invisible field (the border box grown by \`reach\`, one element height
by default) the edge nearest the pointer rises toward the viewer: pointer below
centre ⇒ \`rotateX(+)\`, right of centre ⇒ \`rotateY(−)\`. Tilt fades to zero at
the centre, where a \`translateZ\` lift peaks instead, so a pointer parked
dead-centre still reads as engaged. Springs settle with one gentle overshoot.

| Default | Value |
|---|---|
| Max pitch (rotateX) | ${maxTilt}° |
| Max yaw (rotateY) | clamp(${maxTilt}° · h/w, 1°, ${maxTilt}°) |
| Field reach | element height |
| Lift at centre | ${lift} px translateZ at ${perspective} px perspective |
| Tilt spring | stiffness ${stiffness}, damping ${damping} |
| Force falloff | smoothstep, pluggable via \`shape\` |

Off under \`prefers-reduced-motion\` and on coarse or no-hover pointers, inert
while \`disabled\` or \`loading\`, and no inline styles at rest. Hosts must not
CSS-transition \`transform\` (use \`transition-interactive\`); the engine warns
if they do.

**QA:** tilt starts before hover; the near edge rises toward the cursor;
sweeping across the centre never pops; parking at the centre burns no frames; a
fast exit shows one overshoot; turning on reduced motion mid-hover clears every
transform.
`;

const { Story } = defineMeta({
  title: "Foundations/Motion & Gravity",
  parameters: { docs: { description: { component: description } } },
  args: {
    maxTilt,
    reach: 48,
    lift,
    stiffness,
    damping,
    shape: "smooth",
    debug: false,
  },
  argTypes: {
    maxTilt: { control: { type: "range", min: 0, max: 24, step: 0.5 } },
    reach: { control: { type: "range", min: 0, max: 120, step: 4 } },
    lift: { control: { type: "range", min: 0, max: 96, step: 1 } },
    stiffness: { control: { type: "range", min: 40, max: 600, step: 10 } },
    damping: { control: { type: "range", min: 4, max: 60, step: 1 } },
    shape: { control: "select", options: Object.keys(shapes) },
  },
});

function options(args: Args): GravityOptions {
  return {
    maxTilt: args.maxTilt,
    reach: args.reach,
    lift: args.lift,
    spring: { stiffness: args.stiffness, damping: args.damping },
    shape: shapes[args.shape],
    debug: args.debug,
  };
}
</script>

<Story name="Playground">
  {#snippet template(args)}
    <div class="flex items-center gap-10 p-16">
      <Button gravity={options(args)}>Save changes</Button>
      <div
        {@attach gravity(() => options(args))}
        class="flex size-24 items-center justify-center rounded-xl border border-dashed border-border-interactive text-sm select-none"
      >
        any node
      </div>
    </div>
  {/snippet}
</Story>

<!-- Only the default host leans: disabled, loading and opted-out hosts stay inert. -->
<Story name="States" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="p-16">
      <Matrix rows={states}>
        {#snippet cell(state)}
          <Button {...stateProps[state]}>Save changes</Button>
        {/snippet}
      </Matrix>
    </div>
  {/snippet}
</Story>

<!-- Move the pointer near, not over, the buttons: neighbours inside the dashed fields lean toward it together. -->
<Story name="Toolbar" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="flex items-center gap-3 p-16">
      <Button gravity={{ debug: true }}>Save</Button>
      <Button variant="soft" gravity={{ debug: true }}>Duplicate</Button>
      <Button variant="outline" gravity={{ debug: true }}>Move</Button>
      <Button variant="ghost" gravity={{ debug: true }}>Archive</Button>
      <Button variant="soft" intent="danger" gravity={{ debug: true }}>
        Delete
      </Button>
    </div>
  {/snippet}
</Story>

<!-- 40 hosts on one shared loop: idle should cost no frames. -->
<Story name="Grid" parameters={{ controls: { disable: true } }}>
  {#snippet template()}
    <div class="grid grid-cols-8 gap-3 p-12">
      {#each { length: 40 }, i}
        <Button variant="soft" intent="neutral">#{i + 1}</Button>
      {/each}
    </div>
  {/snippet}
</Story>
