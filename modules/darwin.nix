{
  self,
  pkgs,
  username,
  inputs,
  config,
  ...
}:
{
  imports = [
    inputs.home-manager.darwinModules.home-manager
  ];
  system.configurationRevision = self.rev or self.dirtyRev or null;
  system.stateVersion = 5;
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
  environment.shells = [ pkgs.fish ];
  home-manager = {
    useGlobalPkgs = true;
    useUserPackages = true;
    extraSpecialArgs = {
      inherit inputs username;
      homedir = config.users.users."${username}".home;
    };
    backupFileExtension = "backup";
    users."${username}" = ../home;
  };
}
