{
  config,
  lib,
  pkgs,
  ...
}:
let
  # 普通 ssh 的 TERM 降级包装：将 xterm-kitty 降级为 xterm-256color，避免远端没有 terminfo
  # 不影响 kitten ssh（显式调用，不经过 PATH 查找）
  sshWithFallbackTerm = pkgs.writeShellScriptBin "ssh" ''
    TERM=xterm-256color exec ${lib.getExe' pkgs.openssh "ssh"} "$@"
  '';
in
{
  home.packages = [ sshWithFallbackTerm ];

  programs.ssh = {
    enable = true;
    # package = pkgs.openssh_10_2;
    enableDefaultConfig = false;
    includes = [
      "~/.orbstack/ssh/config"
      config.sops.secrets.ssh_hosts.path
    ];
    matchBlocks = {
      # 仅在非 SSH 会话中（SSH_TTY 未设置）使用 1Password agent
      # 在 SSH 会话中（SSH_TTY 已设置）不设置 IdentityAgent，走 SSH_AUTH_SOCK（agent forwarding）
      "1password" = lib.hm.dag.entryBefore [ "*" ] {
        match = ''host * exec "test -z $SSH_CONNECTION"'';
        identityAgent =
          if pkgs.stdenv.hostPlatform.isDarwin then
            ''"~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"''
          else
            "~/.1password/agent.sock";
      };
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
      };
      do = {
        proxyCommand = "${pkgs.cloudflared}/bin/cloudflared access ssh --hostname %h";
      };
    };
  };
}
