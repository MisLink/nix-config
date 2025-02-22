.PHONY: default
default: $(shell uname -s | tr '[:upper:]' '[:lower:]')

.PHONY: darwin
darwin:
	nix run nix-darwin -- switch --flake .#${shell scutil --get LocalHostName}

.PHONY: linux
linux:
	nix run home-manager -- switch --flake .#${shell hostname}
