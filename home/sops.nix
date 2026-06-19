{ pkgs, homedir, ... }:
{
  sops = {
    # age.keyFile = "${homedir}/.config/sops/age/keys.txt";
    age.keyFile = "";
    environment = {
      SOPS_AGE_SSH_PRIVATE_KEY_FILE = "${homedir}/.config/sops/age/ed25519_key";
    };
    defaultSopsFile = ../secrets/secrets.yaml;
    secrets.git = { };
    secrets.ssh_hosts = { };
    secrets."pi-mcp.json" = {
      sopsFile = ../dotfiles/pi/mcp.enc.json;
      path = "${homedir}/.pi/agent/mcp.json";
      key = "";
      format = "json";
    };
    secrets."pi-models.json" = {
      sopsFile = ../dotfiles/pi/models.enc.json;
      path = "${homedir}/.pi/agent/models.json";
      key = "";
      format = "json";
    };
  };
}
