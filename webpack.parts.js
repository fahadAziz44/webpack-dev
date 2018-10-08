const ErrorOverlayPlugin = require('error-overlay-webpack-plugin')
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const PurifyCSSPlugin = require("purifycss-webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const webpack = require("webpack");
const GitRevisionPlugin = require("git-revision-webpack-plugin");
const UglifyWebpackPlugin = require("uglifyjs-webpack-plugin");
const OptimizeJsPlugin = require("optimize-js-plugin");


exports.setFreeVariable = (key, value) => {
  const env = {};
  env[key] = value;

  return {
    plugins: [new webpack.EnvironmentPlugin(env)],
  };
};

exports.optimizeJsThroughEagerFuncs = ({sourceMap = false}) => {
  return {
    plugins: [
      new OptimizeJsPlugin({
        sourceMap,
      }),
    ]
  }
};

exports.minifyJavaScript = ({dropConsole, sourceMap}) => ({
  optimization: {
    minimizer: [ new UglifyWebpackPlugin({ uglifyOptions: { compress: { drop_console: dropConsole } }, sourceMap }) ],
  },
});


exports.attachRevision = () => ({
  plugins: [
    new webpack.BannerPlugin({
      banner: new GitRevisionPlugin().version(),
    }),
  ],
});

exports.clean = path => ({
  plugins: [new CleanWebpackPlugin([path])],
});

exports.loadJavaScript = ({ include, exclude } = {}) => ({
    module: {
      rules: [
        {
          test: /\.js$/,
          include,
          exclude,
          use: "babel-loader",
        },
      ],
    },
});

exports.loadImages = ({ include, exclude, options } = {}) => ({
    module: {
      rules: [
        {
          test: /\.(png|jpg)$/,
          include,
          exclude,
          use: {
            loader: "url-loader",
            options,
          },
        },
      ],
    },
});

exports.purifyCSS = ({ paths }) => ({
  plugins: [new PurifyCSSPlugin({ paths })],
});

exports.autoprefix = () => ({
    loader: "postcss-loader",
    options: {
      plugins: () => [require("autoprefixer")(), require("precss")],
    },
});

exports.generateSourceMaps = ({ type }) => ({
    devtool: type,
});

exports.devServer = ({ host, port } = {}) => ({
    devServer: {
        stats: "errors-only",
        host, // Defaults to `localhost`
        port, // Defaults to 8080
        open: true,
        overlay: true,
        // Don't refresh if hot loading fails. Good while
        // implementing the client interface.
        hotOnly: true,
        // For friendly-errors-webpack-plugin we have to quiet errors 
        quiet: true,
    },
    plugins: [
        new ErrorOverlayPlugin(),
        new FriendlyErrorsWebpackPlugin(),
        new webpack.HotModuleReplacementPlugin(),
    ]
});


// Development
exports.loadCSS = ({ include, exclude } = {}) => ({
    module: {
        rules: [
            {
                test: /\.css$/,
                include,
                exclude,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                      loader: "postcss-loader",
                      options: {
                      plugins: () => ([
                          require("autoprefixer"),
                          require("precss"),
                      ]),
                      },
                    },
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                        plugins: () => ([
                            require("autoprefixer"),
                            require("precss"),
                        ]),
                        },
                    },
                    "sass-loader"
                ],
            },
        ],
    },
});

// Production
exports.extractCSS = ({ include, exclude, use = [] }) => {
  // Output extracted CSS to a file
  const plugin = new MiniCssExtractPlugin({
    filename: "[name].[contenthash].css",
  });

  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          include,
          exclude,

          use: [
            MiniCssExtractPlugin.loader,
          ].concat(use),
        },
        {
            test: /\.scss$/,
            include,
            exclude,

            use: [
                MiniCssExtractPlugin.loader,
              ].concat(use).concat("sass-loader")
        },
      ],
    },
    plugins: [plugin],
  };
};