{ pkgs, homedir, ... }:
let
  op =
    if pkgs.stdenv.hostPlatform.system == "aarch64-darwin" then
      "/opt/homebrew/bin/op"
    else
      "/usr/local/bin/op";
  opTokenFile = "${homedir}/.config/op/sops-service-account-token";
  sopsAgeKeyCmd = pkgs.writeShellScript "sops-age-key-cmd" ''
    set -eu

    if [ -z "''${OP_SERVICE_ACCOUNT_TOKEN:-}" ]; then
      IFS= read -r OP_SERVICE_ACCOUNT_TOKEN < "${opTokenFile}"
      export OP_SERVICE_ACCOUNT_TOKEN
    fi

    exec ${op} read "op://key/sops/private_key?ssh-format=openssh"
  '';
in
{
  sops = {
    # age.keyFile = "${homedir}/.config/sops/age/keys.txt";
    age.keyFile = "";
    environment = {
      SOPS_AGE_SSH_PRIVATE_KEY_CMD = "${sopsAgeKeyCmd}";
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
