{ inputs, pkgs, ... }:
{
  home.packages = with inputs.llm-agents.packages.${pkgs.stdenv.hostPlatform.system}; [
    claude-code
    rtk
    pi
    amp
    codex
    copilot-cli
    openspec
    spec-kit
    agent-browser
    ccusage
  ];
  home.file = {
    ".pi/agent" = {
      source = ../dotfiles/pi;
      recursive = true;
    };
    ".agents/skills" = {
      source = ../dotfiles/skills/.agents/skills;
      recursive = true;
    };
    ".claude/skills" = {
      source = ../dotfiles/skills/.agents/skills;
      recursive = true;
    };
    ".codex/skills" = {
      source = ../dotfiles/skills/.agents/skills;
      recursive = true;
    };
    ".claude/settings.json".source = ../dotfiles/claude/settings.json;
  };
}
