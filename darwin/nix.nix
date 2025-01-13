{ ... }:
{
  nix.settings = {
    experimental-features = "nix-command flakes";
    substituters = [
      "https://mirrors.tuna.tsinghua.edu.cn/nix-channels/store"
      "https://cache.nixos.org/"
    ];
  };
  nix.gc = {
    automatic = true;
    options = "--delete-older-than 30d";
  };
  nix.optimise.automatic = true;
  nixpkgs.config.allowUnfree = true;

}
