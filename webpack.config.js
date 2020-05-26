const HtmlWebPackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/js/index.jsx',
	module: {
		rules: [{
			test: /\.jsx?$/,
			exclude: /node_modules/,
			use: {
				loader: 'babel-loader'
			}
		}, {
			test: /\.html$/,
			use: [{
				loader: 'html-loader'
			}]
		}, {
			test: /\.css$/,
			use: ['style-loader', 'css-loader']
		}]
	},
	plugins: [
		new HtmlWebPackPlugin({
			template: './src/index.html',
			filename: './index.html'
		})
	],
	resolve: {
		extensions: ['.js', '.jsx']
	}
};