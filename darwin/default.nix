{
  self,
  inputs,
  username,
  pkgs,
  config,
  ...
}:
let
  homedir = config.users.users."${username}".home;
  optional = import ../optional { inherit pkgs; };
in
{
  imports = [
    inputs.home-manager.darwinModules.home-manager
    ./nix.nix
    ./system.nix
    ./aerospace.nix
  ];
  system = {
    configurationRevision = self.rev or self.dirtyRev or null;
    stateVersion = 5;
  };
  users = {
    users."${username}" = {
      home = "/Users/${username}";
      description = username;
      shell = pkgs.fish;
      uid = 501;
    };
    knownUsers = [ username ];
  };
  programs.fish.enable = true;
  environment = {
    shells = [ pkgs.fish ];
    variables = {
      HOMEBREW_API_DOMAIN = "https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles/api";
      HOMEBREW_BOTTLE_DOMAIN = "https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles";
      HOMEBREW_PIP_INDEX_URL = "https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple";
      HOMEBREW_BREW_GIT_REMOTE = "https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/brew.git";
      HOMEBREW_CORE_GIT_REMOTE = "https://mirrors.tuna.tsinghua.edu.cn/git/homebrew/homebrew-core.git";
    };
    shellAliases = {
      cdf = ''cd "$(osascript -e 'tell app "Finder" to POSIX path of (insertion location as alias)')"'';
      ofd = "open -a Finder .";
      del = "${pkgs.darwin.trash} -v";
      s = "${pkgs.kitty} +kitten ssh";
    };
    systemPackages = with pkgs; [
      darwin.trash
    ];
  };
  home-manager = {
    useGlobalPkgs = true;
    useUserPackages = true;
    extraSpecialArgs = {
      inherit inputs username homedir;
    };
    backupFileExtension = "backup";
    users."${username}" = {
      imports = [
        ../home
        ../home/app/kitty.nix
      ];
    };
  };
  fonts.packages = [ ] ++ optional.fonts;
  homebrew = {
    enable = true;
    global = {
      autoUpdate = false;
    };
    onActivation = {
      autoUpdate = true;
      upgrade = true;
      cleanup = "uninstall";
    };
    brews = [ ];
    casks = [
      "surge"
      "firefox@nightly"
      "keka"
      "stats"
      "spotify"
      "logseq"
      "bettertouchtool"
      "visual-studio-code"
      "dash"
      "raycast"
      "fork"
      "typora"
      "pdf-expert"
      "rapidapi"
      "telegram"
      "shottr"
      "vlc"
      "calibre"
      "wireshark"
      "orbstack"
      "dbgate"
      "discord"
      "tor-browser"
      "little-snitch"
      "obsidian"
      "steam"
      "google-chrome"
      "vmware-fusion"
      "tencent-meeting"
      "jordanbaird-ice"
      "popclip"
      "1password"
      "microsoft-office"
      "witch"
      "openmtp"
      "cherry-studio"
    ];
    masApps = {
      "1Password for Safari" = 1569813296;
      "Xcode" = 497799835;
      "Klib" = 1196268448;
      "eudict" = 434350458;
      "wechat" = 836500024;
      "OpenCat" = 6445999201;
      "LiquidText" = 922765270;
      "iHosts" = 1102004240;
      "Immersive Translate" = 6447957425;
      "WindowsApp" = 1295203466;
      "SnippetsLab" = 1006087419;
      "Goodnotes" = 1444383602;
      "Reeder" = 1529448980;
      "rcmd" = 1596283165;
      "Xmind" = 1327661892;
      "QQ" = 451108668;
    };
  };
}
