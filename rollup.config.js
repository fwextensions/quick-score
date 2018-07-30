import babel from "rollup-plugin-babel";


const Input = "src/index.js";
const OutputESM = (dir) => ({
	file: `${dir}/index.esm.js`,
	format: "esm"
});
const OutputUMD = (dir) => ({
	file: `${dir}/index.js`,
	format: "umd",
	exports: "named",
	name: "quickScore"
});
const BabelConfig = {
	exclude: "**/node_modules/**",
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
	}
];
