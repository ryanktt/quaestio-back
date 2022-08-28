const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
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
	entry: slsw.lib.entries,
	mode: isLocal ? 'development' : 'production',
	devtool: isLocal ? 'eval-source-map' : 'source-map',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				include: [path.resolve(__dirname, 'src')],
			},
		],
	},
	externals: [nodeExternals()],
	plugins: [new NodePolyfillPlugin(), new CompilationLoggerPlugin()],
	resolve: {
		plugins: [new TsconfigPathsPlugin({ configFile: 'tsconfig.json' })],
		extensions: ['.ts', '.js', '.tsx'],
	},
	output: {
		filename: '[name].js',
		path: path.join(__dirname, '.build'),
		library: {
			type: 'commonjs',
		},
	},
};
