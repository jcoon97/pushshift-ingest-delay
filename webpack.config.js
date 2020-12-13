const CopyPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");

module.exports = {
    context: path.resolve(__dirname, "src"),
    entry: "./app.ts",
    module: {
        rules: [
            {
                test: /\.(css|html)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]"
                        }
                    }
                ]
            },
            {
                test: /.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ ".ts", ".js" ]
    },
    output: {
        filename: "app.bundle.js",
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    context: path.resolve(__dirname, "src"),
                    from: "./*.{css,html}"
                }
            ]
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [ new CssMinimizerPlugin(), new HtmlMinimizerPlugin(), new TerserPlugin() ]
    },
    devServer: {
        compress: true,
        open: true
    }
};
