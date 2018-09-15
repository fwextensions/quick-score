import {QuickScore, BaseConfig, quickScore} from "../src";
import {clone, freshTabs, compareLowercase} from "./utils";
import Tabs from "./tabs";


describe("QuickScore tests", function() {
	const Strings = ["thought", "giraffe", "GitHub", "hello, Garth"];

	test("Basic QuickScore.search() test", () => {
		const strings = clone(Strings);
		const results = new QuickScore(strings).search("gh");

		expect(results[0].string).toBe("GitHub");
		expect(results[0].matches.string).toEqual([[0, 1], [3, 4]]);
		expect(results[0].score).toEqual(results[0].scores.string);
		expect(results[results.length - 1].score).toBe(0);
	});

	test("Default scorer vs. options", () => {
		const defaultScorer = new QuickScore(clone(Strings));
		const qsScorer = new QuickScore(clone(Strings), { scorer: quickScore });
		const query = "qk";

		expect(defaultScorer.search(query)).toEqual(qsScorer.search(query));
	});

	test("Empty QuickScore", () => {
		const qs = new QuickScore();

		expect(qs.search("")).toEqual([]);
	});
});


describe("Tabs scoring", function() {
	const qs = new QuickScore(freshTabs(), ["title", "url"]);

		// use one QuickScore for all the tests, which is how it would typically
		// be used
	test.each([
		["qk", 6, "QuicKey – The quick tab switcher - Chrome Web Store", "title"],
		["dean", 11, "Bufala Negra – Garden & Gun", "url"],
		["face", 10, "Facebook", "title"]
	])('Score Tabs array for "%s"', (query, matchCount, firstTitle, scoreKey) => {
		const results = qs.search(query);
		const nonmatches = results.filter(({score}) => score == 0);
		const nonmatchingTitles = nonmatches.map(({title}) => title);

		expect(results.length).toBe(Tabs.length);
		expect(Tabs.length - nonmatches.length).toBe(matchCount);
		expect(results[0].title).toBe(firstTitle);
		expect(results[0].scoreKey).toBe(scoreKey);

			// make sure the 0-scored objects are sorted case-insensitively on their titles
		expect([].concat(nonmatchingTitles).sort(compareLowercase)).toEqual(nonmatchingTitles);
	});

	test("Calling setItems() with items with existing scores doesn't modify the items", () => {
		const originalItems = clone(qs.items);

		qs.setItems(qs.items);
		expect(originalItems).toEqual(qs.items);
	});
});


describe("Options", function() {
	test("Per-key scorer", () => {
		const qs = new QuickScore(freshTabs(), [
			{
				key: "title",
				scorer: () => 1
			},
			{
				key: "url",
				scorer: () => 0
			}
		]);
		const results = qs.search("qk");
		const originalItems = clone(qs.items);

			// since all the scores are the same, the results should be alphabetized
		expect(results[0].title).toBe("Best Practices - Sharing");
		expect(results[0].scores.title).toBe(1);
		expect(results[0].scores.url).toBe(0);

			// check that calling setKeys() will reset the items
		expect(originalItems).toEqual(qs.items);
		qs.setKeys(["title", "url"]);
		expect(originalItems).not.toEqual(qs.items);
	});

	test("Passing keys in options object", () => {
		const query = "qk";
		const qs = new QuickScore(freshTabs(), ["title", "url"]);
		const qsOptions = new QuickScore(freshTabs(), { keys: ["title", "url"] });

		expect(qs.search(query)).toEqual(qsOptions.search(query));
	});

	test("Config with useSkipReduction off", () => {
		const emptyQueryScore = 0.9;
		const qs = new QuickScore(freshTabs(), {
			keys: ["title", "url"],
			config: {
				useSkipReduction: () => false,
				emptyQueryScore
			}
		});
		let results;

			// the item scores should default to 0, but then become 0.9 when an
			// empty query is run
		expect(qs.items[0].score).toBe(0);
		qs.search("");
		expect(qs.items[0].score).toBe(emptyQueryScore);

		results = qs.search("qk");
		expect(results.filter(({score}) => score).length).toBe(6);

		const firstItem = results[0];

		expect(firstItem.title).toBe("Quokka.js: Configuration");
		expect(firstItem.scoreKey).toBe("title");
		expect(firstItem.score).toBe(0.4583333333333333);
		expect(firstItem.matches.title).toEqual([[0, 1], [3, 4]]);
	});

	test("scorer with no createConfig()", () => {
		const qs = new QuickScore(freshTabs(), {
			keys: ["title", "url"],
			scorer: () => 1
		});
		const [firstItem] = qs.search("");

			// since all the scores are the same, the results should be alphabetized
		expect(firstItem.title).toBe("Best Practices - Sharing");
		expect(firstItem.scores.title).toBe(1);
		expect(firstItem.scores.url).toBe(1);
	});

	test("BaseConfig", () => {
		const qs = new QuickScore(freshTabs(), {
			keys: ["title", "url"],
			config: BaseConfig
		});
		const qsDefault = new QuickScore(freshTabs(), ["title", "url"]);
		const [firstItem] = qs.search("mail");
		const [firstItemDefault] = qsDefault.search("mail");

		expect(firstItem.title).toBe("facebook/immutable-js: Immutable persistent data collections for Javascript which increase efficiency and simplicity.");
		expect(firstItem.scores.title).toBeNearly(0.74060);
		expect(firstItem.scores.url).toBeNearly(0.34250);
		expect(firstItem.score).toBeGreaterThan(firstItemDefault.score);
	});
});
