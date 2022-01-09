module.exports = {
  mode: 'production',
  entry: {
    mutter_settings: "./src/main.ts",
  },
  output: {
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: [/\.tsx?$/],
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
      {
        test: /\.glade$/,
        use: [
          {
            loader: "xml-minify-loader",
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};
