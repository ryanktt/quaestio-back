const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const slsw = require('serverless-webpack');
const path = require('path');
const isLocal = slsw.lib.webpack.isLocal;

class CompilationLoggerPlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap('CompilationLoggerPlugin', () => {
			console.log(`Compilation Done ${new Date().toLocaleString()}`);
		});
	}
}

module.exports = {
	target: 'node14',
	context: __dirname,
	entry: slsw.lib.entries,
	mode: isLocal ? 'development' : 'production',
	devtool: isLocal ? 'eval' : 'source-map',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				exclude: [
					[
						path.resolve(__dirname, 'node_modules'),
						path.resolve(__dirname, '.serverless'),
						path.resolve(__dirname, '.webpack'),
						path.resolve(__dirname, '.build'),
					],
				],
			},
		],
	},
	externals: [nodeExternals()],
	plugins: [new CompilationLoggerPlugin()],
	optimization: { minimize: false },
	resolve: {
		plugins: [new TsconfigPathsPlugin({ configFile: 'tsconfig.json' })],
		extensions: ['.ts', '.js', '.tsx'],
	},
	output: {
		filename: '[name].js',
		path: path.join(__dirname, '.webpack'),
		library: {
			type: 'commonjs',
		},
	},
};
