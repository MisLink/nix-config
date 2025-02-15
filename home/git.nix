{
  config,
  lib,
  pkgs,
  ...
}:
{
  programs.git = {
    enable = true;
    aliases = {
      s = "status";
      ss = "status -s";
      cs = "commit -s";
      cp = "cherry-pick";
      cps = "cherry-pick -x";
      co = "checkout";
      amend = "commit --amend";
      fixup = "commit --fixup";
      unc = "reset --mixed HEAD^";
      l = "log --graph --decorate --date=format:'%Y-%m-%d %H:%M:%S' --abbrev-commit --pretty=format:'%C(red)%h%C(reset) - %C(green)(%cd)%C(reset) %s %C(bold blue)<%an>%C(reset)%C(yellow)%d%C(reset)'";
    };
    delta = {
      enable = true;
      options = {
        navigate = true;
        line-numbers = {
          "line-numbers-zero-style" = "gray";
        };
        syntax-theme = "Dracula";
        features = "line-numbers";
      };
    };
    extraConfig = {
      core = {
        editor = "vim";
        autocrlf = "input";
        quotepath = false;
      };
      diff = {
        tool = "vscode";
        colorMoved = "default";
        submodule = "log";
      };
      "difftool \"vscode\"" = {
        cmd = "code --wait --diff $LOCAL $REMOTE";
      };
      merge = {
        tool = "vscode";
        conflictStyle = "zdiff3";
      };
      "mergetool \"vscode\"" = {
        cmd = "code --wait --merge $REMOTE $LOCAL $BASE $MERGED";
      };
      status = {
        submoduleSummary = true;
      };
      branch = {
        sort = "-committerdate";
      };
      push = {
        default = "simple";
        followTags = true;
      };
      pull = {
        rebase = true;
      };
      rebase = {
        autostash = true;
        autosquash = true;
        missingCommitsCheck = "error";
      };
      commit = {
        verbose = true;
      };
      rerere = {
        enabled = true;
      };
      log = {
        date = "iso";
      };
      submodule = {
        recurse = true;
      };
      init = {
        defaultBranch = "master";
      };
    };
    ignores = [
      ".venv/"
      ".mypy_cache/"
      ".vscode/"
      ".idea/"
      ".DS_Store"
      ".env"
      ".envrc"
      ".mise.toml"
      ".mise.*.toml"
    ];
    includes = [ { path = config.sops.secrets.git.path; } ];
    userName = "MisLink";
    userEmail = "gjq.uoiai@outlook.com";
    signing = {
      format = "ssh";
      signByDefault = true;
      key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKnH3JJcsZnksInIdffC18IkcI2IGxnvyQBv3j+/MHsm";
      signer =
        if pkgs.stdenv.hostPlatform.isDarwin then
          "/Applications/1Password.app/Contents/MacOS/op-ssh-sign"
        else
          null;
    };
  };
}
