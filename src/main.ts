import * as Gtk from "../@types/Gjs/Gtk-3.0";
import * as Gio from "../@types/Gjs/Gio-2.0";
import * as Hdy from "../@types/Gjs/Handy-1";
import * as Notify from "../@types/Gjs/Notify-0.7";

import { SettingsWin } from "./window";

const app = new Gtk.Application({
  application_id: "org.gnome.SandBox.ImageViewerExample",
  flags: Gio.ApplicationFlags.FLAGS_NONE,
});

app.connect("startup", (_app) => {
  Hdy.init();
  Notify.init("mutter rounded setting");
});

app.connect("activate", (app) => {
  const win = SettingsWin(app);
  win.set_wmclass("mutter_setting", "Mutter Setting")
  win.set_application(app);
  win.show_all();
});

app.run(null);
