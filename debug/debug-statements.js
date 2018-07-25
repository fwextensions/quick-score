module.exports = [
		// before if (!matchedRange.isValid()) {
	[54, `log(abbreviationSubstring);`],
		// before var remainingSearchRange = new Range(matchedRange.max(), searchRange.max() - matchedRange.max()),
	[70, `logRanges(searchRange, hitMask, fullMatchedRange);`],
		// before if (remainingScore) {
	[76, `log("remainingScore:", clip(remainingScore));`],
		// before if (matchedRange.location > searchRange.location) {
	[88,
`
			var matches = [],
				ranges = [],
				fromLastMatchRange = new Range(searchRange.location, score);

			setIndexesInRange(ranges, fromLastMatchRange, "+");
			log(indent(fill(ranges, "-")));
			setIndexesInRange(matches, remainingSearchRange, "|");
			setIndexesInRange(matches, new Range(searchRange.location, score), "-");
			log("score:", score, "useSkipReduction:", useSkipReduction);
`
	],
		// after if (WordSeparators.indexOf(itemString.charAt(j)) > -1) {
	[97, `matches[j] = "w";`],
		// after if (UpperCaseLetters.indexOf(itemString.charAt(j)) > -1) {
	[105, `matches[j] = "u";`],
		// before score += remainingScore * remainingSearchRange.length;
	[130,
`
			log(indent(fill(matches)));
			log("score:", score, "remaining:", clip(remainingScore), remainingSearchRange + "",
				"fullMatched: " + fullMatchedRange, "mStartPct:", clip(matchStartPercentage),
				"mRangeDiscount:", clip(matchRangeDiscount), "mStartDiscount:", clip(matchStartDiscount));
`
	],
		// before score /= searchRange.length;
	[136, `log("score:", score);`],
		// before return score;
	[138, `log(clip(score));`],
];
