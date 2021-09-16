import * as Glib from "../@types/Gjs/GLib-2.0";
import * as Gtk from "../@types/Gjs/Gtk-3.0";
import * as Gdk from "../@types/Gjs/Gdk-3.0";

interface PickCb {
  (name: string): void;
}

let win: Gtk.Window;
let cb: PickCb;

function window_wm_class_instance_at_pos(x: number, y: number): string {
  const cmd = `gdbus call -e -d org.gnome.Shell \\
               -o /org/gnome/Shell  \\
               -m org.gnome.Shell.Eval '
      
              const { Clutter } = imports.gi;
              
              const actor = global
                .get_stage()
                .get_actor_at_pos(Clutter.PickMode.ALL, ${x}, ${y});
              
              const type_name = actor.toString();
              
              if (type_name.indexOf("MetaSurfaceActor") != -1) {
                actor.get_parent().get_meta_window().get_wm_class_instance();
              } else if (type_name.indexOf("WindowActor") != -1) {
                actor.get_meta_window().get_wm_class_instance();
              } else {
                "";
              }        // end '`;

  const res = Glib.spawn_command_line_sync(cmd)[1];
  let str: string = "";
  if (res) {
    for (let i = 0; i < res.length; i++) {
      str += String.fromCharCode(res[i]);
    }
  }

  str = str.replace(/^\(\S+, '"/, "");
  str = str.replace(/"'\)\s+$/, "");

  return str;
}

export function InitPickWindow(app: Gtk.Application): Gtk.Window {
  const screen = Gdk.Display.get_default()?.get_default_screen();
  const css_provider = Gtk.CssProvider.new();
  const css = `window {
                background: transparent;
                color: black;
              }

              label {
                color: white;
                padding: 16px;
                background: #000;
                opacity: 0.7;
                font-size: large;
              }`;
  const data: number[] = [];
  for (let i = 0; i < css.length; i++) data.push(css.charCodeAt(i));
  css_provider.load_from_data(new Uint8Array(data));

  win = Gtk.Window.new(Gtk.WindowType.POPUP);
  win.set_application(app);
  const label = Gtk.Label.new("Pick a Window");
  const box = new Gtk.Box();
  win
    .get_style_context()
    .add_provider(css_provider, Gtk.STYLE_PROVIDER_PRIORITY_SETTINGS);
  label
    .get_style_context()
    .add_provider(css_provider, Gtk.STYLE_PROVIDER_PRIORITY_SETTINGS);

  box.valign = Gtk.Align.CENTER;
  box.halign = Gtk.Align.CENTER;

  box.add(label);
  win.add(box);

  win.move(0, 0);
  win.default_height = (screen?.get_height() || 100) - 1;
  win.default_width = (screen?.get_width() || 100) - 1;

  win.set_visual(win.screen.get_rgba_visual());

  win.add_events(Gdk.EventMask.BUTTON_PRESS_MASK);
  win.add_events(Gdk.EventMask.POINTER_MOTION_MASK);

  (win as unknown as Gtk.Widget).connect("button-press-event", (_w, event) => {
    //@ts-ignore
    const [_, x, y] = event.get_device()?.get_position() || [0, 0, 0];

    win.hide();
    Glib.timeout_add(0, 200, () => {
      cb(window_wm_class_instance_at_pos(x, y));
      return false;
    });
  });
  (win as unknown as Gtk.Widget).connect(
    "motion-notify-event",
    (_widget, event: Gdk.Event) => {
      const [_, x, y] = event.get_device()?.get_position() || [0, 0, 0];
      label.set_label(`(${x}, ${y})`);
    }
  );

  return win;
}

export function RunPickWindow(_cb: PickCb) {
  cb = _cb;
  win.show_all();
}
