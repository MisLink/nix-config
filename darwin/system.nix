{ ... }:
{
  security.pam.enableSudoTouchIdAuth = true;
  system.defaults.".GlobalPreferences" = {
    "com.apple.mouse.scaling" = -1.0;
    "com.apple.sound.beep.sound" = /System/Library/Sounds/Tink.aiff;
  };
  system.defaults.ActivityMonitor = {
    IconType = 0;
    ShowCategory = 100;
  };
  system.defaults.NSGlobalDomain = {
    ApplePressAndHoldEnabled = false;
    AppleShowAllExtensions = true;
    AppleShowScrollBars = "WhenScrolling";
    AppleWindowTabbingMode = "manual";
    InitialKeyRepeat = 15;
    KeyRepeat = 2;
    NSAutomaticCapitalizationEnabled = false;
    NSAutomaticDashSubstitutionEnabled = false;
    NSAutomaticQuoteSubstitutionEnabled = false;
    NSAutomaticSpellingCorrectionEnabled = false;
    NSAutomaticWindowAnimationsEnabled = false;
    NSNavPanelExpandedStateForSaveMode = true;
    NSNavPanelExpandedStateForSaveMode2 = true;
    NSAutomaticPeriodSubstitutionEnabled = false;
    "com.apple.springing.delay" = 0.5;
    "com.apple.springing.enabled" = true;
    "com.apple.trackpad.forceClick" = true;
    "com.apple.trackpad.scaling" = 3.0;
    AppleInterfaceStyleSwitchesAutomatically = false;
    AppleScrollerPagingBehavior = true;
    AppleSpacesSwitchOnActivate = true;
  };
  system.defaults.WindowManager = {
    AppWindowGroupingBehavior = true;
    AutoHide = true;
    EnableStandardClickToShowDesktop = false;
    EnableTiledWindowMargins = false;
  };
  system.defaults.dock = {
    enable-spring-load-actions-on-all-items = true;
    appswitcher-all-displays = true;
    autohide = true;
    expose-group-apps = true;
    largesize = 80;
    magnification = true;
    minimize-to-application = true;
    mouse-over-hilite-stack = true;
    mru-spaces = false;
    scroll-to-open = true;
    show-process-indicators = true;
    show-recents = false;
    showhidden = true;
    tilesize = 50;
  };
  system.defaults.finder = {
    AppleShowAllExtensions = true;
    FXDefaultSearchScope = "SCcf";
    FXPreferredViewStyle = "Nlsv";
    NewWindowTarget = "Home";
    ShowPathbar = true;
  };
  system.defaults.loginwindow.GuestEnabled = false;
  system.defaults.spaces.spans-displays = true;
  system.defaults.trackpad.Clicking = false;
  system.defaults.trackpad.TrackpadRightClick = true;
  system.defaults.CustomSystemPreferences = { };
  system.defaults.CustomUserPreferences = { };
  time.timeZone = "Asia/Shanghai";
}
