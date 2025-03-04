{ ... }:
{
  services.aerospace.enable = true;
  services.aerospace.settings = {
    accordion-padding = 30;
    after-login-command = [

    ];
    after-startup-command = [

    ];
    enable-normalization-flatten-containers = true;
    enable-normalization-opposite-orientation-for-nested-containers = true;
    start-at-login = false;
    automatically-unhide-macos-hidden-apps = false;
    key-mapping = {
      preset = "qwerty";
    };

    default-root-container-layout = "tiles";
    default-root-container-orientation = "vertical";
    on-focused-monitor-changed = [
      "move-mouse monitor-lazy-center"
    ];

    gaps = {
      inner = {
        horizontal = 0;
        vertical = 0;
      };
      outer = {
        bottom = 0;
        left = 0;
        right = 0;
        top = 0;
      };
    };

    on-window-detected = [
      {
        check-further-callbacks = true;
        run = [
          "move-node-to-workspace 1"
        ];
      }
      {
        run = [
          "move-node-to-workspace w"
        ];
        "if" = {
          app-id = "org.mozilla.nightly";
        };
      }
      {
        run = [
          "move-node-to-workspace e"
        ];
        "if" = {
          app-id = "com.microsoft.VSCode";
        };
      }
      {
        run = [
          "layout floating"
          "move-node-to-workspace e"
        ];
        "if" = {
          app-id = "com.DanPristupov.Fork";
        };
      }
      {
        run = [
          "move-node-to-workspace q"
        ];
        "if" = {
          app-id = "com.tencent.xinWeChat";
        };
      }
      {
        run = [
          "move-node-to-workspace q"
        ];
        "if" = {
          app-id = "ru.keepcoder.Telegram";
        };
      }
      {
        run = [
          "move-node-to-workspace q"
        ];
        "if" = {
          app-id = "com.apple.mail";
        };
      }
      {
        run = [
          "move-node-to-workspace q"
        ];
        "if" = {
          app-id = "com.electron.lark";
        };
      }
      {
        run = [
          "move-node-to-workspace r"
        ];
        "if" = {
          app-id = "com.reederapp.5.macOS";
        };
      }
      {
        run = [
          "move-node-to-workspace r"
        ];
        "if" = {
          app-id = "com.readdle.PDFExpert-Mac";
        };
      }
      {
        run = [
          "move-node-to-workspace r"
        ];
        "if" = {
          app-id = "com.apple.Preview";
        };
      }
      {
        run = [
          "move-node-to-workspace r"
        ];
        "if" = {
          app-id = "md.obsidian";
        };
      }
      {
        run = [
          "move-node-to-workspace r"
        ];
        "if" = {
          app-id = "com.apple.Notes";
        };
      }
      {
        run = [
          "move-node-to-workspace r"
        ];
        "if" = {
          app-id = "com.apple.reminders";
        };
      }
      {
        run = [
          "move-node-to-workspace 3"
        ];
        "if" = {
          app-id = "org.dbgate";
        };
      }
      {
        run = [
          "move-node-to-workspace 3"
        ];
        "if" = {
          app-id = "com.luckymarmot.Paw";
        };
      }
      {
        run = [
          "layout floating"
        ];
        "if" = {
          app-id = "net.kovidgoyal.kitty";
        };
      }
      {
        run = [
          "layout floating"
        ];
        "if" = {
          app-id = "com.apple.ActivityMonitor";
        };
      }
      {
        run = [
          "layout floating"
        ];
        "if" = {
          app-id = "com.1password.1password";
        };
      }
      {
        run = [
          "layout floating"
        ];
        "if" = {
          app-id = "com.kapeli.dashdoc";
        };
      }
    ];
    mode = {
      main = {
        binding = {
          shift-alt-q = "workspace q"; # messages
          shift-alt-w = "workspace w"; # browsing
          shift-alt-e = "workspace e"; # coding
          shift-alt-r = "workspace r"; # reading
          shift-alt-1 = "workspace 1";
          shift-alt-2 = "workspace 2";
          shift-alt-3 = "workspace 3";
          shift-alt-4 = "workspace 4";

          shift-ctrl-alt-q = [
            "move-node-to-workspace q"
            "workspace q"
          ];
          shift-ctrl-alt-w = [
            "move-node-to-workspace w"
            "workspace w"
          ];
          shift-ctrl-alt-e = [
            "move-node-to-workspace e"
            "workspace e"
          ];
          shift-ctrl-alt-r = [
            "move-node-to-workspace r"
            "workspace r"
          ];
          shift-ctrl-alt-1 = [
            "move-node-to-workspace 1"
            "workspace 1"
          ];
          shift-ctrl-alt-2 = [
            "move-node-to-workspace 2"
            "workspace 2"
          ];
          shift-ctrl-alt-3 = [
            "move-node-to-workspace 3"
            "workspace 3"
          ];
          shift-ctrl-alt-4 = [
            "move-node-to-workspace 4"
            "workspace 4"
          ];

          alt-comma = "layout accordion vertical horizontal";
          alt-period = "layout tiles vertical horizontal";

          alt-h = "focus left --boundaries-action wrap-around-the-workspace";
          alt-j = "focus down --boundaries-action wrap-around-the-workspace";
          alt-k = "focus up --boundaries-action wrap-around-the-workspace";
          alt-l = "focus right --boundaries-action wrap-around-the-workspace";

          alt-shift-h = "move left";
          alt-shift-j = "move down";
          alt-shift-k = "move up";
          alt-shift-l = "move right";

          alt-enter = "fullscreen";
          alt-f = [
            "layout floating tiling"
          ];

          alt-rightSquareBracket = "workspace next --wrap-around";
          alt-leftSquareBracket = "workspace prev --wrap-around";

          alt-shift-rightSquareBracket = "move-workspace-to-monitor --wrap-around next";
          alt-shift-leftSquareBracket = "move-workspace-to-monitor --wrap-around prev";

          alt-shift-semicolon = "mode service";
          alt-shift-0 = "mode resize";
        };
      };
      service = {
        binding = {
          alt-shift-h = [
            "join-with left"
            "mode main"
          ];
          alt-shift-j = [
            "join-with down"
            "mode main"
          ];
          alt-shift-k = [
            "join-with up"
            "mode main"
          ];
          alt-shift-l = [
            "join-with right"
            "mode main"
          ];
          backspace = [
            "close-all-windows-but-current"
            "mode main"
          ];
          esc = [
            "reload-config"
            "mode main"
          ];
          r = [
            "flatten-workspace-tree"
            "mode main"
          ];
        };
      };
      resize = {
        binding = {
          h = "resize width -50";
          j = "resize height +50";
          k = "resize height -50";
          l = "resize width +50";
          b = "balance-sizes";
          minus = "resize smart -50";
          equal = "resize smart +50";

          enter = "mode main";
          esc = "mode main";
        };
      };
    };
  };
}
