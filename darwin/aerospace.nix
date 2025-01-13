{ ... }:
{
  services.aerospace.enable = true;
  services.aerospace.settings = {
    accordion-padding = 30;
    after-login-command = [

    ];
    after-startup-command = [

    ];
    automatically-unhide-macos-hidden-apps = false;
    default-root-container-layout = "tiles";
    default-root-container-orientation = "vertical";
    enable-normalization-flatten-containers = true;
    enable-normalization-opposite-orientation-for-nested-containers = true;
    on-focused-monitor-changed = [
      "move-mouse monitor-lazy-center"
    ];
    start-at-login = false;
    on-window-detected = [
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
    key-mapping = {
      preset = "qwerty";
    };
    mode = {
      main = {
        binding = {
          alt-1 = "workspace 1";
          alt-2 = "workspace 2";
          alt-3 = "workspace 3";
          alt-4 = "workspace 4";
          alt-comma = "layout accordion vertical";
          alt-e = "workspace e";
          alt-enter = "fullscreen";
          alt-f = [
            "layout floating tiling"
          ];
          alt-h = "focus left --boundaries-action wrap-around-the-workspace --ignore-floating";
          alt-j = "focus down --boundaries-action wrap-around-the-workspace --ignore-floating";
          alt-k = "focus up --boundaries-action wrap-around-the-workspace --ignore-floating";
          alt-l = "focus right --boundaries-action wrap-around-the-workspace --ignore-floating";
          alt-period = "layout tiles vertical horizontal";
          alt-q = "workspace q";
          alt-r = "workspace r";
          alt-shift-1 = [
            "move-node-to-workspace 1"
            "workspace 1"
          ];
          alt-shift-2 = [
            "move-node-to-workspace 2"
            "workspace 2"
          ];
          alt-shift-3 = [
            "move-node-to-workspace 3"
            "workspace 3"
          ];
          alt-shift-4 = [
            "move-node-to-workspace 4"
            "workspace 4"
          ];
          alt-shift-e = [
            "move-node-to-workspace e"
            "workspace e"
          ];
          alt-shift-equal = "mode resize";
          alt-shift-h = "move left";
          alt-shift-j = "move down";
          alt-shift-k = "move up";
          alt-shift-l = "move right";
          alt-shift-n = "workspace next --wrap-around";
          alt-shift-p = "workspace prev --wrap-around";
          alt-shift-q = [
            "move-node-to-workspace q"
            "workspace q"
          ];
          alt-shift-r = [
            "move-node-to-workspace r"
            "workspace r"
          ];
          alt-shift-semicolon = "mode service";
          alt-shift-w = [
            "move-node-to-workspace w"
            "workspace w"
          ];
          alt-w = "workspace w";
        };
      };
      resize = {
        binding = {
          b = "balance-sizes";
          enter = "mode main";
          equal = "resize smart +50";
          esc = "mode main";
          h = "resize width -50";
          j = "resize height +50";
          k = "resize height -50";
          l = "resize width +50";
          minus = "resize smart -50";
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
    };
    workspace-to-monitor-force-assignment = {
      "3" = "secondary";
      "4" = "secondary";
      e = "secondary";
      r = "secondary";
    };
  };
}
