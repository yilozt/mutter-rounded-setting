import * as Gtk from "../@types/Gjs/Gtk-3.0";
import * as Gio from "../@types/Gjs/Gio-2.0";
import * as Hdy from "../@types/Gjs/Handy-1";
import * as Notify from "../@types/Gjs/Notify-0.7";

import { SettingsWin } from "./window";

function check_extensions() {
  const uuid = "pickawindow@lluo.gitlab.com";
  const settings = Gio.Settings.new("org.gnome.shell");
  const disabled_list = settings.get_strv("disabled-extensions");
  const enabled_list = settings.get_strv("enabled-extensions");

  // if pick window extension is disabled, enable it
  if (disabled_list.indexOf(uuid) != -1) {
    disabled_list.splice(disabled_list.indexOf(uuid), 1);
  }
  if (enabled_list.indexOf(uuid) == -1) {
    enabled_list.push(uuid);
  }

  settings.set_strv("disabled-extensions", disabled_list);
  settings.set_strv("enabled-extensions", enabled_list);
}

const app = new Gtk.Application({
  application_id: "org.gnome.SandBox.ImageViewerExample",
  flags: Gio.ApplicationFlags.FLAGS_NONE,
});

app.connect("startup", (_app) => {
  Hdy.init();
  Notify.init("mutter rounded setting");
  check_extensions();
});

app.connect("activate", (app) => {
  const win = SettingsWin(app);
  win.set_wmclass("mutter_setting", "Mutter Setting")
  win.set_application(app);
  win.show_all();
});

app.run(null);
