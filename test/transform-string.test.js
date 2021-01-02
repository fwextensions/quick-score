import {QuickScore} from "../src";


describe("Use transformString()", () => {
	const Strings = ["thought", "giraffe", "GitHub", "hello, Garth"];

	function transformString(
		string)
	{
		return string.toLocaleUpperCase();
	}

	test("Uppercase transformString() still matches all queries", () => {
		const lowercaseQS = new QuickScore(Strings);
		const uppercaseQS = new QuickScore(Strings, { transformString });
const items = ["café", "cafeteria"];
const qs = new QuickScore(items, { transformString: s => latinize(s).toLowerCase() });
const results = qs.search("cafe");
console.log();
		expect(lowercaseQS.search("gh").length).toBe(3);
		expect(uppercaseQS.search("gh").length).toBe(3);
		expect(lowercaseQS.search("GH").length).toBe(3);
		expect(uppercaseQS.search("GH").length).toBe(3);
		expect(uppercaseQS.search("")[0]._).toBe("GIRAFFE");
	});
});
