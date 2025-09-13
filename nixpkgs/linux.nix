{ system, inputs, ... }:
{
  nixpkgs.pkgs = import inputs.nixpkgs {
    inherit system;
    config.allowUnfree = true;
    hostPlatform = system;
  };
}
