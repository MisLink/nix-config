{ pkgs, ... }:
{
  programs.kitty = {
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
      "kitty_mod+d" = "detach_window new-tab";
      "cmd+\\" = "launch --cwd=current --location=vsplit";
      "kitty_mod+\\" = "launch --cwd=current --location=hsplit";
      "ctrl+shift+]" = "next_window";
      "ctrl+shift+[" = "prev_window";
      "cmd+t" = "new_tab_with_cwd !neighbor";
      "kitty_mod+enter" = "toggle_layout stack";
      # mark
      "kitty_mod+m>c" = "create_marker";
      "kitty_mod+m>d" = "remove_marker";
      "ctrl+p" = "scroll_to_mark prev";
      "ctrl+n" = "scroll_to_mark next";
      "cmd+f" = "show_scrollback";
      "kitty_mod+c" = "launch --type=clipboard --stdin-source=@last_cmd_output";
      "cmd+alt+i" = "launch --allow-remote-control kitty +kitten broadcast --match-tab state:focused";
      # "alt+left" = "send_text all \\x1b\\x62";
      # "alt+right" = "send_text all \\x1b\\x66";
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
      scrollback_pager = "${pkgs.less}/bin/less --chop-long-lines --incsearch --ignore-case --status-column --hilite-unread --LONG-PROMPT --RAW-CONTROL-CHARS +INPUT_LINE_NUMBER";
      scrollback_pager_history_size = 1024;
      # mouse
      url_style = "straight";
      show_hyperlink_targets = "yes";
      strip_trailing_spaces = "smart";
      # window layout
      enabled_layouts = "splits,grid,fat,tall,stack";
      hide_window_decorations = "titlebar-only";
      # tab bar
      tab_bar_style = "powerline";
      tab_powerline_style = "angled";
      tab_title_max_length = 32;
      tab_title_template = "{fmt.fg.red}{bell_symbol}{activity_symbol}{fmt.fg.tab}{index}{'^' if layout_name == 'stack' else ''}:{title}";
      tab_bar_min_tabs = 1;
      # color
      background_opacity = 0.75;
      background_blur = 4;
      # advanced
      notify_on_cmd_finish = "invisible 5 notify";
      terminfo_type = "direct";
      # os specific
      kitty_mod = "cmd+shift";
    };
    extraConfig = ''
      mouse_map left click ungrabbed mouse_handle_click selection prompt
      mouse_map cmd+left click ungrabbed mouse_click_url
      mouse_map right press ungrabbed mouse_select_command_output
    '';
    themeFile = "spaceduck";
  };
}
