{ config, pkgs, ... }:
{
  programs.ssh = {
    enable = true;
    package = pkgs.openssh_10_2;
    enableDefaultConfig = false;
    includes = [
      "~/.orbstack/ssh/config"
      config.sops.secrets.ssh_hosts.path
    ];
    matchBlocks = {
      "*" = {
        controlMaster = "auto";
        controlPersist = "10m";
        serverAliveInterval = 15;
        forwardAgent = false;
        addKeysToAgent = "no";
        compression = false;
        serverAliveCountMax = 3;
        hashKnownHosts = false;
        userKnownHostsFile = "~/.ssh/known_hosts";
        controlPath = "~/.ssh/master-%r@%n:%p";
        identityAgent =
          if pkgs.stdenv.hostPlatform.isDarwin then
            ''"~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"''
          else
            "~/.1password/agent.sock";
        setEnv = {
          "TERM" = "xterm-256color";
        };
      };
      do = {
        proxyCommand = "${pkgs.cloudflared}/bin/cloudflared access ssh --hostname %h";
      };
    };
  };
}
