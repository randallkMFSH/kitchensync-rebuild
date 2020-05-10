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
    plugins: [new webpack.HotModuleReplacementPlugin(), new HtmlWebpackPlugin({})],
    devtool: "source-map",
};
