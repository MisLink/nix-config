{
  description = "my hosts flake";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    nixpkgs-darwin.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
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
              ./nixpkgs/darwin.nix
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
              ./nixpkgs/darwin.nix
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
              ./nixpkgs/darwin.nix
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
              ./nixpkgs/linux.nix
              ./home
            ];
          };
      };
      nixosConfigurations = {
        "nixos-test" =
          let
            system = "aarch64-linux";
            username = "guojiaqi";
          in
          nixpkgs.lib.nixosSystem {
            specialArgs = {
              inherit
                inputs
                self
                username
                system
                ;
            };
            modules = [
              ./nixpkgs/linux.nix
              ./linux/orbstack
            ];
          };
      };
    };
}
