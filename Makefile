.PHONY: default
default: $(shell uname -s | tr '[:upper:]' '[:lower:]')

.PHONY: darwin
darwin:
	sudo nix run nix-darwin/master#darwin-rebuild -- switch --flake .#${shell scutil --get LocalHostName}

.PHONY: linux
linux:
	nix run home-manager/master -- switch --flake .#${shell hostname}


.PHONY: edit
edit:
	SOPS_AGE_KEY_FILE=~/.config/sops/age/keys.txt nix shell nixpkgs#sops -c sops edit ./secrets/secrets.yaml
