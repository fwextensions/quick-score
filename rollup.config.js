import babel from "rollup-plugin-babel";
import minify from "rollup-plugin-babel-minify";


const Input = "src/index.js";
const OutputESM = (dir) => ({
	file: `${dir}/index.esm.js`,
	format: "esm"
});
const OutputUMD = (dir, minified) => ({
	file: `${dir}/quick-score${minified ? ".min" : ""}.js`,
	format: "umd",
	exports: "named",
	name: "quickScore"
});
const BabelConfig = {
	exclude: "**/node_modules/**",
		// tell babel to not transform modules, so that rollup can do it
	presets: [
		["env", {
			modules: false
		}]
	]
};


export default [
	{
		input: Input,
		output: OutputESM("lib")
	},
	{
		input: Input,
		output: OutputUMD("lib")
	},
	{
		input: Input,
		output: OutputUMD("dist"),
		plugins: [
			babel(BabelConfig)
		]
	},
	{
		input: Input,
		output: OutputUMD("dist", true),
		plugins: [
			babel(BabelConfig),
			minify({
				comments: false
			})
		]
	}
];
