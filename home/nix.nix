{
  pkgs,
  lib,
  username,
  ...
}:
{
  nix.package = lib.mkDefault pkgs.nix;
  nix.gc = {
    automatic = true;
    options = "--delete-older-than 30d";
  };
  nix.settings = {
    experimental-features = "nix-command flakes";
    substituters = [
      "https://mirrors.tuna.tsinghua.edu.cn/nix-channels/store"
      "https://cache.nixos.org/"
    ];
    extra-substituters = [
      "https://devenv.cachix.org"
    ];
    extra-trusted-public-keys = "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    trusted-users = [
      username
    ];
  };
}
