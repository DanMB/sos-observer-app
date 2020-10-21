const { resolve } = require('path');
const { lstatSync, readdirSync } = require('fs')
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackInlineSVGPlugin = require('html-webpack-inline-svg-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');


var nodeModules = {
  path: 'commonjs path',
    fs: 'commonjs fs',
};
readdirSync('node_modules').filter(x => {
  return ['.bin'].indexOf(x) === -1;
}).forEach(mod => {
  nodeModules[mod] = 'commonjs ' + mod;
});


const dir = './build';


var config = { // Default Configuration
  externals: nodeModules,

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          }
        }
      })
    ],
  }
};

var mainConfig = {
  ...config,
  name: 'main',

  entry: './src/main.js',

  output: {
    path: resolve(__dirname, dir),
    filename: 'main.js'
  },

  plugins: [
    new CleanWebpackPlugin()
  ]
};


const renderBase = './src/';
const renderFile = 'script.js';

var renderEntries = {};
readdirSync(renderBase).forEach(name => {
  let folder = renderBase + name + '/';
  if(lstatSync(folder).isDirectory() && readdirSync(folder).includes(renderFile)) {
    renderEntries[name] = folder + renderFile;
  }
});

var renderConfig = {
  ...config,
  name: 'render',

  entry: renderEntries,

  module: {
    rules: [
      {
        test: /\.svg$/,
        use: {
          loader: 'svg-url-loader'
        }
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [renderBase],
                outputStyle: 'compressed',
              },
            }
          },
        ],
      }
    ]
  },

  plugins: [

    ...Object.keys(renderEntries).map(name => new HtmlWebpackPlugin({
      chunks: [name],
      filename: name + '.html',
      template: renderBase + name + '/index.html',
      minify: {
        collapseWhitespace: true
      }
    })),
    
    new HtmlWebpackInlineSVGPlugin({
      runPreEmit: true,
      svgoConfig: [
        {
          inlineStyles: false
        }, 
        {
          convertStyleToAttrs: false
        }, 
        // {
        //   removeStyleElement: false
        // }, 
        // {
        //   minifyStyle: false
        // },
        // {
        //   cleanupIDs: false
        // },
        // {
        //   removeUselessStrokeAndFill: false
        // }
      ]
    }),
    
    new CopyWebpackPlugin({
      patterns: [
        resolve(__dirname, 'package.json')
      ],
    })
  ],

  output: {
    path: resolve(__dirname, dir),
    filename: '[name].js',
  },
};

module.exports = [
  mainConfig, renderConfig,
];