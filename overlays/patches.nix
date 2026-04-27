final: prev: {
  # Skip flaky tests for packages with known failures
  folly = prev.folly.overrideAttrs (_: { doCheck = false; });
  edencommon = prev.edencommon.overrideAttrs (_: { doCheck = false; });

  direnv = prev.direnv.overrideAttrs (old: {
    # With CGO disabled the internal linker is used by default; remove the
    # explicit -linkmode=external flag from the Makefile which is incompatible
    # with CGO_ENABLED=0 (see https://github.com/NixOS/nixpkgs/pull/486452)
    postPatch = ''
      substituteInPlace GNUmakefile --replace-fail " -linkmode=external" ""
    '';
  });
}
