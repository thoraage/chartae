const webpack = require('webpack');
const path = require('path');
module.exports = {
    entry: path.resolve(__dirname, 'app'),
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        filename: 'bundle.js'
    },
    devServer: {
        contentBase: path.resolve(__dirname, 'public')
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loaders: ['babel-loader'] },
            { test: /(\.css)$/, loaders: ['style-loader', 'css-loader'] },
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" }
        ]
    }
};
