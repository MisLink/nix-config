{ pkgs, ... }:
{
  home.sessionVariables = {
    LC_ALL = "en_US.UTF-8";
    LESS = "--chop-long-lines --incsearch --ignore-case --status-column --hilite-unread --LONG-PROMPT --RAW-CONTROL-CHARS";
    VIRTUAL_ENV_DISABLE_PROMPT = "1";
    RUSTUP_DIST_SERVER = "https://rsproxy.cn";
    RUSTUP_UPDATE_ROOT = "https://rsproxy.cn/rustup";
    CARGO_BUILD_RUSTC_WRAPPER = "${pkgs.sccache}/bin/sccache";
    GOPROXY = "https://goproxy.cn,direct";
  };

  home.shellAliases = {
    l = "ls -lah";
    ll = "ls -lh";
    la = "ls -lAh";
    j = "z";
    du = "du -h";
    df = "df -h";
    grep = "grep -Ei";
  };
  home.shell.enableShellIntegration = true;
  programs.fish = {
    enable = true;
    preferAbbrs = true;
    plugins = [
      {
        name = "nix-env";
        src = pkgs.fetchFromGitHub {
          owner = "lilyball";
          repo = "nix-env.fish";
          rev = "7b65bd228429e852c8fdfa07601159130a818cfa";
          sha256 = "sha256-RG/0rfhgq6aEKNZ0XwIqOaZ6K5S4+/Y5EEMnIdtfPhk=";
        };
      }
    ];
  };
  programs.zsh = {
    enable = true;
    autocd = true;
    autosuggestion = {
      enable = true;
    };
    history = {
      append = true;
      expireDuplicatesFirst = true;
      extended = true;
      ignoreAllDups = true;
      ignoreDups = true;
      ignoreSpace = true;
    };
    shellAliases = { };
    shellGlobalAliases = { };
    syntaxHighlighting = {
      enable = true;
    };
  };
}
