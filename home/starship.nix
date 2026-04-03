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
        disabled = true;
        tag_symbol = " tag ";
      };
      git_status = {
        disabled = true;
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
      custom.jj = {
        description = "The current jj status";
        when = "jj --ignore-working-copy root";
        shell = [ "sh" ];
        symbol = "jj ";
        command = ''
          jj log --revisions @ --no-graph --ignore-working-copy --color always --limit 1 --template '
            separate(" ",
              change_id.shortest(4),
              bookmarks,
              "|",
              concat(
                if(conflict, "x"),
                if(divergent, "^"),
                if(hidden, "·"),
                if(immutable, "#"),
                if(self.contained_in("present(bookmarks()..@)"), "↑"),
                if(self.contained_in("present(@..bookmarks())"), "↓"),
              ),
              raw_escape_sequence("\x1b[1;32m") ++ if(empty, "(?)"),
              raw_escape_sequence("\x1b[1;32m") ++ coalesce(
                truncate_end(19, description.first_line(), "…"),
                "(WIP)",
              ) ++ raw_escape_sequence("\x1b[0m"),
            )
          '
        '';
      };
      custom.git_status = {
        when = "! jj --ignore-working-copy root";
        command = "starship module git_status";
        style = ""; # This disables the default "(bold green)" style
        description = "Only show git_status if we're not in a jj repo";
      };
      custom.git_commit = {
        when = "! jj --ignore-working-copy root";
        command = "starship module git_commit";
        style = "";
        description = "Only show git_commit if we're not in a jj repo";
      };
      git_metrics = {
        disabled = true;
      };
      custom.git_metrics = {
        when = "! jj --ignore-working-copy root";
        command = "starship module git_metrics";
        style = "";
        description = "Only show git_metrics if we're not in a jj repo";
      };
      git_branch = {
        disabled = true;
      };
      custom.git_branch = {
        when = "! jj --ignore-working-copy root";
        command = "starship module git_branch";
        style = "";
        description = "Only show git_branch if we're not in a jj repo";
      };
    };
  };
}
