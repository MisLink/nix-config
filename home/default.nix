{
  username,
  homedir,
  pkgs,
  inputs,
  lib,
  ...
}:
{
  imports = [
    inputs.sops-nix.homeManagerModules.sops
    ./sops.nix
    ./git.nix
    ./ssh.nix
    ./starship.nix
    ./shell.nix
    ./nix.nix
    ./kitty.nix
    ./mise.nix
  ];

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
  home.packages =
    with pkgs;
    [
      cloudflared
      ffmpeg
      nmap
      # openssh
      sccache
      shellcheck
      shfmt
      typst
      gh
      glab
      _1password-cli
      dust
      gnumake
      duckdb
      # nix
      nil
      nixfmt
      # pkg
      python313
      python313Packages.uv
      python313Packages.pipx
      rustup
      cargo-binstall
      go
      nodejs_24
      temurin-bin
      devenv
      openconnect
      kubernetes-helm
      socat
      wget
      bear
      pv
      oras
      dive
      graphviz
      ipcalc
    ]
    ++ lib.optionals pkgs.stdenv.hostPlatform.isDarwin [
      coreutils-prefixed
    ];

  home.file = {
    "pdm" = {
      source = ../dotfiles/pdm/config.toml;
      target =
        (if pkgs.stdenv.hostPlatform.isDarwin then "Library/Application\ Support/pdm/" else ".config/pdm/")
        + "config.toml";
    };
    ".config/ruff/ruff.toml".source = ../dotfiles/ruff/ruff.toml;
    ".config/pip/pip.conf".source = ../dotfiles/pip/pip.conf;
    ".config/uv/uv.toml".source = ../dotfiles/uv/uv.toml;
    ".config/kitty/kitty.app.png".source = ../dotfiles/kitty/kitty.app.png;
    ".cargo/config.toml".source = ../dotfiles/cargo/config.toml;
    ".npmrc".source = ../dotfiles/npm/.npmrc;
    ".golangci.toml".source = ../dotfiles/golangci-lint/.golangci.toml;
    ".config/ghostty/config".source = ../dotfiles/ghostty/config;
  };
  programs = {
    atuin = {
      enable = true;
      settings = {
        sync_address = "https://atuin.uoiai.me";
        sync_frequency = 0;
        style = "compact";
        inline_height = 20;
        enter_accept = true;
        workspaces = true;
        filter_mode_shell_up_key_binding = "session";
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
      config = {
        global = {
          strict_env = true;
          load_dotenv = true;
        };
        whitelist = {
          prefix = [ "~/projects" ];
        };
      };
      mise.enable = true;
      nix-direnv.enable = true;
    };
    delta = {
      enable = true;
      enableGitIntegration = true;
      enableJujutsuIntegration = true;
      options = {
        navigate = true;
        line-numbers = {
          "line-numbers-zero-style" = "gray";
        };
        syntax-theme = "Dracula";
        features = "line-numbers";
      };
    };
    fd.enable = true;
    gh = {
      enable = true;
      settings = {
        git_protocol = "ssh";
      };
    };
    gpg.enable = true;
    home-manager.enable = true;
    htop.enable = true;
    jq.enable = true;
    less.enable = true;
    man = {
      enable = true;
      generateCaches = true;
    };
    pandoc.enable = true;
    ripgrep.enable = true;
    tealdeer.enable = true;
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
    yazi.enable = true;
    zoxide.enable = true;
  };
}
