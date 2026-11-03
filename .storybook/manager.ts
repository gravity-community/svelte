import { addons } from "storybook/manager-api";
import { themes } from "storybook/theming";

// The manager follows the OS colour scheme, like the components, and keeps
// following it when the scheme changes.
const scheme = matchMedia("(prefers-color-scheme: dark)");
const theme = () => scheme.matches ? themes.dark : themes.light;

addons.setConfig({ theme: theme() });
addons.register("gravity/theme", (api) => {
  scheme.addEventListener("change", () => api.setOptions({ theme: theme() }));
});
