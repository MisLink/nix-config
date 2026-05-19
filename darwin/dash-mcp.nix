{ username, pkgs, ... }:
let
  logDir = "/Users/${username}/Library/Logs";
  logFile = "${logDir}/dash-mcp-server.log";
in
{
  launchd.agents.dash-mcp-server = {
    serviceConfig = {
      Label = "io.github.MisLink.dash-mcp";
      ProgramArguments = [
        "${pkgs.nodejs}/bin/npx"
        "--yes"
        "github:MisLink/dash-mcp"
        "--transport"
        "streamable-http"
        "--host"
        "0.0.0.0"
        "--port"
        "49455"
      ];
      EnvironmentVariables = {
        PATH = "${pkgs.nodejs}/bin:/usr/bin:/bin";
        HOME = "/Users/${username}";
      };
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
