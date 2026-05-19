{ inputs, system }:
final: prev: {
  pkgsStable = import inputs.nixpkgs-stable {
    inherit system;
    config.allowUnfree = true;
  };

  # Fix broken tests in unstable packages
  pipx = prev.pipx.overridePythonAttrs (old: {
    disabledTests = (old.disabledTests or [ ]) ++ [
      "test_fix_package_name"
      "test_parse_specifier_for_metadata"
    ];
  });
}
