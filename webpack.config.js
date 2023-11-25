const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = (env, argv) => {
  const productionMode = argv.mode === "production";
  const outputFilename = "[name].[contenthash]";

  const result = {
    entry: {
      app: [
        "core-js/stable",
        "regenerator-runtime/runtime",
        "whatwg-fetch",
        "./src",
      ],
    },
    output: {
      path: path.resolve(__dirname, "build"),
      filename: `${outputFilename}.js`,
      chunkFilename: `${outputFilename}.js`,
      publicPath: productionMode ? "/build/" : "/",
    },
    optimization: {
      usedExports: true,
      sideEffects: true,
      innerGraph: true,
      splitChunks: {
        chunks: "all",
        name: "vendors",
      },
    },
    devServer: {
      port: 8095,
      historyApiFallback: true,
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules|\.git/,
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
          },
        },
        {
          test: /\.s?css$/,
          use: [
            productionMode ? MiniCssExtractPlugin.loader : "style-loader",
            { loader: "css-loader" },
            { loader: "sass-loader" },
          ],
        },
        {
          test: /\.(jpe?g|png|gif|svg|woff|woff2|ttf|eot)/,
          type: "asset/resource",
        },
      ],
    },
    devtool: productionMode ? "source-map" : "eval-cheap-module-source-map",
    plugins: [
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        filename: "index.html",
        chunks: ["app", "vendors"],
        chunksSortMode: "none",
        favicon: "./public/favicon.ico",
      }),
    ],
    resolve: {
      extensions: [".js", ".jsx", ".css", ".scss"],
      modules: [path.resolve("./src"), path.resolve("./node_modules")],
      fallback: {
        path: require.resolve("path-browserify"),
        buffer: require.resolve("buffer"),
      },
    },
  };

  if (productionMode) {
    result.plugins.push(
      new MiniCssExtractPlugin({
        filename: `${outputFilename}.css`,
        chunkFilename: `${outputFilename}.css`,
      }),
    );
  }

  return result;
};
