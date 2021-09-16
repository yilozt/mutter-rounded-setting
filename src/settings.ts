import * as Gio from "../@types/Gjs/Gio-2.0";

const settings = Gio.Settings.new("org.gnome.mutter");
const PADDINGS = JSON.parse(settings.get_string("clip-edge-padding"));
const BLACKLISTS = settings.get_strv("black-list");

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
  return BLACKLISTS;
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

export function ChangeBlackListName(oldstr: string, newstr: string): boolean {
  if (BLACKLISTS.indexOf(newstr) != -1) return false;
  BLACKLISTS[BLACKLISTS.indexOf(oldstr)] = newstr;
  settings.set_strv("black-list", BLACKLISTS);
  return true;
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

export function DelBlackListItem(name: string) {
  BLACKLISTS.splice(BLACKLISTS.indexOf(name), 1);
  settings.set_strv("black-list", BLACKLISTS);
}

export function DelAppListItem(name: string) {
  delete PADDINGS["apps"][name];
  settings.set_string("clip-edge-padding", JSON.stringify(PADDINGS));
}

export function AddBlackListItem(name: string): boolean {
  if (BLACKLISTS.indexOf(name) != -1) return false;
  BLACKLISTS.push(name);
  settings.set_strv("black-list", BLACKLISTS);
  return true;
}

export function AddAppListItem(name: string, paddings: Paddings): boolean {
  if (PADDINGS["apps"][name]) return false;
  PADDINGS["apps"][name] = padding2Arr(paddings);
  settings.set_string("clip-edge-padding", JSON.stringify(PADDINGS));
  return true;
}

export { settings };
