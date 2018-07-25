const score = require("../src/quick-score");
const Range = require("../src/range");


const MaxDifference = .00001;


expect.extend({
	toBeNearly(
		received,
		argument,
		maxDifference = 0.1)
	{
		const pass = Math.abs(received - argument) <= maxDifference;

		if (pass) {
			return {
				message: () => `expected ${received} not to be within ${maxDifference} of ${argument}`,
				pass: true
			};
		} else {
			return {
				message: () => `expected ${received} to be within ${maxDifference} of ${argument}`,
				pass: false
			};
		}
	}
});


function scoreNearly(
	string,
	query,
	expected,
	maxDifference = MaxDifference)
{
		// the built-in .toBeCloseTo() rounds the result, so .18181818181818182
		// rounds to .18182, which is not close to .18181 in 5 digits.  so use
		// the helper defined above to check that the result is within .00001 of
		// expected, which is what the Quicksilver tests look for.
	expect(score(string, query)).toBeNearly(expected, maxDifference);
}


describe("Quicksilver short string", () => {
	const string = "Test string";

	test.each([
		[string, "t", 0.90909],
		[string, "ts", 0.92727],
		[string, "te", 0.91818],
		[string, "tet", 0.93636],
		[string, "str", 0.91818],
		[string, "tstr", 0.79090],
		[string, "ng", 0.63636]
	])("score('%s', '%s')", scoreNearly);
});

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
	])("score('%s', '%s')", scoreNearly);
});

describe("Quicksilver hitmask", function() {
	const str = "This excellent string tells us an interesting story";
	const strRange = new Range(0, 27); //  ^--- range ends here initially
	const abbr = "test";
	const hits = [];
	const sortNumbers = (a, b) => a - b;
	const hitsSet = new Set();

	afterEach(() => {
		hits.length = 0;
		strRange.length += 4;
	});

	test.each([
		[str, abbr, 0.74074, [0, 5, 15, 16, 22, 23]],
		[str, abbr, 0.76129, [0, 5, 15, 16, 22, 23, 26]],
		[str, abbr, 0.77714, [0, 5, 15, 16, 22, 23, 26]],
		[str, abbr, 0.74230, [0, 5, 15, 16, 22, 23, 26, 36]],
		[str, abbr, 0.69883, [0, 5, 15, 16, 22, 23, 26, 36, 40, 41]],
		[str, abbr, 0.71595, [0, 5, 15, 16, 22, 23, 26, 36, 40, 41]],
		[str, abbr, 0.73039, [0, 5, 15, 16, 22, 23, 26, 36, 40, 41]]
	])("score('%s', '%s', '%f', '%o')", (string, query, expectedScore, expectedHits) => {
		expect(score(string, query, hits, true, strRange)).toBeNearly(expectedScore, MaxDifference);
//		hits.sort(sortNumbers);
//		expect(hits).toEqual(expectedHits);

			// to simulate the bug in TestQSSense.m where the NSMutableIndexSet
			// doesn't get reset after each test, we add each hit to a Set, so
			// it accumulates just one instance of each index
		hits.forEach(hit => {
			hitsSet.add(hit);
		});
		expect(Array.from(hitsSet).sort(sortNumbers)).toEqual(expectedHits);
	});
});

// these older scores, from not dividing the reduction of the remaining score
// by half, match what the old NS Quicksilver code returns

/*
describe("Old NSString Quicksilver short string", () => {
	const str = "Test string";

	test.each([
		[str, "t", 0.90909],
		[str, "ts", 0.83636],
		[str, "te", 0.91818],
		[str, "tet", 0.84545],
		[str, "str", 0.91818],
		[str, "tstr", 0.93181],
		[str, "ng", 0.18181]
	])("score('%s', '%s')", scoreNearly);
});

describe("Old NSString Quicksilver long string", () => {
	const str = "This is a really long test string for testing";

	test.each([
		[str, "t", 0.90222],
		[str, "ts", 0.86444],
		[str, "te", 0.80777],
		[str, "tet", 0.79000],
		[str, "str", 0.78555],
		[str, "tstr", 0.78888],
		[str, "testi", 0.74000],
		[str, "for", 0.75888],
		[str, "ng", 0.52444]
	])("score('%s', '%s')", scoreNearly);
});
*/

/*
describe("Uppercase matches", function() {
	test.each([
		["QuicKey", "qk", .9071428571428573],
		["WhatIsQuicKey?", "qk", .7607142857142856],
		["QuicKey", "QuicKey", 1],
		["quickly", "qk", .5428571428571428]
	])("score('%s', '%s')", scoreNearly);
});

describe("Word separator matches", function() {
	test.each([
		["react-hot-loader", "rhl", .9124999999999999],
		["are there walls?", "rhl", .35625]
	])("score('%s', '%s')", scoreNearly);
});

describe("Hit indices", function() {
	test.each([
			// the first test ensures that hits from early partial matches don't
			// linger in the hits array
		["This excellent string tells us an intes foo bar baz", "test",
			0.6617647058823535, [22, 23, 26, 36]],
		["This excellent string tells us an interesting story", "test",
			0.5735294117647064, [22, 23, 40, 41]]
	])("score('%s', '%s')", (string, query, expectedScore, expectedHits) => {
		const hits = [];

		expect(score(string, query, hits)).toBeNearly(expectedScore, MaxDifference);
		expect(hits).toEqual(expectedHits);
	});
});
*/
