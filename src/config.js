const WordSeparators = "-/\\:()<>%._=&[]+ \t\n\r";
const UppercaseLetters = (function() {
	const charCodeA = "A".charCodeAt(0);
	const uppercase = [];

	for (let i = 0; i < 26; i++) {
		uppercase.push(String.fromCharCode(charCodeA + i));
	}

	return uppercase.join("");
})();
const IgnoredScore = 0.9;
const SkippedScore = 0.15;
const LongStringLength = 151;
const MaxMatchStartPct = .15;
const MinMatchDensityPct = .75;
const MaxMatchDensityPct = .95;
const BeginningOfStringPct = .1;
const ConfigDefaults = {
	wordSeparators: WordSeparators,
	uppercaseLetters: UppercaseLetters,
	ignoredScore: IgnoredScore,
	skippedScore: SkippedScore,
	skipReduction: true,
	adjustRemainingScore: function(
		remainingScore,
		string,
		query,
		skippedSpecialChar,
		matchedRange,
		searchRange,
		remainingSearchRange,
		fullMatchedRange)
	{
// TODO: make parameter order sensible
		const isShortString = string.length < LongStringLength;
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
				matchStartPercentage <= BeginningOfStringPct &&
				matchRangeDiscount >= MinMatchDensityPct) ?
				1 : matchRangeDiscount;
			matchStartDiscount = matchRangeDiscount >= MaxMatchDensityPct ?
				1 : matchStartDiscount;
		}

			// discount the scores of very long strings
		return remainingScore * Math.min(remainingSearchRange.length, LongStringLength) *
			matchRangeDiscount * matchStartDiscount;
	}
};


class QuickScoreConfig {
	constructor(
		options)
	{
		Object.assign(this, ConfigDefaults, options);
	}
}


export function config(
	options)
{
	return new QuickScoreConfig(options);
}


export const DefaultConfig = config();
export const QuicksilverConfig = config({
	adjustRemainingScore: function(
		remainingScore,
		string,
		query,
		skippedSpecialChar,
		matchedRange,
		searchRange,
		remainingSearchRange,
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
