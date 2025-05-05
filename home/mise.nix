{ pkgs, ... }:
{
  programs.mise = {
    enable = true;
    globalConfig = {
      tools = {
        "go:github.com/google/wire/cmd/wire" = "latest";
        "go:github.com/golangci/golangci-lint/cmd/golangci-lint" = "latest";
        "go:golang.org/x/tools/cmd/gonew" = "latest";
        "go:github.com/googleapis/api-linter/cmd/api-linter" = "latest";
        "go:github.com/go-delve/delve/cmd/dlv" = "latest";
        "go:entgo.io/ent/cmd/ent" = "latest";
        "go:github.com/yoheimuta/protolint/cmd/protolint" = "latest";
        "go:google.golang.org/protobuf/cmd/protoc-gen-go" = "latest";
        "go:google.golang.org/grpc/cmd/protoc-gen-go-grpc" = "latest";
        "go:github.com/Zxilly/go-size-analyzer/cmd/gsa" = "latest";
        "go:capnproto.org/go/capnp/v3/capnpc-go" = "latest";
        "go:github.com/moderato-app/live-pprof" = "v1";
        "pipx:black" = "latest";
        "pipx:calibreweb" = "latest";
        "pipx:ipython" = "latest";
        "pipx:litecli" = "latest";
        "pipx:mycli" = "latest";
        "pipx:mypy" = "latest";
        "pipx:pdm" = "latest";
        "pipx:pgcli" = "latest";
        "pipx:pre-commit" = "latest";
        "pipx:ruff" = "latest";
        "pipx:tach" = "latest";
        "cargo:binocle" = "latest";
        "cargo:cargo-binstall" = "latest";
        "cargo:cargo-generate" = "latest";
        "cargo:cargo-wizard" = "latest";
        "cargo:cargo-machete" = "latest";
        "cargo:samply" = "latest";
        "cargo:sqlx-cli" = "latest";
        "cargo:trunk" = "latest";
        "cargo:watchexec-cli" = "latest";
        "cargo:git-absorb" = "latest";
        "cargo:bacon" = "latest";
        "cargo:binsider" = {
          "version" = "latest";
          "default-features" = "false";
        };
        "cargo:tokei" = "latest";
        "npm:eslint" = "latest";
        "aqua:protocolbuffers/protobuf/protoc" = "latest";
      };
      settings = {
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
        cargo.registry_name = "rsproxy-sparse";
      };
    };
  };
}
