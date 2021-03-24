const path = require("path")

module.exports = {
    target: "node",
    mode: 'production',
    entry: {
        index: path.resolve(__dirname, "src", "index.js")
    },
    output: {
        path: path.resolve(__dirname, "dist"),
    },

    optimization: {
        splitChunks: { chunks: "all" }
    },

    module: {
        rules: [
            {
                test: /\.js/,
                exclude: /(node_modules)/,
                use: ["babel-loader"]
            }
        ]
    },
    resolve: {
        extensions: ['.js'],
    },
 }