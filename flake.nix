{
  description = "my hosts flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    nix-darwin = {
      url = "github:nix-darwin/nix-darwin/master";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    nix-homebrew.url = "github:zhaofengli/nix-homebrew";
    homebrew-core = {
      url = "github:homebrew/homebrew-core";
      flake = false;
    };
    homebrew-cask = {
      url = "github:homebrew/homebrew-cask";
      flake = false;
    };
    home-manager = {
      url = "github:nix-community/home-manager";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    sops-nix.url = "github:Mic92/sops-nix";
  };

  outputs =
    {
      self,
      nixpkgs,
      nix-darwin,
      home-manager,
      ...
    }@inputs:
    {
      darwinConfigurations = {
        "GJQMM" =
          let
            system = "aarch64-darwin";
            username = "guojiaqi";
          in
          nix-darwin.lib.darwinSystem {
            specialArgs = {
              inherit
                inputs
                self
                username
                system
                ;
            };
            modules = [
              ./nixpkgs
              ./darwin
            ];
          };
        "GJQMBP" =
          let
            system = "x86_64-darwin";
            username = "guojiaqi";
          in
          nix-darwin.lib.darwinSystem {
            specialArgs = {
              inherit
                inputs
                self
                username
                system
                ;
            };
            modules = [
              ./nixpkgs
              ./darwin
            ];
          };
        "MyMacMini" =
          let
            system = "aarch64-darwin";
            username = "mi";
          in
          nix-darwin.lib.darwinSystem {
            specialArgs = {
              inherit
                inputs
                self
                username
                system
                ;
            };
            modules = [
              ./nixpkgs
              ./darwin
            ];
          };
      };
      homeConfigurations = {
        "ubuntu" =
          let
            system = "aarch64-linux";
            username = "guojiaqi";
            pkgs = nixpkgs.legacyPackages.${system};
            homedir = "/home/${username}";
          in
          home-manager.lib.homeManagerConfiguration {
            inherit pkgs;
            extraSpecialArgs = {
              inherit
                inputs
                self
                username
                homedir
                system
                ;
            };
            modules = [
              ./nixpkgs
              ./home
            ];
          };
      };
    };
}
