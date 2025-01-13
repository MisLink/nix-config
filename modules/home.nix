{
  username,
  homedir,
  pkgs,
  lib,
  config,
  inputs,
  ...
}:
{
  imports = [
    inputs.sops-nix.homeManagerModules.sops
  ];
  sops = {
    age.keyFile = "${homedir}/.config/sops/age/keys.txt";
    defaultSopsFile = ../secrets/secrets.yaml;
    secrets.git = { };
    secrets.ssh_hosts = { };
  };
  # Home Manager needs a bit of information about you and the paths it should
  # manage.
  home.username = username;
  home.homeDirectory = homedir;

  # This value determines the Home Manager release that your configuration is
  # compatible with. This helps avoid breakage when a new Home Manager release
  # introduces backwards incompatible changes.
  #
  # You should not change this value, even if you update Home Manager. If you do
  # want to update the value, then make sure to first check the Home Manager
  # release notes.
  home.stateVersion = "24.11"; # Please read the comment before changing.

  # The home.packages option allows you to install Nix packages into your
  # environment.
  home.packages = with pkgs; [
    cloudflared
    ffmpeg
    nmap
    openssh
    sccache
    shellcheck
    shfmt
    starship
    tealdeer
    typst
    zoxide
    gh
    _1password-cli
    # font
    agave
    sarasa-gothic
    # nix
    nil
    nixfmt-rfc-style
  ];

  # Home Manager is pretty good at managing dotfiles. The primary way to manage
  # plain files is through 'home.file'.
  home.file = {
    # # Building this configuration will create a copy of 'dotfiles/screenrc' in
    # # the Nix store. Activating the configuration will then make '~/.screenrc' a
    # # symlink to the Nix store copy.
    # ".screenrc".source = dotfiles/screenrc;

    # # You can also set the file content immediately.
    # ".gradle/gradle.properties".text = ''
    #   org.gradle.console=verbose
    #   org.gradle.daemon.idletimeout=3600000
    # '';
    ".config/kitty/kitty.app.png".source = ../dotfiles/kitty/kitty.app.png;
    ".config/pip/pip.conf".source = ../dotfiles/pip/pip.conf;
    ".cargo/config.toml".source = ../dotfiles/cargo/config.toml;
  };

  # Home Manager can also manage your environment variables through
  # 'home.sessionVariables'. These will be explicitly sourced when using a
  # shell provided by Home Manager. If you don't want to manage your shell
  # through Home Manager then you have to manually source 'hm-session-vars.sh'
  # located at either
  #
  #  ~/.nix-profile/etc/profile.d/hm-session-vars.sh
  #
  # or
  #
  #  ~/.local/state/nix/profiles/profile/etc/profile.d/hm-session-vars.sh
  #
  # or
  #
  #  /etc/profiles/per-user/guojiaqi/etc/profile.d/hm-session-vars.sh
  #
  home.sessionVariables = {
    # EDITOR = "vim";
    LC_ALL = "en_US.UTF-8";
    LESS = "--chop-long-lines --incsearch --ignore-case --status-column --hilite-unread --LONG-PROMPT --RAW-CONTROL-CHARS";
    VIRTUAL_ENV_DISABLE_PROMPT = "1";
    RUSTUP_DIST_SERVER = "https://rsproxy.cn";
    RUSTUP_UPDATE_ROOT = "https://rsproxy.cn/rustup";
  };

  home.shellAliases = {
    l = "ls -lah";
    ll = "ls -lh";
    la = "ls -lAh";
    j = "z";
    du = "du -h";
    df = "df -h";
    grep = "grep -Ei";
    del = "trash -v";
    s = "kitty +kitten ssh";
  };

  # Let Home Manager install and manage itself.
  programs = {
    atuin = {
      enable = true;
      enableZshIntegration = true;
      enableFishIntegration = true;
      settings = {
        sync_address = "https://atuin.uoiai.me";
        sync_frequency = "5s";
        style = "compact";
        inline_height = 20;
        filter_mode_shell_up_key_binding = "directory";
        enter_accept = true;
      };
    };
    bat = {
      enable = true;
      extraPackages = [ ];
      config = {
        theme = "Dracula";
      };
    };
    direnv = {
      enable = true;
      enableZshIntegration = true;
      config = {
        global = {
          strict_env = true;
          load_dotenv = true;
        };
        whitelist = {
          prefix = [ "~/projects" ];
        };
      };
      mise = {
        enable = true;
      };
      nix-direnv = {
        enable = true;
      };
    };
    fish = {
      enable = true;
    };
    fd = {
      enable = true;
    };
    fzf = {
      enable = true;
      enableZshIntegration = true;
      enableFishIntegration = true;
    };
    gh = {
      enable = true;
    };
    git = {
      enable = true;
      aliases = {
        s = "status";
        ss = "status -s";
        cs = "commit -s";
        cp = "cherry-pick";
        cps = "cherry-pick -x";
        co = "checkout";
        amend = "commit --amend";
        fixup = "commit --fixup";
        unc = "reset --mixed HEAD^";
        l = "log --graph --decorate --date=format:'%Y-%m-%d %H:%M:%S' --abbrev-commit --pretty=format:'%C(red)%h%C(reset) - %C(green)(%cd)%C(reset) %s %C(bold blue)<%an>%C(reset)%C(yellow)%d%C(reset)'";
      };
      delta = {
        enable = true;
        options = {
          navigate = true;
          line-numbers = {
            "line-numbers-zero-style" = "gray";
          };
          syntax-theme = "Dracula";
          features = "line-numbers";
        };
      };
      extraConfig = {
        core = {
          editor = "vim";
          autocrlf = "input";
          quotepath = false;
        };
        diff = {
          tool = "vscode";
          colorMoved = "default";
          submodule = "log";
        };
        "difftool \"vscode\"" = {
          cmd = "code --wait --diff $LOCAL $REMOTE";
        };
        merge = {
          tool = "vscode";
          conflictStyle = "zdiff3";
        };
        "mergetool \"vscode\"" = {
          cmd = "code --wait --merge $REMOTE $LOCAL $BASE $MERGED";
        };
        status = {
          submoduleSummary = true;
        };
        branch = {
          sort = "-committerdate";
        };
        push = {
          default = "simple";
          followTags = true;
        };
        pull = {
          rebase = true;
        };
        rebase = {
          autostash = true;
          autosquash = true;
          missingCommitsCheck = "error";
        };
        commit = {
          verbose = true;
        };
        rerere = {
          enabled = true;
        };
        log = {
          date = "iso";
        };
        submodule = {
          recurse = true;
        };
        init = {
          defaultBranch = "master";
        };
        gpg = {
          format = "ssh";
        };
        "gpg \"ssh\"" = {
          program = "/Applications/1Password.app/Contents/MacOS/op-ssh-sign"; # TODO
        };
      };
      ignores = [
        ".venv/"
        ".mypy_cache/"
        ".vscode/"
        ".idea/"
        ".DS_Store"
        ".env"
        ".envrc"
        ".mise.toml"
        ".mise.*.toml"
      ];
      includes = [ { path = config.sops.secrets.git.path; } ];
      userName = "MisLink";
      userEmail = "gjq.uoiai@outlook.com";
      signing = {
        signByDefault = true;
        key = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKnH3JJcsZnksInIdffC18IkcI2IGxnvyQBv3j+/MHsm";
      };
    };
    gpg = {
      enable = true;
    };
    home-manager = {
      enable = true;
    };
    htop = {
      enable = true;
    };
    jq = {
      enable = true;
    };
    kitty = {
      enable = true;
      darwinLaunchOptions = [
        "--single-instance"
        "--start-as=maximized"
      ];
      font = {
        package = pkgs.sarasa-gothic;
        name = "Sarasa Term SC";
        size = 19.0;
      };
      keybindings = {
        "cmd+1" = "goto_tab 1";
        "cmd+2" = "goto_tab 2";
        "cmd+3" = "goto_tab 3";
        "cmd+4" = "goto_tab 4";
        "cmd+5" = "goto_tab 5";
        "cmd+6" = "goto_tab 6";
        "cmd+7" = "goto_tab 7";
        "cmd+8" = "goto_tab 8";
        "cmd+9" = "goto_tab 9";
        "cmd+0" = "goto_tab 10";
        "shift+up" = "neighboring_window up";
        "shift+left" = "neighboring_window left";
        "shift+right" = "neighboring_window right";
        "shift+down" = "neighboring_window down";
        "cmd+d" = "launch --cwd=current --location=vsplit";
        "cmd+shift+d" = "launch --cwd=current --location=hsplit";
        "cmd+t" = "new_tab_with_cwd !neighbor";
        "cmd+shift+enter" = "toggle_layout stack";
        "alt+left" = "send_text all \\x1b\\x62";
        "alt+right" = "send_text all \\x1b\\x66";
        "cmd+f" = "show_scrollback";
        "kitty_mod+c" = "launch --type=clipboard --stdin-source=@last_cmd_output";
        "kitty_mod+ctrl+c" = "show_last_visited_command_output";
        "cmd+alt+i" = "launch --allow-remote-control kitty +kitten broadcast --match-tab state:focused";
      };
      settings = {
        symbol_map = "U+20-U+2F,U+3A-U+40,U+5B-U+60,U+7B-U+7E,U+30-U+39,U+61-U+7A,U+41-U+5A Agave";
        kitty_mod = "cmd+shift";
        cursor_shape = "beam";
        disable_ligatures = "cursor";
        scrollback_lines = -1;
        scrollback_pager = "${pkgs.less}/bin/less --chop-long-lines --incsearch --ignore-case --status-column --hilite-unread --LONG-PROMPT --RAW-CONTROL-CHARS +INPUT_LINE_NUMBER";
        scrollback_pager_history_size = 4096;
        url_style = "straight";
        strip_trailing_spaces = "smart";
        focus_follows_mouse = "yes";
        hide_window_decorations = "titlebar-only";
        tab_bar_style = "powerline";
        tab_powerline_style = "slanted";
        tab_title_max_length = 32;
        tab_title_template = "{fmt.fg.red}{bell_symbol}{activity_symbol}{fmt.fg.tab}{index}{'^' if layout_name == 'stack' else ''}:{title}";
        tab_bar_min_tabs = 1;
        background_opacity = 0.75;
        background_blur = 6;
        enabled_layouts = "splits,grid,fat,tall,stack";
        notify_on_cmd_finish = "invisible 5 notify";
        terminfo_type = "direct";
        cursor_trail = 10;
        cursor_trail_decay = "0.2 0.5";
      };
      extraConfig = ''
        mouse_map left click ungrabbed mouse_handle_click selection prompt
        mouse_map cmd+left click ungrabbed mouse_click_url
        mouse_map right press ungrabbed mouse_select_command_output
      '';
      themeFile = "VibrantInk";
    };
    less = {
      enable = true;
    };
    man = {
      enable = true;
      generateCaches = true;
    };
    mise = {
      enable = true;
      enableZshIntegration = true;
      enableFishIntegration = true;
      globalConfig = {
        tools = {
          python = [
            "latest"
            "sub-0.1:latest"
          ];
          java = [ "temurin-21" ];
          node = "lts";
          ruby = "latest";
          zig = "latest";
          go = [
            "latest"
            "sub-0.1:latest"
          ];
          "go:github.com/google/wire/cmd/wire" = "latest";
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
          "cargo:cargo-binstall" = "latest";
          "cargo:cargo-generate" = "latest";
          "cargo:cargo-wizard" = "latest";
          "cargo:cargo-watch" = "latest";
          "cargo:cargo-machete" = "latest";
          "cargo:samply" = "latest";
          "cargo:sqlx-cli" = "latest";
          "cargo:trunk" = "latest";
          "go:github.com/golangci/golangci-lint/cmd/golangci-lint" = "latest";
          "go:golang.org/x/tools/cmd/gonew" = "latest";
          "go:golang.org/x/tools/gopls" = "latest";
          "go:github.com/googleapis/api-linter/cmd/api-linter" = "latest";
          "go:github.com/go-delve/delve/cmd/dlv" = "latest";
          "go:entgo.io/ent/cmd/ent" = "latest";
          "go:github.com/yoheimuta/protolint/cmd/protolint" = "latest";
          "go:google.golang.org/protobuf/cmd/protoc-gen-go" = "latest";
          "go:google.golang.org/grpc/cmd/protoc-gen-go-grpc" = "latest";
          "npm:eslint" = "latest";
          "cargo:watchexec-cli" = "latest";
          "pipx:tach" = "latest";
          "go:github.com/cweill/gotests/gotests" = "latest";
          "go:github.com/fatih/gomodifytags" = "latest";
          "go:github.com/josharian/impl" = "latest";
          "cargo:binocle" = "latest";
          "go:github.com/Zxilly/go-size-analyzer/cmd/gsa" = "latest";
          "go:capnproto.org/go/capnp/v3/capnpc-go" = "latest";
          "go:github.com/moderato-app/live-pprof" = "v1";
          "cargo:git-absorb" = "latest";
          "cargo:bacon" = "latest";
          "cargo:binsider" = {
            "version" = "latest";
            "default-features" = "false";
          };
          "cargo:tokei" = "latest";
          "aqua:protocolbuffers/protobuf/protoc" = "latest";
        };
        settings = {
          legacy_version_file = false;
          plugin_autoupdate_last_check_duration = "1 week";
          experimental = true;
          python_compile = true;
          status = {
            missing_tools = "never";
            show_env = true;
          };
        };
      };
    };
    pandoc = {
      enable = true;
    };
    ripgrep = {
      enable = true;
    };
    ssh = {
      enable = true;
      controlMaster = "auto";
      controlPersist = "yes";
      serverAliveInterval = 60;
      includes = [
        "~/.orbstack/ssh/config"
        config.sops.secrets.ssh_hosts.path
      ];
      matchBlocks = {
        "*.uoiai.me" = {
          proxyCommand = "${pkgs.cloudflared}/bin/cloudflared access ssh --hostname %h";
        };
      };
      extraConfig =
        if pkgs.stdenv.hostPlatform.isDarwin then
          "IdentityAgent ~/Library/Group\ Containers/2BUA8C4S2C.com.1password/t/agent.sock"
        else
          "IdentityAgent ~/.1password/agent.sock";
    };
    starship = {
      enable = true;
      enableZshIntegration = true;
      enableFishIntegration = true;
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
    tealdeer = {
      enable = true;
    };
    tmux = {
      enable = true;
      extraConfig = ''
        bind - split-window -v
        bind \ split-window -h
        unbind '"'
        unbind %
        bind r source-file ~/.tmux.conf \; display "Reloaded."

        bind h select-pane -L
        bind j select-pane -D
        bind k select-pane -U
        bind l select-pane -R

        set -g mouse on

        bind c new-window -c "#{pane_current_path}"

        setw -g mode-keys vi
        set -g base-index 1
        set -s escape-time 0
        set -g status-interval 1

        # 颜色
        set -g status-bg black
        set -g status-fg white

        # 对齐方式
        set-option -g status-justify centre

        # 左下角
        set-option -g status-left '#[fg=white][#[fg=red]#S#[fg=white]]'
        set-option -g status-left-length 20

        # 窗口列表
        setw -g automatic-rename on
        set-window-option -g window-status-format '#[dim]#I:#[default]#W#[fg=grey,dim]'
        set-window-option -g window-status-current-format '#[fg=red,bold]#I#[fg=red]:#[fg=red]#W#[fg=dim]'

        # 右下角
        set -g status-right '#[fg=white][#[fg=red]%Y-%m-%d %H:%M:%S#[fg=white]]'
      '';
    };
    vim = {
      enable = true;
      defaultEditor = true;
      extraConfig = ''
        set hidden
        " 开启文件类型侦测
        filetype on
        " 根据侦测到的不同类型加载对应的插件
        filetype plugin on

        " 自动缩进
        filetype indent on

        " 开启语法高亮功能
        syntax enable
        " 允许用指定语法高亮配色方案替换默认方案
        syntax on

        " 关闭兼容模式
        set nocompatible
        " 开启实时搜索功能
        set incsearch
        " 搜索时忽略大小写
        set ignorecase
        " 搜索时如果只包含小写字母，匹配结果忽略大小写，如果包含大写字母，匹配结果是大小写敏感
        set smartcase
        "vim 命令自动补全
        set wildmenu
        " 文件自动更新
        set autoread
        " 禁止关闭闪烁
        set gcr=a:block-blinkon0
        " 总是显示状态栏
        set laststatus=2
        " 显示光标位置
        set ruler
        " 显示行号
        set number
        " 高亮显示当前行
        set cursorline
        " 高亮显示搜索结果
        set hlsearch
        " 回退键生效
        set backspace=indent,eol,start
        " 启用鼠标
        " set mouse+=a
        " 显示匹配括号
        set showmatch
        " 在状态栏显示正在输入的命令
        set showcmd

        " 禁止显示滚动条
        " set guioptions-=l
        " set guioptions-=L
        " set guioptions-=r
        " set guioptions-=R

        " 禁止显示菜单和工具条
        " set guioptions-=m
        " set guioptions-=T

        " 将制表符扩展为空格
        set expandtab
        " 设置编辑时制表符占用空格数
        set tabstop=4
        " 设置格式化时制表符占用空格数
        set shiftwidth=4
        " 让 vim 把连续数量的空格视为一个制表符
        set softtabstop=4
        " 基于缩进或语法进行代码折叠
        set foldmethod=syntax
        " 启动 vim 时关闭折叠代码
        set nofoldenable

        " 打开上次文件关闭的位置
        if has("autocmd")
           au BufReadPost * if line("'\"") > 1 && line("'\"") <= line("$") | exe "normal! g'\"" | endif
        endif

        autocmd filetype crontab setlocal nobackup nowritebackup

        nmap Q <Nop>
        " ## added by OPAM user-setup for vim / base ## 93ee63e278bdfc07d1139a748ed3fff2 ## you can edit, but keep this line
      '';
    };
    yazi = {
      enable = true;
      enableZshIntegration = true;
      enableFishIntegration = true;
    };
    zoxide = {
      enable = true;
      enableZshIntegration = true;
      enableFishIntegration = true;
    };
    zsh = {
      enable = true;
      autocd = true;
      autosuggestion = {
        enable = true;
      };
      history = {
        append = true;
        expireDuplicatesFirst = true;
        extended = true;
        ignoreAllDups = true;
        ignoreDups = true;
        ignoreSpace = true;
      };
      shellAliases = { };
      shellGlobalAliases = { };
      syntaxHighlighting = {
        enable = true;
      };
    };
  };
}
