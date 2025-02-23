{ ... }:
{
  home.sessionVariables = {
    LC_ALL = "en_US.UTF-8";
    LESS = "--chop-long-lines --incsearch --ignore-case --status-column --hilite-unread --LONG-PROMPT --RAW-CONTROL-CHARS";
    VIRTUAL_ENV_DISABLE_PROMPT = "1";
    RUSTUP_DIST_SERVER = "https://rsproxy.cn";
    RUSTUP_UPDATE_ROOT = "https://rsproxy.cn/rustup";
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
