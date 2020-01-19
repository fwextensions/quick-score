import {quickScore} from "../src/quick-score";
import {QuicksilverConfig} from "../src/config";
import {Range} from "../src/range";


const MaxDifference = .00001;
const ScoreTestTitle = 'quickScore("%s", "%s")';
const HitsTestTitle = 'quickScore("%s", "%s", [])';


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
	expect(quickScore(string, query, undefined, undefined, undefined,
		QuicksilverConfig)).toBeNearly(expected, maxDifference);
}


describe("Quicksilver short string", () => {
	const str = "Test string";

	test.each([
		[str, "t", 0.90909],
		[str, "ts", 0.88182],
		[str, "te", 0.91818],
		[str, "tet", 0.89091],
		[str, "str", 0.91818],
		[str, "tstr", 0.93182],
		[str, "ng", 0.59091]
	])(ScoreTestTitle, scoreNearly);
});


describe("Quicksilver long string", () => {
	const str = "This is a really long test string for testing";

	test.each([
		[str, "t", 0.90222],
		[str, "ts", 0.88666],
		[str, "te", 0.80777],
		[str, "tet", 0.80111],
		[str, "str", 0.78555],
		[str, "tstr", 0.78889],
		[str, "testi", 0.74000],
		[str, "for", 0.75888],
		[str, "ng", 0.73556]
	])(ScoreTestTitle, scoreNearly);
});


describe("Quicksilver hit indices", function() {
	const str = "This excellent string tells us an interesting story";
	const strRange = new Range(0, 27); //  ^--- range ends here initially
	const abbr = "test";
	const hits = [];

	afterEach(() => {
		hits.length = 0;
		strRange.length += 4;
	});

	test.each([
		[str, abbr, 0.90185, [[0, 1], [5, 6], [15, 17]]],
		[str, abbr, 0.90161, [[0, 1], [5, 6], [15, 17]]],
		[str, abbr, 0.90143, [[0, 1], [5, 6], [15, 17]]],
		[str, abbr, 0.72949, [[22, 24], [26, 27], [36, 37]]],
		[str, abbr, 0.69884, [[22, 24], [40, 42]]],
		[str, abbr, 0.71595, [[22, 24], [40, 42]]],
		[str, abbr, 0.73039, [[22, 24], [40, 42]]]
	])(HitsTestTitle, (string, query, expectedScore, expectedHits) => {
		expect(quickScore(string, query, hits, undefined, undefined,
			QuicksilverConfig, strRange)).toBeNearly(expectedScore, MaxDifference);
		expect(hits).toEqual(expectedHits);
	});
});


describe("Match indices", function() {
	test.each([
			// the first test ensures that hits from early partial matches don't
			// linger in the matches array
		["This excellent string tells us an intes foo bar baz", "test",
			0.76961, [[22, 24], [26, 27], [36, 37]]],
		["This excellent string tells us an interesting story", "test",
			0.73039, [[22, 24], [40, 42]]],
			// v0.0.5 was incorrectly throwing away earlier matches when a zero
			// remainingScore was found, so the match indices were wrong.  this
			// test verifies that the right indices are returned.
		["https://raw.githubusercontent.com/gaearon/react-hot-loader/master/README.md", "release",
			0.76333, [[42, 44], [52, 53], [56, 57], [60, 62], [63, 64]]]
	])(HitsTestTitle, (string, query, expectedScore, expectedHits) => {
		const hits = [];

		expect(quickScore(string, query, hits, undefined, undefined,
			QuicksilverConfig)).toBeNearly(expectedScore, MaxDifference);
		expect(hits).toEqual(expectedHits);
	});
});


describe("Uppercase matches", function() {
	test.each([
		["QuicKey", "qk", 0.90714],
		["WhatIsQuicKey?", "qk", 0.76071],
		["QuicKey", "QuicKey", 1],
		["quickly", "qk", 0.75714]
	])(ScoreTestTitle, scoreNearly);
});


describe("Word separator matches", function() {
	test.each([
		["react-hot-loader", "rhl", 0.91250],
		["are there walls?", "rhl", 0.66875]
	])(ScoreTestTitle, scoreNearly);
});


describe("Zero scores", function() {
	test.each([
		["foo", "foobar", 0],
		["", "foobar", 0],
		[undefined, undefined, 0],
		["foobar", "", 0]
	])(ScoreTestTitle, (string, query, expectedScore) => {
		expect(quickScore(string, query)).toBe(expectedScore);
	});

		// do the same test with the QuicksilverConfig, which returns .9 for
		// empty queries
	test.each([
		["foo", "foobar", 0],
		["", "foobar", 0],
		[undefined, undefined, .9],
		["foobar", "", .9]
	])(ScoreTestTitle, (string, query, expectedScore) => {
		expect(quickScore(string, query, undefined, undefined, undefined,
			QuicksilverConfig)).toBe(expectedScore);
	});
});


describe("Search ranges", function() {
	test.each([
		["bar", "bar", new Range(0, 3), 1],
		["bar", "bar", new Range(1, 3), 0]
	])('quickScore("%s", "%s", null, QuicksilverConfig, %s)', (string, query, range, expectedScore) => {
		expect(quickScore(string, query, undefined, undefined, undefined,
			QuicksilverConfig, range)).toBe(expectedScore);
	});
});


// these older scores, from not dividing the reduction of the remaining score
// by half, match what the old NS Quicksilver code returns.  the scores were
// changed in TestQSSense.m in this commit:
// https://github.com/quicksilver/Quicksilver/commit/0f2b4043fafbfc4b1263b7807504eb1b3baaeab8#diff-86c92ca75387e03f87312001fe115fb9
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


// these tests worked when we changed quick-score.js to behave like QSSense.m as
// of 2018-07-25, which had some subtle bugs.  the scores and hit arrays will no
// longer exactly match, now that we've changed the code back to remove the bugs.
/*
describe("Buggy Quicksilver short string", () => {
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

describe("Buggy Quicksilver long string", () => {
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

describe("Buggy Quicksilver hitmask", function() {
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

			// to simulate the bug in TestQSSense.m where the NSMutableIndexSet
			// doesn't get reset after each test, we add each hit to a Set, so
			// it accumulates just one instance of each index
		hits.forEach(hit => {
			hitsSet.add(hit);
		});
		expect(Array.from(hitsSet).sort(sortNumbers)).toEqual(expectedHits);
	});
});
*/
