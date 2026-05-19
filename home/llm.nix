{ inputs, pkgs, ... }:
{
  home.packages = with inputs.llm-agents.packages.${pkgs.stdenv.hostPlatform.system}; [
    claude-code
    rtk
    # pi
    amp
    codex
    copilot-cli
    openspec
    spec-kit
    agent-browser
    ccusage
  ];
}
