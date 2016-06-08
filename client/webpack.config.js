const autoprefixer = require('autoprefixer')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
var WebpackStrip = require('strip-loader')
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
var pkg = require('./package.json')

const TARGET = process.env.npm_lifecycle_event
const PATHS = {
  src: path.join(__dirname, 'src'),
  build: path.join(__dirname, 'build'),
  config: path.join(__dirname, 'config'),
  static: path.join(__dirname, 'static')
}

var common = {
  entry: {
    app: [
      'font-awesome-loader',
      'bootstrap-loader',
      PATHS.src
    ],
    vendor: Object.keys(pkg.dependencies)
  },
  output: {
    path: PATHS.build,
    publicPath: '/',
    filename: 'app.min-[hash:6].js'
  },
  resolve: {
    alias: {
      app: PATHS.src,
      config: PATHS.config
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/templates/index.jade',
      inject: 'body'
    }),
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.min-[hash:6].js'),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      _: 'lodash'
    })
  ],
  module: {
    loaders: [
      {
        test: /\.jade$/,
        loader: 'jade'
      },
      {
        test: /\.css$/,
        loaders: ['style', 'css']
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass']
      },
      {
        test: /\.(ttf|eot|svg|woff|woff2)(\?[\s\S]+)?$/,
        loader: 'file?name=fonts/[name].[ext]'
      }
    ]
  },
  postcss: [
    autoprefixer
  ]
}

if (TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    devServer: {
      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true,
      stats: 'errors-only',
      host: process.env.HOST,
      port: process.env.FRONTEND_PORT,
      contentBase: PATHS.static
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ],
    devtool: 'eval-source-map'
  })
}

if (TARGET === 'build' || TARGET === 'stats') {
  module.exports = merge(common, {
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      }),
      new webpack.optimize.DedupePlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"production"'
      }),
      new CleanWebpackPlugin([PATHS.build])
    ],

    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: WebpackStrip.loader('console.log')
        }
      ]
    }
  })
}
