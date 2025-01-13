.PHONY: darwin
darwin:
	nix run nix-darwin -- switch --flake .#${shell scutil --get LocalHostName}
