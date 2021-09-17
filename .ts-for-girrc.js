module.exports = {
  pretty: false,
  print: false,
  verbose: true,
  environments: ["gjs"],
  outdir: "@types",
  girDirectories: [
    "/usr/share/gir-1.0",
  ],
  modules: ["Gtk-3.0", "Handy-1", "Notify-0.7"],
  ignore: [],
  exportDefault: false,
};
