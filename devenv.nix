{ pkgs, ... }:

{
  packages = [
    pkgs.deno
    # Nothing runs on node, but Storybook shells out to `npm --version` to
    # detect a package manager and exits without one.
    pkgs.nodejs
  ];

  processes.storybook.exec = "deno task storybook";
}
