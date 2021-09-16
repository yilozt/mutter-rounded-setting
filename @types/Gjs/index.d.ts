import * as Gjs from "./Gjs";
import * as Gtk30 from "./Gtk-3.0";
import * as Handy1 from "./Handy-1";
import * as Notify07 from "./Notify-0.7";
import * as Xlib20 from "./xlib-2.0";
import * as Gdk30 from "./Gdk-3.0";
import * as Atk10 from "./Atk-1.0";
import * as Cairo10 from "./cairo-1.0";
import * as Pango10 from "./Pango-1.0";
import * as Gio20 from "./Gio-2.0";
import * as GdkPixbuf20 from "./GdkPixbuf-2.0";
import * as GObject20 from "./GObject-2.0";
import * as HarfBuzz00 from "./HarfBuzz-0.0";
import * as GLib20 from "./GLib-2.0";
import * as GModule20 from "./GModule-2.0";


declare global {
    function print(...args: any[]): void;
    function printerr(...args: any[]): void
    function log(message?: string): void
    function logError(exception: any, message?: string): void
    const ARGV: string[]
    const imports: typeof Gjs & {
        [key: string]: any
        gi: {
          Gtk: typeof Gtk30
          Handy: typeof Handy1
          Notify: typeof Notify07
          xlib: typeof Xlib20
          Gdk: typeof Gdk30
          Atk: typeof Atk10
          cairo: typeof Cairo10
          Pango: typeof Pango10
          Gio: typeof Gio20
          GdkPixbuf: typeof GdkPixbuf20
          GObject: typeof GObject20
          HarfBuzz: typeof HarfBuzz00
          GLib: typeof GLib20
          GModule: typeof GModule20
        }
        versions: {
            Gtk: string
            Handy: string
            Notify: string
            xlib: string
            Gdk: string
            Atk: string
            cairo: string
            Pango: string
            Gio: string
            GdkPixbuf: string
            GObject: string
            HarfBuzz: string
            GLib: string
            GModule: string
        }
        searchPath: string[];
    }
}

export { imports }
