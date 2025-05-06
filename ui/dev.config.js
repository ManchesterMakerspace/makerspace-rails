const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = env => ({
  mode: "development",
  entry: ["@babel/polyfill", "./src/app/main.tsx"],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "makerspace-react.js",
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|svg)$/,
        loader: "url-loader"
      },
      {
        test: /\.(html)$/,
        use: {
          loader: "html-loader",
          options: {
            minimize: true,
            removeAttributeQuotes: false,
            caseSensitive: true,
            customAttrSurround: [[/#/, /(?:)/], [/\*/, /(?:)/], [/\[?\(?/, /(?:)/]],
            customAttrAssign: [/\)?\]?=/]
          }
        }
      },
      {
        test: /\.tsx?$/,
        enforce: "pre",
        exclude: /(node_modules)/,
        use: [
          { loader: "cache-loader" },
          {
            loader: "tslint-loader",
            options: {
              typeCheck: false,
              emitErrors: true
            }
          }
        ]
      },
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /(node_modules)/,
        use: [
          { loader: "cache-loader" },
          { loader: "babel-loader" }
        ]
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
      }
    ]
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin()],
    extensions: [
      ".ts",
      ".tsx",
      ".js",
      ".jsx",
      ".scss",
      ".sass",
      ".less",
      ".png",
      ".woff",
      ".woff2",
      ".eot",
      ".ttf",
      ".svg",
      ".ico"
    ],
    modules: ["src", "node_modules"]
  },
  performance: {
    maxAssetSize: 200000,
    maxEntrypointSize: 400000
  },
  devtool: "source-map",
  context: __dirname,
  target: "web",
  devServer: {
    hot: true,
    disableHostCheck: true,
    historyApiFallback: true,
    proxy: {
      "/api": "http://localhost:3002"
    },
    https: false,
    port: 3035,
    inline: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    watchOptions: { ignored: /node_modules/ }
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      checkSyntacticErrors: true,
      async: false
    }),
    new webpack.NamedModulesPlugin(),
    new MiniCssExtractPlugin({
      filename: `makerspace-react.css`
    }),
    new HtmlWebPackPlugin({
      template: "./src/assets/index.html",
      filename: "./index.html"
    }),
    new CopyWebpackPlugin([{ from: "src/assets/favicon.png", to: "favicon.png" }]),
    new webpack.EnvironmentPlugin({
      BILLING_ENABLED: true,
      BASE_URL: (env && env.BASE_URL) || ""
    }),
    ...process.env.ANALYZE ? [new BundleAnalyzerPlugin()] : []
  ]
});
