{ system, inputs, ... }:
{
  nixpkgs.pkgs = import inputs.nixpkgs-darwin {
    inherit system;
    config.allowUnfree = true;
    hostPlatform = system;
  };
}
