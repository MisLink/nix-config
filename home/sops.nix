{ pkgs, ... }:
{
  sops = {
    # age.keyFile = "${homedir}/.config/sops/age/keys.txt";
    age.keyFile = "";
    environment = {
      SOPS_AGE_SSH_PRIVATE_KEY_CMD = ''${
        if pkgs.stdenv.hostPlatform.system == "aarch64-darwin" then "/opt/homebrew/bin/op" else "/usr/local/bin/op"
      } read "op://Personal/primary/private_key?ssh-format=openssh"'';
    };
    defaultSopsFile = ../secrets/secrets.yaml;
    secrets.git = { };
    secrets.ssh_hosts = { };
  };
}
