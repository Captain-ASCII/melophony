const path = require("path");
const webpack = require("webpack");
const fs = require("fs");

module.exports = {
    entry: "./src/index.js",
    mode: "development",
    module: {
    rules: [
        {
            test: /\.(js|jsx)$/,
            exclude: /(node_modules|bower_components)/,
            loader: "babel-loader",
            options: { presets: ["@babel/env"] }
        },
        {
            test: /\.css$/,
            use: ["style-loader", "css-loader"]
        }
    ]
    },
    resolve: { extensions: ["*", ".js", ".jsx"] },
    output: {
        path: path.resolve(__dirname, "dist/"),
        publicPath: "/dist/",
        filename: "bundle.js"
    },
    devServer: {
        historyApiFallback: true,
        https: {
            key: fs.readFileSync("/etc/letsencrypt/live/melophony.ddns.net/privkey.pem"),
            cert: fs.readFileSync("/etc/letsencrypt/live/melophony.ddns.net/cert.pem"),
            ca: fs.readFileSync("/etc/letsencrypt/live/melophony.ddns.net/chain.pem"),
        },
        contentBase: path.join(__dirname, "public/"),
        publicPath: "https://localhost:1951/dist/",
        host: "0.0.0.0",
        port: 1951,
        hotOnly: true
    },
    plugins: [new webpack.HotModuleReplacementPlugin()]
};