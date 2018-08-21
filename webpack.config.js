const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const path = require("path");
const glob = require("glob");

const parts = require("./webpack.parts");


const PATHS = {
  app: path.join(__dirname, "src"),
  build: path.join(__dirname, "dist"),
};

const commonConfig = merge([
  {
    output: {
      chunkFilename: "chunk.[id].js"
    }
  },
  {
    plugins: [
      new HtmlWebpackPlugin({
        title: "Webpack demo",
      })
    ],
  },
  parts.loadJavaScript({ include: PATHS.app }),

]);

const productionConfig = merge([
  parts.extractCSS({
    use: ["css-loader", parts.autoprefix()],
  }),
  
  parts.purifyCSS({
    paths: glob.sync(`${PATHS.app}/**/*.js`, { nodir: true }),
  }),
  
  parts.loadImages({
    options: {
      limit: 15000,
      name: "[name].[ext]",
    },
  }),
  
  parts.clean(PATHS.build),
  parts.attachRevision(),
  parts.minifyJavaScript({ dropConsole: true, sourceMap: false }),

  {
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "initial",
          },
        },
      },
    },
  },
  
  /* less precedence optimizations */
  parts.optimizeJsThroughEagerFuncs(),

]);


const stagingConfig = merge([
  productionConfig,
  parts.generateSourceMaps({ type: "eval-source-map" }),
  parts.minifyJavaScript({ dropConsole: false, sourceMap: true }),

  /* less precedence optimizations */
  parts.optimizeJsThroughEagerFuncs(true),

]);

const developmentConfig = merge([
  parts.devServer({
    host: process.env.HOST,
    port: process.env.PORT,
  }),
  parts.loadCSS(),
  parts.loadImages(),
  parts.generateSourceMaps({ type: "eval-source-map" }),
]);


module.exports = mode => {
  if (mode === "production") {
    return merge(commonConfig, productionConfig, { mode });
  } else if (mode === "staging") {
    return merge(commonConfig, stagingConfig, { mode: 'production' });
  }

  return merge(commonConfig, developmentConfig, { mode });
};