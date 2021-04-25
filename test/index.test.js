import {QuickScore, quickScore, Range} from "../src";


describe("Exported functions test", function() {
	test.each([
		["QuickScore", 0, QuickScore],
		["quickScore", 0, quickScore],
		["Range", 0, Range]
	])("%s() should have %i arguments", (name, arity, fn) => {
		expect(typeof fn).toBe("function");
		expect(fn.length).toBe(arity);
		expect(fn.name).toBe(name);
	});
});
