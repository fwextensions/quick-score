expect.extend({
	toBeNearly(
		received,
		argument,
		maxDifference = 0.00001)
	{
		const pass = Math.abs(received - argument) <= maxDifference;

		if (pass) {
			return {
				message: () => `expected ${received} not to be within ${maxDifference} of ${argument}`,
				pass: true
			};
		} else {
			return {
				message: () => `expected ${received} to be within ${maxDifference} of ${argument}`,
				pass: false
			};
		}
	}
});
