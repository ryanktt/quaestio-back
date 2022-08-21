const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { HotModuleReplacementPlugin } = require('webpack');
var nodeExternals = require('webpack-node-externals');
const path = require('path');

const isDev = (process.env.STAGE = 'dev' || process.env.STAGE === 'local');

module.exports = () => {
	return {
		target: 'node14',
		context: __dirname,
		entry: [...(isDev ? ['webpack/hot/poll?100'] : []), './src/bootstrap/main.ts'],
		mode: isDev ? 'development' : 'production',
		devtool: 'eval-source-map',

		module: {
			rules: [
				{
					test: /\.tsx?$/,
					loader: 'ts-loader',
					include: [path.resolve(__dirname, 'src')],
				},
			],
		},
		externals: [nodeExternals(isDev ? { allowlist: ['webpack/hot/poll?100'] } : {})],
		resolve: {
			plugins: [new TsconfigPathsPlugin({ configFile: 'tsconfig.json' })],
			extensions: ['.ts', '.js', '.tsx'],
		},
		plugins: [
			...(isDev
				? [new CircularDependencyPlugin(), new HotModuleReplacementPlugin(), new ForkTsCheckerWebpackPlugin()]
				: []),
			new NodePolyfillPlugin(),

			new RunScriptWebpackPlugin({ name: 'main.js', autoRestart: false }),
		],
		output: {
			filename: 'main.js',
			library: {
				type: 'commonjs',
			},
		},
	};
};
