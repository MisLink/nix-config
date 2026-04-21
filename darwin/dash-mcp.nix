{ username, pkgs, ... }:
let
  logDir = "/Users/${username}/Library/Logs";
  logFile = "${logDir}/dash-mcp-server.log";
in
{
  launchd.agents.dash-mcp-server = {
    serviceConfig = {
      Label = "io.github.MisLink.dash-mcp-server";
      ProgramArguments = [
        "${pkgs.uv}/bin/uv"
        "tool"
        "run"
        "--from"
        "git+https://github.com/MisLink/dash-mcp-server.git"
        "dash-mcp-server"
        "--transport"
        "streamable-http"
        "--host"
        "0.0.0.0"
        "--port"
        "49455"
        "--allowed-host"
        "dash.mcp.srv:49455"
      ];
      RunAtLoad = true;
      ExitTimeOut = 30;
      KeepAlive = true;
      SoftResourceLimits = {
        NumberOfFiles = 4096;
      };
      StandardOutPath = logFile;
      StandardErrorPath = logFile;
      UserName = "${username}";
    };
  };
}
