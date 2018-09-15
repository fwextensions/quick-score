module.exports = [
	[
		`log(abbreviationSubstring);`,
		"before",
		`		if (!matchedRange.isValid()) {`
	],
	[
		`logRanges(searchRange, hitMask, fullMatchedRange);`,
		"before",
		`		const remainingSearchRange = new Range(matchedRange.max(), searchRange.max() - matchedRange.max());`
	],
	[
		`log("remainingScore:", clip(remainingScore));`,
		"before",
		`		if (remainingScore) {`
	],
	[
`
			let matches = [];
			let ranges = [];
			let fromLastMatchRange = new Range(searchRange.location, score);

			setIndexesInRange(ranges, fromLastMatchRange, "+");
			log(indent(fill(ranges, "-")));
			setIndexesInRange(matches, remainingSearchRange, "|");
			setIndexesInRange(matches, new Range(searchRange.location, score), "-");
			log("score:", score);
`,
		"before",
		`			if (matchedRange.location > searchRange.location) {`
//			log("score:", score, "useSkipReduction:", useSkipReduction);
	],
	[
		`	matches[j] = "w";`,
		"after",
		`						if (WordSeparators.indexOf(itemString.charAt(j)) > -1) {`
	],
	[
		`	matches[j] = "u";`,
		"after",
		`						if (UpperCaseLetters.indexOf(itemString.charAt(j)) > -1) {`
	],
	[
`
			log(indent(fill(matches)));
			log("score:", clip(score), "remaining:", clip(remainingScore), remainingSearchRange + "");
`,
		"before",
		`			score += remainingScore * remainingSearchRange.length;`
//			log("score:", score, "remaining:", clip(remainingScore), remainingSearchRange + "",
//				"fullMatched: " + fullMatchedRange, "mStartPct:", clip(matchStartPercentage),
//				"mRangeDiscount:", clip(matchRangeDiscount), "mStartDiscount:", clip(matchStartDiscount));
	],
	[
		`log("score:", clip(score));`,
		"before",
		`			score /= searchRange.length;`
	],
	[
		`log(clip(score));`,
		"before",
		`			return score;`
	]
];
