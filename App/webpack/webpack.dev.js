const common = require("./webpack.config.js");
const fs = require("fs");
const merge = require("webpack-merge");
const path = require("path");
const webpack = require("webpack");

module.exports = merge(common, {
    resolve: { extensions: ["*", ".js", ".jsx"] },
    devServer: {
        historyApiFallback: true,
        https: {
            key: fs.readFileSync("/etc/letsencrypt/live/melophony.ddns.net/privkey.pem"),
            cert: fs.readFileSync("/etc/letsencrypt/live/melophony.ddns.net/cert.pem"),
            ca: fs.readFileSync("/etc/letsencrypt/live/melophony.ddns.net/chain.pem"),
        },
        contentBase: path.join(__dirname, "..", "public/"),
        publicPath: "https://localhost:1951/dist/",
        port: 1951,
        hotOnly: true
    },
    plugins: [new webpack.HotModuleReplacementPlugin()]
});