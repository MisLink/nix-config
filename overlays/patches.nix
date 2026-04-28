final: prev:
let
  isX86_64 = prev.lib.hasPrefix "x86_64-" prev.stdenv.hostPlatform.system;
in
{
  # Skip flaky tests for packages with known failures (x86_64 only)
  folly = prev.folly.overrideAttrs (_: prev.lib.optionalAttrs isX86_64 { doCheck = false; });
  edencommon = prev.edencommon.overrideAttrs (_: prev.lib.optionalAttrs isX86_64 { doCheck = false; });

  direnv = prev.direnv.overrideAttrs (old: {
    # With CGO disabled the internal linker is used by default; remove the
    # explicit -linkmode=external flag from the Makefile which is incompatible
    # with CGO_ENABLED=0 (see https://github.com/NixOS/nixpkgs/pull/486452)
    postPatch = ''
      substituteInPlace GNUmakefile --replace-fail " -linkmode=external" ""
    '';
  });
}
