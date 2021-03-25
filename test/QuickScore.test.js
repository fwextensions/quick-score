import {QuickScore, BaseConfig, quickScore} from "../src";
import {clone, compareLowercase} from "./utils";
import Tabs from "./tabs";


const originalTabs = clone(Tabs);
const nestedTabs = Tabs.map(tab => {
	const nestedTab = {};

		// only add a key if the original tab had it, so we can test items
		// with missing keys
	tab.hasOwnProperty("title") && (nestedTab.title = tab.title);
	tab.hasOwnProperty("url") && (nestedTab.nested = { path: { url: tab.url } });

	return nestedTab;
});
const nestedPathArray = ["nested", "path", "url"];
const nestedPathString = nestedPathArray.join(".");


describe("QuickScore tests", function() {
	const Strings = ["thought", "giraffe", "GitHub", "hello, Garth"];
	const originalStrings = clone(Strings);

	test("Basic QuickScore.search() test", () => {
		const results = new QuickScore(Strings).search("gh");

		expect(results[0].item).toBe("GitHub");
		expect(results[0]._).toBe("github");
		expect(results[0].matches).toEqual([[0, 1], [3, 4]]);

			// by default, zero-scored items should not be returned
		expect(results[results.length - 1].score).toBeGreaterThan(0);
	});

	test("Default scorer vs. options", () => {
		const defaultScorer = new QuickScore(Strings);
		const qsScorer = new QuickScore(Strings, { scorer: quickScore });
		const query = "gh";

		expect(defaultScorer.search(query)).toEqual(qsScorer.search(query));
	});

	test("Empty query returns 0 scores, and sorted alphabetically", () => {
		const results = new QuickScore(Strings).search("");
		const sortedStrings = clone(Strings).sort(compareLowercase);

		expect(results[0].score).toBe(0);
		expect(results.map(({item}) => item)).toEqual(sortedStrings);
	});

	test("Empty QuickScore", () => {
		const qs = new QuickScore();

		expect(qs.search("")).toEqual([]);
	});

	test("Strings is unmodified", () => {
		expect(Strings).toEqual(originalStrings);
	})
});


describe("Tabs scoring", function() {
	function createValidator(
		tabs,
		keys)
	{
			// set minimumScore to -1 so that non-matching items with 0 scores
			// are returned
		const scorer = new QuickScore(tabs, { keys, minimumScore: -1 });
		const tabCount = tabs.length;

		return function validator(query, matchCount, firstTitle, scoreKey)
		{
			const results = scorer.search(query);
			const nonmatches = results.filter(({score}) => score === 0);
			const nonmatchingTitles = nonmatches.map(({item: {title}}) => title);

			expect(results.length).toBe(tabCount);
			expect(tabCount - nonmatches.length).toBe(matchCount);
			expect(results[0].item.title).toBe(firstTitle);
			expect(results[0].scoreKey).toBe(scoreKey);

				// make sure the 0-scored objects are sorted case-insensitively
				// on their titles
			expect(nonmatchingTitles).toEqual(nonmatchingTitles.slice().sort(compareLowercase));

				// make sure items with an undefined default key ("title", in
				// this case) are sorted to the end
			expect(nonmatchingTitles[nonmatchingTitles.length - 1]).toBe(undefined);
		}
	}

	const expectedResults = [
		["qk", 7, "QuicKey – The quick tab switcher - Chrome Web Store", "title"],
		["dean", 12, "Bufala Negra – Garden & Gun", "url"],
		["face", 10, "Facebook", "title"],
		["", 0, "Best Practices - Sharing", ""]
	];
	const nestedExpectedResults = clone(expectedResults);

		// change the expected scoreKey from "url" to "nested.path.url" for the
		// second result when the tabs have a nested url key
	nestedExpectedResults[1][3] = nestedPathString;

	test.each(expectedResults)(
		'Score Tabs array for "%s"',
		createValidator(Tabs, ["title", "url"])
	);
	test.each(nestedExpectedResults)(
		'Score nested Tabs array for "%s"',
		createValidator(nestedTabs, ["title", nestedPathString])
	);
	test.each(nestedExpectedResults)(
		'Score nested Tabs array with an array key for "%s"',
		createValidator(nestedTabs, ["title", nestedPathArray])
	);
});


