import defaultQS, {quickScore, Range} from "../src";


test("quickScore export", () => {
	expect(typeof defaultQS).toBe("function");
	expect(typeof quickScore).toBe("function");
	expect(defaultQS === quickScore).toBe(true);
	expect(quickScore.length).toBe(4);
});


test("Range export", () => {
	expect(typeof Range).toBe("function");
	expect(Range.length).toBe(2);
});
