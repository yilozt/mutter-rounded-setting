const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const { Clutter } = imports.gi;

class Extension {
  constructor() {}

  enable() {
    this.settings = ExtensionUtils.getSettings(
      "org.gnome.shell.extensions.pickawindow"
    );
    this.settings.connect("changed", (settings, key) => this.onSettingsChanged(settings, key));
  }

  pickWindow(settings, x, y) {
    const actor = global
      .get_stage()
      .get_actor_at_pos(Clutter.PickMode.ALL, x, y);

    const type_name = actor.toString();
    let result = "";

    if (type_name.indexOf("MetaSurfaceActor") != -1) {
      result = actor.get_parent().get_meta_window().get_wm_class_instance();
    } else if (type_name.indexOf("WindowActor") != -1) {
      result = actor.get_meta_window().get_wm_class_instance();
    }

    settings.set_string("wm-instance", result);
    log("[pickawindow] : " + result);
  }

  onSettingsChanged(settings, key) {
    if (key == "pick-position") {
      const position = settings.get_value(key).deep_unpack();
      this.pickWindow(settings, position[0], position[1]);
    }
  }

  disable() {}
}

function init() {
  return new Extension();
}
