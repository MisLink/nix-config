.PHONY: default
default: $(shell uname -s | tr '[:upper:]' '[:lower:]')

HOSTNAME := $(shell hostname -s)

# Check if darwin-rebuild command exists
DARWIN_REBUILD_PATH := $(shell command -v darwin-rebuild 2>/dev/null)

# Define the rebuild command and message based on whether darwin-rebuild exists
ifeq ($(DARWIN_REBUILD_PATH),)
  DARWIN_REBUILD_CMD := nix run nix-darwin/master\#darwin-rebuild --
else
  DARWIN_REBUILD_CMD := darwin-rebuild
endif

.PHONY: darwin
darwin:
	sudo $(DARWIN_REBUILD_CMD) switch --flake .#$(HOSTNAME)

.PHONY: linux
linux:
	sudo nixos-rebuild switch --flake .#$(HOSTNAME)

.PHONY: home
home:
	nix run home-manager/master -- switch --flake .#$(HOSTNAME)

.PHONY: edit
edit:
	SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt nix shell nixpkgs#sops -c sops edit ./secrets/secrets.yaml
