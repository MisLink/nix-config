{ homedir, ... }:
{
  sops = {
    # age.keyFile = "${homedir}/.config/sops/age/keys.txt";
    age.keyFile = "";
    environment = {
      SOPS_AGE_KEY_CMD = "op read 'op://Personal/age/password'";
    };
    defaultSopsFile = ../secrets/secrets.yaml;
    secrets.git = { };
    secrets.ssh_hosts = { };
  };
}
