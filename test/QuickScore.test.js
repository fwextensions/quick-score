import {QuickScore, BaseConfig, quickScore} from "../src";
import {clone, compareLowercase} from "./utils";
import Tabs from "./tabs";


const originalTabs = clone(Tabs);


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
	const qs = new QuickScore(Tabs, {
		keys: ["title", "url"],
			// pass -1 to allow non-matching items to be returned, which was the
			// original behavior before adding the minimumScore option
		minimumScore: -1
	});
	const tabCount = Tabs.length;

		// use one QuickScore for all the tests, which is how it would typically
		// be used
	test.each([
		["qk", 7, "QuicKey – The quick tab switcher - Chrome Web Store", "title"],
		["dean", 12, "Bufala Negra – Garden & Gun", "url"],
		["face", 10, "Facebook", "title"],
		["", 0, "Best Practices - Sharing", ""]
	])('Score Tabs array for "%s"', (query, matchCount, firstTitle, scoreKey) => {
		const results = qs.search(query);
		const nonmatches = results.filter(({score}) => score == 0);
		const nonmatchingTitles = nonmatches.map(({item: {title}}) => title);

		expect(results.length).toBe(tabCount);
		expect(tabCount - nonmatches.length).toBe(matchCount);
		expect(results[0].item.title).toBe(firstTitle);
		expect(results[0].scoreKey).toBe(scoreKey);

			// make sure the 0-scored objects are sorted case-insensitively on their titles
		expect(nonmatchingTitles).toEqual(nonmatchingTitles.slice().sort(compareLowercase));

			// make sure items with an undefined default key are sorted to the end
		expect(nonmatchingTitles[nonmatchingTitles.length - 1]).toBe(undefined);
	});
});


describe("Options", function() {
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

	test("Passing keys in options object", () => {
		const query = "qk";
		const qs = new QuickScore(Tabs, ["title", "url"]);
		const qsOptions = new QuickScore(Tabs, { keys: ["title", "url"] });

		expect(qs.search(query)).toEqual(qsOptions.search(query));
	});

	test("Config with useSkipReduction off", () => {
		const qs = new QuickScore(Tabs, {
			keys: ["title", "url"],
			config: {
				useSkipReduction: () => false
			}
		});
		let results = qs.search("qk");
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


test("Tabs is unmodified", () => {
		// across all of the tests above, Tabs should remain unmodified
	expect(Tabs).toEqual(originalTabs);
});
