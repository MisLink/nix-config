{ pkgs, ... }:
{
  programs.kitty = {
    enable = pkgs.stdenv.hostPlatform.isDarwin;
    package = null;
    themeFile = "Catppuccin-Mocha";
    darwinLaunchOptions = [
      "--single-instance"
      "--start-as=maximized"
    ];
    font = {
      package = pkgs.sarasa-gothic;
      name = "Sarasa Term SC";
      size = 19.0;
    };
    settings = {
      # font
      symbol_map = "U+20-U+2F,U+3A-U+40,U+5B-U+60,U+7B-U+7E,U+30-U+39,U+61-U+7A,U+41-U+5A Agave";
      disable_ligatures = "cursor";
      # cursor
      cursor_shape = "beam";
      cursor_trail = 10;
      cursor_trail_decay = "0.2 0.5";
      # scrollback
      scrollback_lines = 5000;
      scrollback_pager = "${pkgs.less}/bin/less --tabs=4 --window=-2 --wordwrap --incsearch --ignore-case --status-line --use-color --HILITE-UNREAD --LONG-PROMPT --RAW-CONTROL-CHARS +INPUT_LINE_NUMBER";
      scrollback_pager_history_size = 1024;
      # mouse
      url_style = "straight";
      strip_trailing_spaces = "smart";
      # window layout
      enabled_layouts = "splits,tall,stack";
      # hide_window_decorations = "titlebar-and-corners";
      window_padding_width = 2;
      # tab bar
      tab_bar_style = "powerline";
      tab_powerline_style = "angled";
      tab_title_max_length = 32;
      tab_activity_symbol = "·";
      tab_title_template = "{fmt.fg.red}{bell_symbol}{activity_symbol}{fmt.fg.tab}{index}{'+' if layout_name == 'stack' else ''}:{title}";
      tab_bar_min_tabs = 1;
      # color
      background_opacity = 0.85;
      background_blur = 2;
      inactive_text_alpha = 0.75;
      # advanced
      # notify_on_cmd_finish = "invisible 30 notify";
      terminfo_type = "direct";
      listen_on = "unix:$TMPDIR/kitty.sock";
      allow_remote_control = "socket-only";
      kitty_mod = "cmd+shift";
      # os specific
      macos_option_as_alt = "left";
      macos_colorspace = "default";
      macos_titlebar_color = "background";
      # macos_window_resizable = "no";
      hide_window_decorations = "titlebar-only";
      macos_custom_beam_cursor = "yes";
    };
    keybindings = {
      # scrolling
      # window management
      "cmd+w" = "close_window";
      "cmd+1" = "goto_tab 1";
      "cmd+2" = "goto_tab 2";
      "cmd+3" = "goto_tab 3";
      "cmd+4" = "goto_tab 4";
      "cmd+5" = "goto_tab 5";
      "cmd+6" = "goto_tab 6";
      "cmd+7" = "goto_tab 7";
      "cmd+8" = "goto_tab 8";
      "cmd+9" = "goto_tab 9";
      "cmd+t" = "new_tab_with_cwd !neighbor";
      "cmd+d" = "launch --location=vsplit --cwd=current";
      "kitty_mod+d" = "launch --location=hsplit --cwd=current";
      "kitty_mod+z" = "scroll_to_prompt -1";
      "kitty_mod+x" = "scroll_to_prompt 1";
      "cmd+[" = "previous_window";
      "cmd+]" = "next_window";
      "kitty_mod+." = "move_tab_forward";
      "kitty_mod+," = "move_tab_backward";
      "kitty_mod+enter" = "toggle_layout stack";
      "kitty_mod+p" = "command_palette";
      # mark
      "kitty_mod+m>c" = "create_marker";
      "kitty_mod+m>d" = "remove_marker";
      "ctrl+p" = "scroll_to_mark prev";
      "ctrl+n" = "scroll_to_mark next";
    };
    mouseBindings = {
      "left click" = "ungrabbed mouse_handle_click selection prompt";
      "cmd+left click" = "ungrabbed mouse_click_url";
      "right click" = "ungrabbed mouse_select_command_output";
    };
    quickAccessTerminalConfig = {
      lines = 30;
      start_as_hidden = "yes";
    };
  };
}
