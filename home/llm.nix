{ inputs, pkgs, ... }:
{
  home.packages = with inputs.llm-agents.packages.${pkgs.stdenv.hostPlatform.system}; [
    claude-code
    cc-switch-cli
    rtk
    pi
    amp
    codex
    copilot-cli
    gemini-cli
    opencode
    openspec
    spec-kit
  ];
}
