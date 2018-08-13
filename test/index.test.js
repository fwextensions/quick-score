import {quickScore, scoreArray, createScorer, Range} from "../src";


describe("Exported functions test", function() {
	test.each([
		["quickScore", 4, quickScore],
		["scoreArray", 2, scoreArray],
		["createScorer", 1, createScorer],
		["Range", 2, Range]
	])("%s() should have %i arguments", (name, arity, fn) => {
		expect(typeof fn).toBe("function");
		expect(fn.length).toBe(arity);
		expect(fn.name).toBe(name);
	});
});
