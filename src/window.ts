const blrow_ui = require("../ui/bl_row.glade");
const approw_ui = require("../ui/app_row.glade");
const ui = require("../ui/window.glade");

import * as Gio from "../@types/Gjs/Gio-2.0";
import * as Gtk from "../@types/Gjs/Gtk-3.0";
import * as Hdy from "../@types/Gjs/Handy-1";
import * as Notify from "../@types/Gjs/Notify-0.7";

import { InitPickWindow, RunPickWindow } from "./pick_window";
import {
  AddAppListItem,
  AddBlackListItem,
  ChangeAppListName,
  ChangeAppListPadding,
  ChangeBlackListName,
  DelAppListItem,
  DelBlackListItem,
  GetAppPaddings,
  GetBlackList,
  GetGlobalPadding,
  Paddings,
  SetGlobalPadding,
  settings,
} from "./settings";

interface PaddingChanged {
  (paddings: Paddings): void;
}

interface InitListFunc {
  (list: Gtk.ListBox): void;
}

function errMsg() {
  new Notify.Notification({
    summary: "列表中存在相同的程序",
    body: "设置将不会生效",
  }).show();
}

function new_item(
  title: string,
  ui: string,
  list: Gtk.ListBox,
  expanded: boolean,
  padding?: Paddings
): Gtk.Widget {
  const builder = Gtk.Builder.new_from_string(ui, -1);
  const row = builder.get_object("row") as Hdy.ExpanderRow;
  const del_btn = builder.get_object("del_btn") as Gtk.Button;
  const pick_bl_btn = builder.get_object("pick_bl_btn") as Gtk.Button;
  const entry = builder.get_object("entry") as Gtk.Entry;

  row.title = title;
  entry.text = title;

  if (padding) {
    padding_setting(builder, padding, (padding) => {
      if (!ChangeAppListPadding(row.title, entry.text, padding)) errMsg();
      else row.title = entry.text;
    });
  }

  if (expanded) {
    row.expanded = true;
  }

  pick_bl_btn.connect("clicked", () =>
    RunPickWindow((app) => {
      if (app.length != 0) {
        entry.text = app;
        if (entry.text != row.title) {
          let ok = false;
          !padding
            ? (ok = ChangeBlackListName(row.title, entry.text))
            : (ok = ChangeAppListName(row.title, entry.text));
          ok ? (row.title = entry.text) : errMsg(), (entry.text = row.title);
          entry.has_focus = true;
        }
      }
    })
  );

  entry.connect("activate", (entry) => {
    if (entry.text != row.title && entry.text.length != 0) {
      let ok = false;
      !padding
        ? (ok = ChangeBlackListName(row.title, entry.text))
        : (ok = ChangeAppListName(row.title, entry.text));
      ok ? (row.title = entry.text) : errMsg(), (entry.text = row.title);
      entry.has_focus = true;
    }
  });

  del_btn.connect("clicked", () => {
    padding ? DelAppListItem(row.title) : DelBlackListItem(row.title);
    list.remove(row);
  });
  return row;
}

function new_list(
  builder: Gtk.Builder,
  name: string,
  add_name: string,
  init: InitListFunc,
  add: InitListFunc
) {
  const list_widget = builder.get_object(name) as Gtk.ListBox;
  const add_btn = builder.get_object(add_name) as Gtk.Button;

  init(list_widget);

  add_btn.connect("clicked", () => add(list_widget));
}

function padding_setting(
  builder: Gtk.Builder,
  paddings: Paddings,
  onChanged: PaddingChanged
) {
  const adj_padding_left = builder.get_object(
    "adj_padding_left"
  ) as Gtk.Adjustment;
  const adj_padding_right = builder.get_object(
    "adj_padding_right"
  ) as Gtk.Adjustment;
  const adj_padding_top = builder.get_object(
    "adj_padding_top"
  ) as Gtk.Adjustment;
  const adj_padding_bottom = builder.get_object(
    "adj_padding_bottom"
  ) as Gtk.Adjustment;

  adj_padding_left.value = paddings.left;
  adj_padding_right.value = paddings.right;
  adj_padding_bottom.value = paddings.bottom;
  adj_padding_top.value = paddings.top;

  function changed() {
    onChanged({
      left: adj_padding_left.value,
      right: adj_padding_right.value,
      top: adj_padding_top.value,
      bottom: adj_padding_bottom.value,
    });
  }

  adj_padding_bottom.connect("value-changed", changed);
  adj_padding_top.connect("value-changed", changed);
  adj_padding_left.connect("value-changed", changed);
  adj_padding_right.connect("value-changed", changed);
}

function global_setting(builder: Gtk.Builder) {
  const adj_radius = builder.get_object("adj_radius") as Gtk.Adjustment;

  padding_setting(builder, GetGlobalPadding(), SetGlobalPadding);

  settings.bind(
    "round-corners-radius",
    adj_radius,
    "value",
    Gio.SettingsBindFlags.DEFAULT
  );
}

export function SettingsWin(app: Gtk.Application): Gtk.Window {
  const builder = Gtk.Builder.new_from_string(ui, -1);
  const win = builder.get_object("window") as Gtk.Window;
  const pick_win = InitPickWindow(app);

  global_setting(builder);

  new_list(
    builder,
    "bl_list",
    "add_bl_btn",
    (list) => {
      GetBlackList().forEach((title) => {
        const row = new_item(title, blrow_ui, list, false);
        list.insert(row, 1);
      });
    },
    (list) => {
      if (AddBlackListItem("new_item")) {
        const row = new_item("new_item", blrow_ui, list, true);
        list.insert(row, 1);
      } else {
        errMsg();
      }
    }
  );

  new_list(
    builder,
    "app_list",
    "add_app_btn",
    (list) => {
      GetAppPaddings().forEach((app) => {
        const row = new_item(app.name, approw_ui, list, false, app.paddings);
        list.insert(row, 1);
      });
    },
    (list) => {
      const padding = GetGlobalPadding();
      if (AddAppListItem("new_item", padding)) {
        const row = new_item("new_item", approw_ui, list, true, padding);
        list.insert(row, 1);
      } else {
        errMsg();
      }
    }
  );

  win.connect("destroy", () => {
    pick_win.destroy();
  });

  return win;
}
