{ config, pkgs, ... }:
{
  programs.ssh = {
    enable = true;
    controlMaster = "auto";
    controlPersist = "yes";
    serverAliveInterval = 60;
    includes = [
      "~/.orbstack/ssh/config"
      config.sops.secrets.ssh_hosts.path
    ];
    matchBlocks = {
      "*.uoiai.me" = {
        proxyCommand = "${pkgs.cloudflared}/bin/cloudflared access ssh --hostname %h";
      };
    };
    extraConfig =
      ''
        SetEnv TERM=xterm-256color
      ''
      + (
        if pkgs.stdenv.hostPlatform.isDarwin then
          ''
            IdentityAgent "~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"
          ''
        else
          ''
            IdentityAgent ~/.1password/agent.sock
          ''
      );
  };
}
