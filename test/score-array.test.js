import {createScorer, scoreArray} from "../src";
import Tabs from "./tabs";


function clone(
	obj)
{
	return JSON.parse(JSON.stringify(obj));
}


function compareLowercase(
	a,
	b)
{
	const lcA = a.toLocaleLowerCase();
	const lcB = b.toLocaleLowerCase();

	return lcA == lcB ? 0 : lcA < lcB ? -1 : 1;
}


test("Basic scoreArray() test", () => {
	const strings = ["thought", "giraffe", "GitHub", "hello, Garth"];
	const results = scoreArray(strings, "gh");

	expect(results[0].string).toBe("GitHub");
	expect(results[results.length - 1].score).toBe(0);
});


describe("Tabs scoring", function() {
	const score = createScorer(["title", "url"]);
	let tabs;

	beforeEach(() => {
		tabs = clone(Tabs);
	});

	test.each([
		["qk", 6, "QuicKey – The quick tab switcher - Chrome Web Store"],
		["dean", 11, "Bufala Negra – Garden & Gun"],
		["face", 10, "Facebook"]
	])('Score Tabs array for "%s"', (query, matchCount, firstTitle) => {
		const results = score(tabs, query);
		const nonmatches = results.filter(({score}) => score == 0);
		const nonmatchingTitles = nonmatches.map(({title}) => title);

		expect(results.length).toBe(Tabs.length);
		expect(Tabs.length - nonmatches.length).toBe(matchCount);
		expect(results[0].title).toBe(firstTitle);

			// make sure the 0-scored objects are sorted case-insensitively on their titles
		expect([].concat(nonmatchingTitles).sort(compareLowercase)).toEqual(nonmatchingTitles);
	});
});
