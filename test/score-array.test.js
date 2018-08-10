import {quickScore, createScorer} from "../src";
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


// TODO: why doesn't this work as a one-off test?

test("Tabs: dean", () => {
	const score = createScorer(quickScore, ["title", "url"]);
	const results = score(clone(Tabs), "dean");
	const nonmatches = results.filter(({score}) => score == 0);
	const nonmatchingTitles = nonmatches.map(({title}) => title);

	expect(results.length).toBe(Tabs.length);
	expect(Tabs.length - nonmatches.length).toBe(11);

		// make sure the 0-scored objects are sorted case-insensitively on their titles
	expect([].concat(nonmatchingTitles).sort(compareLowercase)).toEqual(nonmatchingTitles);
});
