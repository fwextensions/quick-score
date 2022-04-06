import babel from "rollup-plugin-babel";
import minify from "rollup-plugin-babel-minify";
import dts from "rollup-plugin-dts";


const Input = "src/index.js";
const OutputESM = (dir, filename, minified) => ({
	file: `${dir}/${filename ? filename : "index"}.esm${minified ? ".min" : ""}.js`,
	format: "esm"
});
const OutputUMD = (dir, filename, minified) => ({
	file: `${dir}/${filename ? filename : "quick-score"}${minified ? ".min" : ""}.js`,
	format: "umd",
	exports: "named",
	name: "quickScore"
});
const BabelConfig = {
	exclude: "**/node_modules/**",
		// tell babel to not transform modules, so that rollup can do it
	presets: [
		["@babel/preset-env", { modules: false }]
	]
};


export default [
	{
		input: Input,
		output: OutputESM("lib")
	},
	{
		input: Input,
		output: OutputUMD("lib", "index")
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
		output: OutputUMD("dist", "", true),
		plugins: [
			babel(BabelConfig),
			minify({
				comments: false
			})
		]
	},
	{
		input: Input,
		output: OutputESM("dist", "quick-score", true),
		plugins: [
			babel(BabelConfig),
			minify({
				comments: false
			})
		]
	},
	{
		// path to your declaration files root
		input: "./dist-dts/index.d.ts",
		output: [
			{ file: "dist/index.d.ts", format: "es" },
			{ file: "lib/index.d.ts", format: "es" }
		],
		plugins: [dts()]
	}
];
