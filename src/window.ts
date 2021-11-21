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
  AddBlurListItem,
  ChangeAppListName,
  ChangeAppListPadding,
  ChangeBlackListName,
  ChangeBlurListName,
  DelAppListItem,
  DelBlackListItem,
  DelBlurListItem,
  GetAppPaddings,
  GetBlackList,
  getBlurList,
  GetGlobalPadding,
  Paddings,
  SetGlobalPadding,
  settings,
} from "./settings";

interface PaddingChanged {
  (paddings: Paddings): void;
}

interface InitListFunc {
  (): ItemConfig[];
}

interface OnNameChanged {
  (oldstr: string, newstr: string): boolean;
}

interface OnDel {
  (str: string): void;
}

interface OnAdd {
  (str: string): boolean;
}

interface ListConfig {
  builder: Gtk.Builder;
  list_id: string;
  add_btn_id: string;
  item_ui: string;
  init_config: InitListFunc;
  on_name_changed: OnNameChanged;
  on_del: OnDel;
  on_add: OnAdd;
}

interface ItemConfig {
  title?: string;
  ui?: string;
  list?: Gtk.ListBox;
  expanded?: boolean;
  paddings?: Paddings;
  on_name_changed?: OnNameChanged;
  on_del?: OnDel;
}

function errMsg() {
  new Notify.Notification({
    summary: "same program exists in the list",
    body: "The Settings will not take effect",
  }).show();
}

function new_item({
  title = "new_item",
  ui = "",
  list,
  expanded = false,
  paddings,
  on_name_changed,
  on_del,
}: ItemConfig): Gtk.Widget {
  const builder = Gtk.Builder.new_from_string(ui, -1);
  const row = builder.get_object("row") as Hdy.ExpanderRow;
  const del_btn = builder.get_object("del_btn") as Gtk.Button;
  const pick_bl_btn = builder.get_object("pick_bl_btn") as Gtk.Button;
  const entry = builder.get_object("entry") as Gtk.Entry;

  row.title = title;
  entry.text = title;

  if (paddings) {
    log(JSON.stringify(paddings));
    padding_setting(builder, paddings, (p) => {
      if (!ChangeAppListPadding(row.title, entry.text, p)) errMsg();
      else row.title = entry.text;
    });
  }

  if (expanded) {
    row.expanded = true;
  }

  const update_label = () => {
    let ok = on_name_changed && on_name_changed(row.title, entry.text);
    ok ? (row.title = entry.text) : errMsg(), (entry.text = row.title);
    log(entry.text);
    entry.has_focus = true;
  };

  pick_bl_btn.connect("clicked", () =>
    RunPickWindow((app) => {
      log(app);
      if (app.length > 0) {
        entry.text = app;
        if (entry.text != row.title) {
          update_label();
        }
      }
    })
  );

  entry.connect("activate", (entry) => {
    if (entry.text != row.title && entry.text.length != 0) {
      update_label();
    }
  });

  del_btn.connect("clicked", () => {
    on_del && on_del(row.title);
    list?.remove(row);
  });
  return row;
}

function new_list({
  builder,
  list_id,
  add_btn_id,
  on_add,
  init_config,
  item_ui: ui,
  on_del,
  on_name_changed,
}: ListConfig) {
  const list_widget = builder.get_object(list_id) as Gtk.ListBox;
  const add_btn = builder.get_object(add_btn_id) as Gtk.Button;

  init_config().forEach((config) => {
    const row = new_item({
      on_del,
      on_name_changed,
      list: list_widget,
      ui,
      ...config,
    });
    list_widget.insert(row, 1);
  });

  add_btn.connect("clicked", () => {
    if (on_add("new_item")) {
      const row = new_item({
        title: "new_item",
        ui,
        list: list_widget,
        expanded: true,
        paddings: list_id == "app_list" ? GetGlobalPadding() : undefined,
        on_name_changed,
        on_del,
      });
      list_widget.insert(row, 1);
    }
  });
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
  padding_setting(builder, GetGlobalPadding(), SetGlobalPadding);

  const values_to_bind = [
    {
      obj: "adj_radius",
      settings: "round-corners-radius",
    },
    {
      obj: "adj_blur_sigmal",
      settings: "blur-sigmal",
    },
    {
      obj: "adj_blur_brightness",
      settings: "blur-brightness",
    },
    {
      obj: "adj_blured_window_opacity",
      settings: "blur-window-opacity",
    },
  ];

  values_to_bind.forEach((v) => {
    const adj_radius = builder.get_object(v.obj) as Gtk.Adjustment;
    settings.bind(
      v.settings,
      adj_radius,
      "value",
      Gio.SettingsBindFlags.DEFAULT
    );
  });
}

export function SettingsWin(app: Gtk.Application): Gtk.Window {
  const builder = Gtk.Builder.new_from_string(ui, -1);
  const win = builder.get_object("window") as Gtk.Window;
  const pick_win = InitPickWindow(app);

  global_setting(builder);

  [
    {
      builder,
      list_id: "bl_list",
      add_btn_id: "add_bl_btn",
      item_ui: blrow_ui,
      init_config: () =>
        GetBlackList().map((title) => ({
          title,
          expanded: false,
        })),
      on_name_changed: ChangeBlackListName,
      on_del: DelBlackListItem,
      on_add: AddBlackListItem,
    },
    {
      builder,
      list_id: "app_list",
      add_btn_id: "add_app_btn",
      item_ui: approw_ui,
      init_config: () =>
        GetAppPaddings().map(({ name: title, paddings }) => ({
          title,
          ui: approw_ui,
          paddings,
        })),
      on_name_changed: ChangeAppListName,
      on_del: DelAppListItem,
      on_add: AddAppListItem,
    },
    {
      builder,
      list_id: "blur_list",
      add_btn_id: "add_blur_btn",
      item_ui: blrow_ui,
      init_config() {
        return getBlurList().map((title) => ({ title }));
      },
      on_name_changed: ChangeBlurListName,
      on_add: AddBlurListItem,
      on_del: DelBlurListItem,
    },
  ].forEach((config) => new_list(config));

  win.connect("destroy", () => {
    pick_win.destroy();
  });

  return win;
}
