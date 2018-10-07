import {Range} from "../src/range";


test("new Range()", () => {
	const r = new Range();

	expect(r.location).toBe(-1);
	expect(r.length).toBe(0);
	expect(r.max()).toBe(-1);
	expect(r.toString()).toBe("invalid range");
	expect(r + "").toBe("invalid range");
	expect(r.isValid()).toBe(false);
});

test("new Range(0, 10)", () => {
	const r = new Range(0, 10);

	expect(r.location).toBe(0);
	expect(r.length).toBe(10);
	expect(r.max()).toBe(10);
	expect(r.toString()).toBe("[0,10)");
	expect(r + "").toBe("[0,10)");
	expect(r.isValid()).toBe(true);
	expect(r.toArray()).toEqual([0, 10]);
});

test("Setting length with max()", () => {
	const r = new Range(0, 1);

	expect(r.max()).toBe(1);
	r.max(10);
	expect(r.max()).toBe(10);
});
