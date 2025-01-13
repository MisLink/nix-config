{ pkgs, ... }:
{
  programs.kitty = {
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
}
