/**
 * Webpack config script
 *
 * inputs as environment variables:
 * NODE_ENV: 'production' if production build
 * LEGACY_ONLY: truthy if build only legacy build
 */

// Register CoffeeScript for reading config from app.config.
require('coffee-script/register');

const path = require('path');
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// config values ----------
// system language.
let systemLanguage;
// publicPath.
let publicPath;
// whether to use legacy builds.
let legacyBuilds;
try {
  const config = require('../config/app.coffee');

  systemLanguage = config.language.value;
  publicPath = config.front.publicPath;
  legacyBuilds = config.front.legacyBuilds;
} catch (e) {
  console.error(
    `Error: '../config/app.coffee' does not exist. Prepare configuration file before building.`,
  );

  throw e;
}

const makeConfig = (isProduction, isLegacyBuild) => ({
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? undefined : 'eval-source-map',
  entry: './dist-esm/index.js',
  output: {
    library: 'JinrouFront',
    path: !isLegacyBuild
      ? path.join(__dirname, '..', 'client/static/front-assets/')
      : path.join(__dirname, '..', 'client/static/front-assets/legacy/'),
    publicPath: !isLegacyBuild ? publicPath : addPathSeg(publicPath, 'legacy'),
    crossOriginLoading: 'anonymous',
    // for production, include hash information.
    filename: isProduction ? 'bundle.[chunkhash].js' : 'bundle.js',
    chunkFilename: '[id].[chunkhash].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        rules: [
          {
            exclude: /node_modules/,
            use: ['source-map-loader'],
            enforce: 'pre',
          },
        ].concat(
          isLegacyBuild
            ? [
                {
                  loader: 'babel-loader',
                  options: {
                    cacheDirectory: true,
                    plugins: ['@babel/plugin-syntax-dynamic-import'],
                    presets: [
                      [
                        '@babel/preset-env',
                        {
                          targets: {
                            browsers: 'IE 11',
                          },
                          useBuiltIns: 'entry',
                          modules: false,
                        },
                      ],
                    ],
                  },
                },
              ]
            : [],
        ),
      },
      {
        test: /\.yaml$/,
        use: ['json-loader', 'yaml-loader'],
      },
      {
        test: /\.(?:pug|jade)$/,
        use: ['pug-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      EXTERNAL_SYSTEM_LANGUAGE: JSON.stringify(systemLanguage),
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: isProduction ? 'static' : 'server',
      openAnalyzer: !isProduction,
    }),
    new CopyWebpackPlugin([
      {
        from: 'build/feature-check.js',
        to: 'feature-check.[hash].js',
      },
    ]),
    new ManifestPlugin({
      map: file => {
        // remove hash from file name generated by CopyWebpackPlugin.
        if (/^feature-check\..*\.js$/.test(file.name)) {
          file.name = 'feature-check.js';
        }
        return file;
      },
    }),
  ],
  resolve: {
    alias: {
      '@fortawesome/fontawesome-free-solid$':
        '@fortawesome/fontawesome-free-solid/shakable.es.js',
      '@fortawesome/fontawesome-free-regular':
        '@fortawesome/fontawesome-free-regular/shakable.es.js',
      // if not legacy Mode, remove @babel/polyfill dependency.
      '@babel/polyfill': isLegacyBuild
        ? '@babel/polyfill'
        : path.join(__dirname, 'build/empty.js'),
    },
  },
});

const isProduction = process.env.NODE_ENV === 'production';

// Config for main build.
const mainConfig = makeConfig(isProduction, false);
// Config for legacy build.
const legacyConfig = makeConfig(isProduction, true);

module.exports = process.env.LEGACY_ONLY
  ? legacyConfig
  : isProduction && legacyBuilds
    ? [mainConfig, legacyConfig]
    : mainConfig;

/**
 * add a path segment to URL or path.
 */
function addPathSeg(path, seg) {
  if (/\/$/.test(path)) {
    return `${path}${seg}/`;
  } else {
    return `${path}/${seg}/`;
  }
}
