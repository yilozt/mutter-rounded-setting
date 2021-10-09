import * as Gio from "../@types/Gjs/Gio-2.0";

const settings = Gio.Settings.new("org.gnome.mutter");
const PADDINGS = JSON.parse(settings.get_string("clip-edge-padding"));

const lists = {
  "black-list": settings.get_strv("black-list"),
  "blur-list": settings.get_strv("blur-list"),
};

export interface Paddings {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface AppPaddings {
  name: string;
  paddings: Paddings;
}

function padding2Arr(p: Paddings): number[] {
  const arr: number[] = [];
  arr[0] = p.left;
  arr[1] = p.right;
  arr[2] = p.top;
  arr[3] = p.bottom;
  return arr;
}

function arr2Padding(arr: number[]): Paddings {
  return {
    left: arr[0],
    right: arr[1],
    top: arr[2],
    bottom: arr[3],
  };
}

export function SetGlobalPadding(p: Paddings) {
  PADDINGS["global"] = padding2Arr(p);
  settings.set_string("clip-edge-padding", JSON.stringify(PADDINGS));
}

export function GetGlobalPadding(): Paddings {
  return arr2Padding(PADDINGS["global"]);
}

export function GetBlackList(): string[] {
  return lists["black-list"];
}

export function getBlurList(): string[] {
  return lists["blur-list"];
}

export function GetAppPaddings(): AppPaddings[] {
  const apps = PADDINGS["apps"];
  return Object.keys(apps).map((k) => {
    return {
      name: k,
      paddings: arr2Padding(apps[k]),
    };
  });
}

function change_str_list(key: string, oldstr: string, newstr: string): boolean {
  const list = lists[key];
  if (list.indexOf(newstr) != -1) return false;
  list[list.indexOf(oldstr)] = newstr;
  settings.set_strv(key, list);
  return true;
}

export function ChangeBlackListName(oldstr: string, newstr: string): boolean {
  return change_str_list("black-list", oldstr, newstr);
}

export function ChangeBlurListName(oldstr: string, newstr: string): boolean {
  return change_str_list("blur-list", oldstr, newstr);
}

export function ChangeAppListName(oldstr: string, newstr: string): boolean {
  if (oldstr == newstr) return true;
  if (PADDINGS["apps"][newstr]) return false;
  const arr = PADDINGS["apps"][oldstr];
  PADDINGS["apps"][newstr] = arr;
  delete PADDINGS["apps"][oldstr];
  settings.set_string("clip-edge-padding", JSON.stringify(PADDINGS));
  return true;
}

export function ChangeAppListPadding(
  oldstr: string,
  newstr: string,
  paddings: Paddings
): boolean {
  if (!ChangeAppListName(oldstr, newstr)) return false;
  PADDINGS["apps"][newstr] = padding2Arr(paddings);
  settings.set_string("clip-edge-padding", JSON.stringify(PADDINGS));
  return true;
}

function del_list_item(key: string, name: string) {
  const list = lists[key];
  list.splice(list.indexOf(name), 1);
  settings.set_strv(key, list);
}

export function DelBlackListItem(name: string) {
  del_list_item("black-list", name);
}

export function DelBlurListItem(name: string) {
  del_list_item("blur-list", name);
}

export function DelAppListItem(name: string) {
  delete PADDINGS["apps"][name];
  settings.set_string("clip-edge-padding", JSON.stringify(PADDINGS));
}

function add_list_item(key: string, name: string): boolean {
  const list = lists[key];
  if (list.indexOf(name) != -1) return false;
  list.push(name);
  settings.set_strv(key, list);
  return true;
}

export function AddBlackListItem(name: string): boolean {
  return add_list_item("black-list", name);
}

export function AddBlurListItem(name: string): boolean {
  return add_list_item("blur-list", name);
}

export function AddAppListItem(name: string): boolean {
  if (PADDINGS["apps"][name]) return false;
  PADDINGS["apps"][name] = padding2Arr(GetGlobalPadding());
  settings.set_string("clip-edge-padding", JSON.stringify(PADDINGS));
  return true;
}

export { settings };
