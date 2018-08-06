const ErrorOverlayPlugin = require('error-overlay-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

exports.devServer = ({ host, port } = {}) => ({
    devServer: {
        stats: "errors-only",
        host, // Defaults to `localhost`
        port, // Defaults to 8080
        open: true,
        overlay: true,
        // For friendly-errors-webpack-plugin we have to quiet errors 
        quiet: true,
    },
    plugins: [
        new ErrorOverlayPlugin(),
        new FriendlyErrorsWebpackPlugin()
      ]
});