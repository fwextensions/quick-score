const BaseConfigDefaults = {
	wordSeparators: "-/\\:()<>%._=&[]+ \t\n\r",
	uppercaseLetters: (() => {
		const charCodeA = "A".charCodeAt(0);
		const uppercase = [];

		for (let i = 0; i < 26; i++) {
			uppercase.push(String.fromCharCode(charCodeA + i));
		}

		return uppercase.join("");
	})(),
	ignoredScore: 0.9,
	skippedScore: 0.15,
	emptyQueryScore: 0
};
const QSConfigDefaults = {
	longStringLength: 150,
	maxMatchStartPct: 0.15,
	minMatchDensityPct: 0.75,
	maxMatchDensityPct: 0.95,
	beginningOfStringPct: 0.1
};


class Config {
	constructor(
		options)
	{
		Object.assign(this, BaseConfigDefaults, options);
	}


	useSkipReduction()
	{
		return true;
	}


	adjustRemainingScore(
		string,
		query,
		remainingScore,
		skippedSpecialChar,
		searchRange,
		remainingSearchRange,
		matchedRange,
		fullMatchedRange)
	{
			// use the original Quicksilver expression for the remainingScore
		return remainingScore * remainingSearchRange.length;
	}
}


class QuickScoreConfig extends Config {
	constructor(
		options)
	{
		super(Object.assign({}, QSConfigDefaults, options));
	}


	useSkipReduction(
		string,
		query,
		remainingScore,
		searchRange,
		remainingSearchRange,
		matchedRange,
		fullMatchedRange)
	{
		const len = string.length;
		const isShortString = len <= this.longStringLength;
		const matchStartPercentage = fullMatchedRange.location / len;

		return isShortString || matchStartPercentage < this.maxMatchStartPct;
	}


	adjustRemainingScore(
		string,
		query,
		remainingScore,
		skippedSpecialChar,
		searchRange,
		remainingSearchRange,
		matchedRange,
		fullMatchedRange)
	{
		const isShortString = string.length <= this.longStringLength;
		const matchStartPercentage = fullMatchedRange.location / string.length;
		let matchRangeDiscount = 1;
		let matchStartDiscount = (1 - matchStartPercentage);

			// discount the remainingScore based on how much larger the match is
			// than the query, unless the match is in the first 10% of the
			// string, the match range isn't too sparse and the whole string is
			// not too long.  also only discount if we didn't skip any whitespace
			// or capitals.
		if (!skippedSpecialChar) {
			matchRangeDiscount = query.length / fullMatchedRange.length;
			matchRangeDiscount = (isShortString &&
				matchStartPercentage <= this.beginningOfStringPct &&
				matchRangeDiscount >= this.minMatchDensityPct) ?
				1 : matchRangeDiscount;
			matchStartDiscount = matchRangeDiscount >= this.maxMatchDensityPct ?
				1 : matchStartDiscount;
		}

			// discount the scores of very long strings
		return remainingScore *
			Math.min(remainingSearchRange.length, this.longStringLength) *
			matchRangeDiscount * matchStartDiscount;
	}
}


export function createConfig(
	options)
{
	if (options instanceof Config) {
			// this is a full-fledged Config instance, so we don't need to do
			// anything to it
		return options;
	} else {
			// create a complete config from this
		return new QuickScoreConfig(options);
	}
}


export const DefaultConfig = createConfig();
export const BaseConfig = new Config();
export const QuicksilverConfig = new Config({
		// the Quicksilver algorithm returns .9 for empty queries
	emptyQueryScore: 0.9,
	adjustRemainingScore: function(
		string,
		query,
		remainingScore,
		skippedSpecialChar,
		searchRange,
		remainingSearchRange,
		matchedRange,
		fullMatchedRange)
	{
		let score = remainingScore * remainingSearchRange.length;

		if (!skippedSpecialChar) {
				// the current QuickSilver algorithm reduces the score by half
				// this value when no special chars are skipped, so add the half
				// back in to match it
			score += ((matchedRange.location - searchRange.location) / 2.0);
		}

		return score;
	}
});
