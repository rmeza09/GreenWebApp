const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: "./src/index.tsx",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: isProduction ? "[name].[contenthash].js" : "bundle.js",
      clean: true,
      publicPath: "/"
    },
    mode: isProduction ? "production" : "development",
    devtool: isProduction ? false : "eval-source-map",
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/i,
          type: "asset/resource",
        },
        {
          test: /\.pdf$/,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext]"
          }
        },
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },   
      ],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
      extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./public/index.html",
        filename: "index.html",
        inject: true,
      }),
    ],
    devServer: {
      static: "./build",
      port: 3000,
      historyApiFallback: true,
      hot: true,
    },
    optimization: isProduction ? {
      splitChunks: {
        chunks: 'all',
      },
    } : {},
  };
};