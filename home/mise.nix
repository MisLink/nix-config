{ ... }:
{
  programs.mise = {
    enable = true;
    globalConfig = {
      tools = {
        "go:github.com/golangci/golangci-lint/v2/cmd/golangci-lint" = "latest";
        "go:golang.org/x/tools/cmd/gonew" = "latest";
        "go:github.com/googleapis/api-linter/cmd/api-linter" = "latest";
        "go:github.com/yoheimuta/protolint/cmd/protolint" = "latest";
        "go:github.com/Zxilly/go-size-analyzer/cmd/gsa" = "latest"; # A simple tool to analyze the size of a Go compiled binary
        "go:github.com/moderato-app/live-pprof" = "v1";
        "go:github.com/bufbuild/buf/cmd/buf" = "latest"; # A tool for working with Protocol Buffers
        "pipx:ipython" = "latest";
        "pipx:notebook" = "latest";
        "pipx:litecli" = "latest";
        "pipx:mycli" = "latest";
        "pipx:pdm" = "latest";
        "pipx:pgcli" = "latest";
        "pipx:pre-commit" = "latest";
        "pipx:ruff" = "latest";
        "pipx:tach" = "latest"; # Tach is a Python tool to enforce dependencies and interfaces
        "cargo:binocle" = "latest"; # a graphical tool to visualize binary data
        "cargo:cargo-binstall" = "latest";
        "cargo:cargo-generate" = "latest";
        "cargo:cargo-wizard" = "latest"; # Cargo subcommand for configuring Cargo projects for best performance
        "cargo:cargo-machete" = "latest"; # Remove unused Rust dependencies
        "cargo:samply" = "latest"; # sampling profiler
        "cargo:trunk" = "latest"; # WASM web application bundler
        "cargo:watchexec-cli" = "latest";
        "cargo:git-absorb" = "latest"; # git commit --fixup
        "cargo:bacon" = "latest"; # background code checker
        "cargo:binsider" = {
          version = "latest";
          default-features = "false";
        }; # Analyze ELF binaries
        "cargo:tokei" = "latest"; # displays statistics about your code
        "npm:eslint" = "latest";
        "npm:@anthropic-ai/claude-code" = "latest";
        "npm:opencode-ai" = "latest";
        "npm:@sourcegraph/amp" = "latest";
        "npm:@openai/codex" = "latest";
        "npm:@google/gemini-cli" = "latest";
        "npm:@github/copilot" = "latest";
        "cargo:git-cliff" = "latest"; # A git cliff notes generator
        "npm:@fission-ai/openspec" = "latest"; # Open source specification tool by Fission AI
        "pipx:git+https://github.com/github/spec-kit.git" = "latest"; # A tool to generate OpenAPI specifications from GitHub repositories
      };
      settings = {
        fetch_remote_versions_timeout = "1m";
        legacy_version_file = false;
        plugin_autoupdate_last_check_duration = "1 week";
        experimental = true;
        status = {
          show_env = true;
        };
        pipx = {
          uvx = true;
          registry_url = "https://pypi.tuna.tsinghua.edu.cn/pypi/{}/json";
        };
        python.precompiled_flavor = "pgo+lto";
      };
    };
  };
}
