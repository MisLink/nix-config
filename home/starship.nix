{ ... }:
{
  programs.starship = {
    enable = true;
    settings = {
      format = "$all$line_break$character";

      aws = {
        symbol = "aws ";
      };
      azure = {
        symbol = "az ";
      };
      bun = {
        symbol = "bun ";
      };
      c = {
        symbol = "C ";
      };
      character = {
        error_symbol = "[x](bold red)";
        success_symbol = "[>](bold green)";
        vimcmd_symbol = "[<](bold green)";
      };
      cmake = {
        symbol = "cmake ";
      };
      cobol = {
        symbol = "cobol ";
      };
      conda = {
        symbol = "conda ";
      };
      crystal = {
        symbol = "cr ";
      };
      daml = {
        symbol = "daml ";
      };
      dart = {
        symbol = "dart ";
      };
      deno = {
        symbol = "deno ";
      };
      directory = {
        read_only = " ro";
        truncation_length = 0;
      };
      docker_context = {
        symbol = "docker ";
      };
      dotnet = {
        symbol = ".NET ";
      };
      elixir = {
        symbol = "exs ";
      };
      elm = {
        symbol = "elm ";
      };
      fennel = {
        symbol = "fnl ";
      };
      fossil_branch = {
        symbol = "fossil ";
      };
      gcloud = {
        symbol = "gcp ";
      };
      git_branch = {
        symbol = "git ";
      };
      git_commit = {
        tag_symbol = " tag ";
      };
      git_status = {
        ahead = ">";
        behind = "<";
        deleted = "x";
        diverged = "<>";
        renamed = "r";
      };
      gleam = {
        symbol = "gleam ";
      };
      golang = {
        symbol = "go ";
      };
      gradle = {
        symbol = "gradle ";
      };
      guix_shell = {
        symbol = "guix ";
      };
      hg_branch = {
        symbol = "hg ";
      };
      java = {
        symbol = "java ";
      };
      julia = {
        symbol = "jl ";
      };
      kotlin = {
        symbol = "kt ";
      };
      lua = {
        symbol = "lua ";
      };
      memory_usage = {
        symbol = "memory ";
      };
      meson = {
        symbol = "meson ";
      };
      nats = {
        symbol = "nats ";
      };
      nim = {
        symbol = "nim ";
      };
      nix_shell = {
        symbol = "nix ";
      };
      nodejs = {
        symbol = "nodejs ";
      };
      ocaml = {
        symbol = "ml ";
      };
      opa = {
        symbol = "opa ";
      };
      os = {
        symbols = {
          AIX = "aix ";
          AlmaLinux = "alma ";
          Alpaquita = "alq ";
          Alpine = "alp ";
          Amazon = "amz ";
          Android = "andr ";
          Arch = "rch ";
          Artix = "atx ";
          CentOS = "cent ";
          Debian = "deb ";
          DragonFly = "dfbsd ";
          Emscripten = "emsc ";
          EndeavourOS = "ndev ";
          Fedora = "fed ";
          FreeBSD = "fbsd ";
          Garuda = "garu ";
          Gentoo = "gent ";
          HardenedBSD = "hbsd ";
          Illumos = "lum ";
          Kali = "kali ";
          Linux = "lnx ";
          Mabox = "mbox ";
          Macos = "mac ";
          Manjaro = "mjo ";
          Mariner = "mrn ";
          MidnightBSD = "mid ";
          Mint = "mint ";
          NetBSD = "nbsd ";
          NixOS = "nix ";
          OpenBSD = "obsd ";
          OpenCloudOS = "ocos ";
          OracleLinux = "orac ";
          Pop = "pop ";
          Raspbian = "rasp ";
          RedHatEnterprise = "rhel ";
          Redhat = "rhl ";
          Redox = "redox ";
          RockyLinux = "rky ";
          SUSE = "suse ";
          Solus = "sol ";
          Ubuntu = "ubnt ";
          Ultramarine = "ultm ";
          Unknown = "unk ";
          Void = "void ";
          Windows = "win ";
          openEuler = "oeul ";
          openSUSE = "osuse ";
        };
      };
      package = {
        symbol = "pkg ";
      };
      perl = {
        symbol = "pl ";
      };
      php = {
        symbol = "php ";
      };
      pijul_channel = {
        symbol = "pijul ";
      };
      pulumi = {
        symbol = "pulumi ";
      };
      purescript = {
        symbol = "purs ";
      };
      python = {
        symbol = "py ";
      };
      quarto = {
        symbol = "quarto ";
      };
      raku = {
        symbol = "raku ";
      };
      ruby = {
        symbol = "rb ";
      };
      rust = {
        symbol = "rs ";
      };
      scala = {
        symbol = "scala ";
      };
      solidity = {
        symbol = "solidity ";
      };
      spack = {
        symbol = "spack ";
      };
      status = {
        symbol = "[x](bold red) ";
        disabled = false;
      };
      sudo = {
        symbol = "sudo ";
        disabled = false;
      };
      swift = {
        symbol = "swift ";
      };
      terraform = {
        symbol = "terraform ";
      };
      typst = {
        symbol = "typst ";
      };
      zig = {
        symbol = "zig ";
      };
      time = {
        disabled = false;
      };
    };
  };
}
