const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
  },
  mode: "development",
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
        test: /\.(png|jpg|jpeg|gif|svg)$/i,  // Match image file extensions
        type: "asset/resource", // Replaces file-loader in Webpack 5
      },
      {
        test: /\.pdf$/,
        type: "asset/resource", // Replaces file-loader in Webpack 5
        generator: {
          filename: "assets/[name][ext]" // Ensures PDFs are output to the assets folder
        }
      },
      {
        test: /\.tsx?$/,                // Add ts and tsx support
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: [".tsx", ".ts", ".js"], // Add .ts and .tsx to the list of resolvable extensions
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
  devServer: {
    static: "./dist",
    port: 3000,
  },
  
};