const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  target: "node",
  mode: "production",
  entry: {
    index: path.resolve(__dirname, "src", "index.js"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
  },

  optimization: {
    splitChunks: { chunks: "all" },
  },

  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /(node_modules)/,
        use: ["babel-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js"],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: "src/**/*.cdc",
          to(props) {
            const { context, absoluteFilename } = props;
            console.log(props);
            const suffix = context + "/src/";
            const result = absoluteFilename.slice(suffix.length);
            // eslint-disable-next-line no-undef
            return Promise.resolve(result);
          },
        },
      ],
    }),
  ],
};