describe("Options", function() {
	test("Passing keys in options object", () => {
		const query = "qk";
		const qs = new QuickScore(Tabs, ["title", "url"]);
		const qsOptions = new QuickScore(Tabs, { keys: ["title", "url"] });

		expect(qs.search(query)).toEqual(qsOptions.search(query));
	});

	test("Keys with dots in the name", () => {
		const dotKeyTabs = Tabs.map(tab => {
			const newTab = {};

			tab.hasOwnProperty("title") && (newTab.title = tab.title);
			tab.hasOwnProperty("url") && (newTab.url = tab.url);
			newTab["title.url"] = `${tab.title}.${tab.url}`;

			return newTab;
		});
		const query = "tabswitchldl";
		const qsDotKeyArray = new QuickScore(dotKeyTabs, { keys: ["title", "url", ["title.url"]] });
		const qsDotKeyString = new QuickScore(dotKeyTabs, { keys: ["title", "url", "title.url"] });
		const arrayResults = qsDotKeyArray.search(query);
		const stringResults = qsDotKeyString.search(query);
		const [firstArrayResult] = arrayResults;

			// there's a tab listed twice in Tabs whose "title.url" value will
			// match the query, but only if the key name is wrapped in an array,
			// so that QuickScore doesn't try to split the name into a path.
			// nothing will match if we pass a dot-delimited string key.
		expect(arrayResults.length).toBe(2);
		expect(stringResults.length).toBe(0);

			// make sure the match is on "title.url" and that that key was not
			// treated as a dot path to a sub-key
		expect(firstArrayResult.scoreKey).toBe("title.url");
		expect(firstArrayResult.scoreValue).toBe(`${firstArrayResult.item.title}.${firstArrayResult.item.url}`);
		expect(qsDotKeyArray.keys[2]).not.toHaveProperty("path");
	});

	test("Per-key scorer", () => {
		const qs = new QuickScore(Tabs, [
			{
				name: "title",
				scorer: () => 1
			},
			{
				name: "url",
				scorer: () => 0
			}
		]);
		const [firstItem] = qs.search("qk");

			// since all the scores are the same, the results should be alphabetized
		expect(firstItem.item.title).toBe("Best Practices - Sharing");
		expect(firstItem.scores.title).toBe(1);
		expect(firstItem.scores.url).toBe(0);
	});

	test("Per-key scorer with dot paths", () => {
		const qs = new QuickScore(nestedTabs, [
			{
				name: "title",
				scorer: () => 0
			},
			{
				name: nestedPathString,
				scorer: (string, query) => string.indexOf(query) === 0 ? 1 : 0
			}
		]);
		const results = qs.search("view-source");
		const [firstItem] = results;

			// only one tab has a url that starts with "view-source"
		expect(results.length).toBe(1);
		expect(firstItem.item.title).toBe("view-source:https://fwextensions.github.io/QuicKey/ctrl-tab/");
		expect(firstItem.scores.title).toBe(0);
		expect(firstItem.scores[nestedPathString]).toBe(1);
	});

	test("Keys is an empty array", () => {
			// add a tab that has a different key than the others with a value
			// that equals the query, so it'll be the top match
		const query = "qk";
		const tabs = [{ foo: query }].concat(Tabs);
		const qs = new QuickScore(tabs, {
			keys: []
		});
		const results = qs.search(query);
		const [firstItem] = results;

		expect(results.filter(({score}) => score).length).toBe(8);
		expect(firstItem.scoreValue).toBe(query);
		expect(firstItem.scoreKey).toBe("foo");
		expect(firstItem.score).toBe(1);
		expect(firstItem.matches[firstItem.scoreKey]).toEqual([[0, 2]]);
	});

	test("Call setKeys() after constructor", () => {
		const qs = new QuickScore(Tabs);

		qs.setKeys(["title", "url"]);

		const results = qs.search("qk");
		const [firstItem] = results;

		expect(results.filter(({score}) => score).length).toBe(7);
		expect(firstItem.scoreValue).toBe("QuicKey – The quick tab switcher - Chrome Web Store");
		expect(firstItem.scoreKey).toBe("title");
		expect(firstItem.score).toBeNearly(.90098);
		expect(firstItem.matches[firstItem.scoreKey]).toEqual([[0, 1], [4, 5]]);
	});

	test("Pass sortKey option that isn't the first string in keys", () => {
		const qs = new QuickScore(Tabs, {
			keys: ["title", "url"],
			sortKey: "url"
		});
		const results = qs.search("");
		const [firstItem] = results;
		const [lastItem] = results.slice(-1);

		expect(results.length).toBe(Tabs.length);
		expect(firstItem.item.url.indexOf("chrome")).toBe(0);
		expect(firstItem.score).toBe(0);
		expect(lastItem.url).toEqual(undefined);
	});

	test("Pass sortKey option that resolves to undefined", () => {
		const qs = new QuickScore(Tabs, {
			keys: ["title", "url"],
			sortKey: "foo"
		});
		const results = qs.search("");
		const [firstItem] = results;
		const [lastItem] = results.slice(-1);

			// since the query is empty and the sortKey doesn't exist, the order
			// of the results should be the same as the original items array
		expect(results.length).toBe(Tabs.length);
		expect(firstItem.item.title).toBe(Tabs[0].title);
		expect(firstItem.score).toBe(0);
		expect(lastItem.item.title).toBe(Tabs.slice(-1)[0].title);
	});

	test("Config with useSkipReduction off", () => {
		const qs = new QuickScore(Tabs, {
			keys: ["title", "url"],
			config: {
				useSkipReduction: () => false
			}
		});
		const results = qs.search("qk");
		const [firstItem] = results;

		expect(results.filter(({score}) => score).length).toBe(7);
		expect(firstItem.item.title).toBe("Quokka.js: Configuration");
		expect(firstItem.scoreKey).toBe("title");
		expect(firstItem.score).toBe(0.4583333333333333);
		expect(firstItem.matches.title).toEqual([[0, 1], [3, 4]]);
	});

	test("scorer with no createConfig()", () => {
		const qs = new QuickScore(Tabs, {
			keys: ["title", "url"],
			scorer: () => 1
		});
		const [firstItem] = qs.search("");

			// since all the scores are the same, the results should be alphabetized
		expect(firstItem.item.title).toBe("Best Practices - Sharing");
		expect(firstItem.scores.title).toBe(1);
		expect(firstItem.scores.url).toBe(1);
	});

	test("BaseConfig", () => {
		const qs = new QuickScore(Tabs, {
			keys: ["title", "url"],
			config: BaseConfig
		});
		const qsDefault = new QuickScore(Tabs, ["title", "url"]);
		const [firstItem] = qs.search("mail");
		const [firstItemDefault] = qsDefault.search("mail");

		expect(firstItem.item.title).toBe("facebook/immutable-js: Immutable persistent data collections for Javascript which increase efficiency and simplicity.");
		expect(firstItem.scores.title).toBeNearly(0.74060);
		expect(firstItem.scores.url).toBeNearly(0.34250);
		expect(firstItem.score).toBeGreaterThan(firstItemDefault.score);
	});
});


test("Nested keys edge cases", () => {
	const items = [
		{
			title: "zero",
			nested: 0
		},
		{
			title: "one",
			nested: 1
		},
		{
			title: "null",
			nested: null
		},
		{
			title: "object",
			nested: {}
		},
		{
			title: "undefined"
		},
		{
			title: "empty string",
			nested: {
				value: ""
			}
		},
		{
			title: "true",
			nested: true
		},
		{
			title: "filled string",
			nested: {
				value: "foo"
			}
		}
	];
	const qs = new QuickScore(items, {
		keys: ["title", "nested.value"],
		minimumScore: -1
	});
	const results = qs.search("filled");
	const nonMatchingResults = results.filter(item => !item._.hasOwnProperty("nested.value"));

		// make sure the lowercase versions of all the empty or undefined string
		// values are undefined
	expect(nonMatchingResults.length).toBe(items.length - 1);
	expect(results[0].item.title).toBe("filled string");
});


test("Tabs is unmodified", () => {
		// across all of the tests above, Tabs should remain unmodified
	expect(Tabs).toEqual(originalTabs);
});
