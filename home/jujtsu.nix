{
  config,
  pkgs,
  lib,
  ...
}:
{
  programs.jujutsu = {
    enable = true;
    settings = {
      user.name = "MisLink";
      user.email = "gjq.uoiai@outlook.com";
      ui = {
        default-command = "log";
        conflict-marker-style = "git";
        merge-editor = "vscode";
        graph.style = "ascii";
      };
      snapshot.auto-update-stale = true;
      git = {
        sign-on-push = true;
      };
      fsmonitor = {
        backend = "watchman";
        watchman.register-snapshot-trigger = true;
      };
      signing = {
        behavior = "drop";
        backend = "ssh";
        key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKnH3JJcsZnksInIdffC18IkcI2IGxnvyQBv3j+/MHsm";
        backends.ssh.program = "/Applications/1Password.app/Contents/MacOS/op-ssh-sign";
      };
    };
  };
}
