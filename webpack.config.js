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
      chunkFilename: "[name].[chunkhash].js",
      filename: "[name].[chunkhash].js",
    }
  },
  {
    plugins: [
      new HtmlWebpackPlugin({
        title: "Webpack configs",
      })
    ],
  },
  parts.loadJavaScript({ include: PATHS.app }),
  parts.setFreeVariable("HELLO", "hello from config"),

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
      name: "[name].[hash].[ext]",
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
      runtimeChunk: {
        name: "manifest",
      },
    },
    recordsPath: path.join(__dirname, "records.json"),
  },
  
  /* less precedence optimizations */
  parts.optimizeJsThroughEagerFuncs({}),

]);


const stagingConfig = merge([
  parts.extractCSS({
    use: [
      {
        loader: "css-loader",
        options: {
          sourceMap: true
        },
      },
      parts.autoprefix()
    ],
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
  {
    optimization: {
      splitChunks: {
        // chunks: 'initial',
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "initial",
          },
        },
      },
      runtimeChunk: {
        name: "manifest",
      },
    },
  },
   parts.generateSourceMaps({ type: "eval-source-map" }),
   parts.minifyJavaScript({ dropConsole: false, sourceMap: true }),

   /* less precedence optimizations */
   parts.optimizeJsThroughEagerFuncs({sourceMap: true}),

  // 

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