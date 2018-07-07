const score = require("./quick-score");


const MaxDifference = .00001;


function scoreCloseTo(
	str,
	query,
	expected)
{
		// the built-in .toBeCloseTo() rounds the result, so .18181818181818182
		// rounds to .18182, which is not close to .18181 in 5 digits.  so check
		// that the result is within .00001 of expected, which is how the
		// Quicksilver tests do it.
	expect(Math.abs(score(str, query) - expected)).toBeLessThanOrEqual(MaxDifference);
}


describe("Quicksilver short string", () => {
	const str = "Test string";

	test.each([
		[str, "t", 0.90909],
		[str, "ts", 0.92727],
		[str, "te", 0.91818],
		[str, "tet", 0.93636],
		[str, "str", 0.91818],
		[str, "tstr", 0.79090],
		[str, "ng", 0.63636]
	])("score('%s', '%s')", scoreCloseTo);
});

describe("Quicksilver short string, OLD results", () => {
	const str = "Test string";

	test.each([
		[str, "t", 0.90909],
		[str, "ts", 0.83636],
		[str, "te", 0.91818],
		[str, "tet", 0.84545],
		[str, "str", 0.91818],
		[str, "tstr", 0.93181],
		[str, "ng", 0.18181]
	])("score('%s', '%s')", scoreCloseTo);
});

/*
describe("Quicksilver long string", () => {
	const str = "This is a really long test string for testing";

	test.each([
		[str, "t", 0.90222],
		[str, "ts", 0.88666],
		[str, "te", 0.80777],
		[str, "tet", 0.81222],
		[str, "str", 0.78555],
		[str, "tstr", 0.67777],
		[str, "testi", 0.74000],
		[str, "for", 0.75888],
		[str, "ng", 0.74666]
	])("score('%s', '%s')", scoreCloseTo);
});
*/
