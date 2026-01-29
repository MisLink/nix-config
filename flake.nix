{
  description = "my hosts flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    # nixpkgs-darwin.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    nixpkgs-darwin.url = "github:NixOS/nixpkgs/b579d443b37c9c5373044201ea77604e37e748c8";
    nix-darwin = {
      url = "github:nix-darwin/nix-darwin/master";
      inputs.nixpkgs.follows = "nixpkgs";
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
      nixpkgs-darwin,
      nix-darwin,
      home-manager,
      ...
    }@inputs:
    let
      mkSystem =
        {
          system,
          username,
          hostname ? null,
          homeManager ? false,
        }:
        let
          isDarwin = builtins.match ".*darwin" system != null;
          baseSpecialArgs = {
            inherit
              inputs
              self
              username
              system
              ;
          };
          nixpkgsModule = {
            nixpkgs.pkgs = import (if isDarwin then nixpkgs-darwin else nixpkgs) {
              inherit system;
              config.allowUnfree = true;
            };
            nixpkgs.hostPlatform = system;
          };
        in
        if homeManager then
          home-manager.lib.homeManagerConfiguration {
            pkgs = import nixpkgs {
              inherit system;
              config.allowUnfree = true;
            };
            extraSpecialArgs = baseSpecialArgs // {
              homedir =
                if isDarwin then
                  "/Users/${username}"
                else if username == "root" then
                  "/root"
                else
                  "/home/${username}";
            };
            modules = [
              ./home
            ];
          }
        else if isDarwin then
          nix-darwin.lib.darwinSystem {
            specialArgs = baseSpecialArgs;
            modules = [
              nixpkgsModule
              ./darwin
            ];
          }
        else
          nixpkgs.lib.nixosSystem {
            specialArgs = baseSpecialArgs;
            modules = [
              nixpkgsModule
              ./linux/orbstack
              {
                networking.hostName = hostname;
              }
            ];
          };
    in
    {
      darwinConfigurations = {
        "GJQMM" = mkSystem {
          system = "aarch64-darwin";
          username = "guojiaqi";
        };
        "GJQMBP" = mkSystem {
          system = "x86_64-darwin";
          username = "guojiaqi";
        };
        "MyMacMini" = mkSystem {
          system = "aarch64-darwin";
          username = "mi";
        };
      };
      homeConfigurations = {
        "ubuntu" = mkSystem {
          system = "aarch64-linux";
          username = "guojiaqi";
          homeManager = true;
        };
        "ubuntu-amd64" = mkSystem {
          system = "x86_64-linux";
          username = "guojiaqi";
          homeManager = true;
        };
      };
      nixosConfigurations = {
        "nixos" = mkSystem {
          system = "aarch64-linux";
          username = "guojiaqi";
          hostname = "nixos";
        };
      };
    };
}
