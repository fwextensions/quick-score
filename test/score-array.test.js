import {quickScore, createScorer, scoreArray} from "../src";
import Tabs from "./tabs";


function clone(
	obj)
{
	return JSON.parse(JSON.stringify(obj));
}


function freshTabs()
{
	return clone(Tabs);
}


function compareLowercase(
	a,
	b)
{
	const lcA = a.toLocaleLowerCase();
	const lcB = b.toLocaleLowerCase();

	return lcA == lcB ? 0 : lcA < lcB ? -1 : 1;
}


describe("scoreArray() tests", function() {
	const Strings = ["thought", "giraffe", "GitHub", "hello, Garth"];

	test("Basic scoreArray() test", () => {
		const strings = clone(Strings);
		const results = scoreArray(strings, "gh");

		expect(results[0].string).toBe("GitHub");
		expect(results[0].matches.string).toEqual([[0, 1], [3, 4]]);
		expect(results[0].score).toEqual(results[0].scores.string);
		expect(results[results.length - 1].score).toBe(0);
	});


	test("Create scoreArray() equivalent", () => {
		const qsScorer = createScorer(null, quickScore);
		const query = "qk";

		expect(qsScorer(clone(Strings), query)).toEqual(scoreArray(clone(Strings), query));
	});
});


describe("Tabs scoring", function() {
	const score = createScorer(["title", "url"]);
	const tabs = freshTabs();

		// the tabs array will be reused after the first call adds the score, etc.
		// keys to each item
	test.each([
		["qk", 6, "QuicKey – The quick tab switcher - Chrome Web Store", "title"],
		["dean", 11, "Bufala Negra – Garden & Gun", "url"],
		["face", 10, "Facebook", "title"]
	])('Score Tabs array for "%s"', (query, matchCount, firstTitle, scoreKey) => {
		const results = score(tabs, query);
		const nonmatches = results.filter(({score}) => score == 0);
		const nonmatchingTitles = nonmatches.map(({title}) => title);

		expect(results.length).toBe(Tabs.length);
		expect(Tabs.length - nonmatches.length).toBe(matchCount);
		expect(results[0].title).toBe(firstTitle);
		expect(results[0].scoreKey).toBe(scoreKey);

			// make sure the 0-scored objects are sorted case-insensitively on their titles
		expect([].concat(nonmatchingTitles).sort(compareLowercase)).toEqual(nonmatchingTitles);
	});
});


describe("Configured keys", function() {
	test("Per-key scorer", () => {
		const score = createScorer([
			{
				key: "title",
				scorer: () => 1
			},
			{
				key: "url",
				scorer: () => 0
			}
		]);
		const results = score(freshTabs(), "qk");

			// since all the scores are the same, the results should be alphabetized
		expect(results[0].title).toBe("Best Practices - Sharing");
		expect(results[0].scores.title).toBe(1);
		expect(results[0].scores.url).toBe(0);
	});
});