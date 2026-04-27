final: prev: {
  folly = prev.folly.overrideAttrs (old: {
    # Skip flaky async UDP socket tests
    doCheck = false;
  });

  direnv = prev.direnv.overrideAttrs (old: {
    # With CGO disabled the internal linker is used by default; remove the
    # explicit -linkmode=external flag from the Makefile which is incompatible
    # with CGO_ENABLED=0 (see https://github.com/NixOS/nixpkgs/pull/486452)
    postPatch = ''
      substituteInPlace GNUmakefile --replace-fail " -linkmode=external" ""
    '';
  });
}
