{
  config,
  pkgs,
  ...
}:
{
  programs.jujutsu = {
    enable = true;
    settings = {
      user.name = "MisLink";
      user.email = "gjq.uoiai@outlook.com";
      git = {
        sign-on-push = true;
      };
      fsmonitor = {
        backend = "watchman";
        watchman.register-snapshot-trigger = true;
      };
      signing = {
        behavior = "own";
        backend = "ssh";
        key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKnH3JJcsZnksInIdffC18IkcI2IGxnvyQBv3j+/MHsm";
        backends.ssh.program =
          if pkgs.stdenv.hostPlatform.isDarwin then
            "/Applications/1Password.app/Contents/MacOS/op-ssh-sign"
          else
            "";
      };
    };
  };
}
