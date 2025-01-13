{ homedir, ... }:
{
  sops = {
    age.keyFile = "${homedir}/.config/sops/age/keys.txt";
    defaultSopsFile = ../secrets/secrets.yaml;
    secrets.git = { };
    secrets.ssh_hosts = { };
  };
}
