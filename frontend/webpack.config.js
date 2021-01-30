const webpack = require("webpack");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
    entry: path.join(__dirname, "./src/main.tsx"),
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: ["babel-loader"],
            },
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre",
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.(wav|png|svg|jpg|jpeg|gif)$/i,
                use: ["file-loader"],
            }
        ],
    },
    resolve: {
        extensions: ["*", ".ts", ".tsx", ".js", ".jsx"],
        plugins: [new TsconfigPathsPlugin({ configFile: path.join(__dirname, "./tsconfig.json") })],
    },
    output: {
        path: path.join(__dirname, "../static/build"),
        publicPath: "/",
        filename: "index.js",
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({ filename: "lobby.html", template: path.join(__dirname, "src/lobby.html") }),
    ],
    devtool: "source-map",
};
