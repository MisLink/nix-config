{ username, system, ... }:
{
  nix.settings = {
    trusted-users = [
      username
    ];
  };
  nixpkgs.hostPlatform = system;
}
