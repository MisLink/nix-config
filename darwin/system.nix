{ ... }:
{
  security.pam.services.sudo_local.touchIdAuth = true;
  security.pam.services.sudo_local.watchIdAuth = true;
  security.sudo.extraConfig = ''
    Defaults env_keep += "TERM TERMINFO TERMINFO_DIRS"
  '';
}
