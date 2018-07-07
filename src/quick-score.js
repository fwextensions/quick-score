const Range = require("./range");


const WhitespacePattern = "-/\\:()<>%._=&[] \t\n\r",
	UpperCasePattern = (function() {
			var charCodeA = "A".charCodeAt(0),
				uppercase = [];

			for (var i = 0; i < 26; i++) {
				uppercase.push(String.fromCharCode(charCodeA + i));
			}

			return uppercase.join("");
		})(),
	IgnoredScore = 0.9,
	SkippedScore = 0.15,
	LongStringLength = 151,
	MaxMatchStartPct = .15,
	MinMatchDensityPct = .75,
	MaxMatchDensityPct = .95,
	BeginningOfStringPct = .1;


function quickScore(
	itemString,			// str
	abbreviation,		// abbr
	hitMask,			// mask
	noSkipReduction,
	searchRange,		// strRange
	abbreviationRange,	// abbrRange
	fullMatchedRange)
{
	searchRange = searchRange || new Range(0, itemString.length);
	abbreviationRange = abbreviationRange || new Range(0, abbreviation.length);
	fullMatchedRange = fullMatchedRange || new Range();

	if (!abbreviationRange.length) {
			// deduct some points for all remaining characters
		return IgnoredScore;
	}

	if (abbreviationRange.length > searchRange.length) {
		return 0;
	}

	for (var i = abbreviationRange.length; i > 0; i--) {
		var abbreviationSubstring = abbreviation.substr(abbreviationRange.location, i),
//			matchedRange = getRangeOfSubstring(itemString, abbreviationSubstring,
//				new Range(searchRange.location, searchRange.length - abbreviationRange.length + i));
			matchedRange = getRangeOfSubstring(itemString, abbreviationSubstring, searchRange);
// TODO: reduce the searchRange by abbreviation.length + i
// ensures there'd be room at the end of the string to fit the whole abbreviation.  otherwise, we could find a match
// of part of the abbreviation at the very end of the string
// and then recurse, at which point we wouldn't find anything
// further because we're at the end of the string

		/* DEBUG log(abbreviationSubstring); */

		if (!matchedRange.isValid()) {
			continue;
		}

// TODO: we don't need this if we create a reduced search range above
		if (matchedRange.location + abbreviationRange.length > searchRange.max()) {
			continue;
		}

		if (!fullMatchedRange.isValid()) {
			fullMatchedRange.location = matchedRange.location;
		} else {
			fullMatchedRange.location = Math.min(fullMatchedRange.location, matchedRange.location);
		}

		fullMatchedRange.max(matchedRange.max());

		if (hitMask) {
			addIndexesInRange(hitMask, matchedRange);
		}

		/* DEBUG logRanges(searchRange, hitMask, fullMatchedRange); */

		var remainingSearchRange = new Range(matchedRange.max(), searchRange.max() - matchedRange.max()),
			remainingScore = quickScore(itemString, abbreviation,
				hitMask, noSkipReduction, remainingSearchRange,
				new Range(abbreviationRange.location + i, abbreviationRange.length - i),
				fullMatchedRange);

		/* DEBUG log("remainingScore:", clip(remainingScore)); */

		if (remainingScore) {
			var score = remainingSearchRange.location - searchRange.location,
				matchStartPercentage = fullMatchedRange.location / itemString.length,
				isShortString = itemString.length < LongStringLength,
				useSkipReduction = true,
//				useSkipReduction = !noSkipReduction && (isShortString || matchStartPercentage < MaxMatchStartPct),
//				matchStartDiscount = (1 - matchStartPercentage),
					// default to no match-sparseness discount, for cases
					// where there are spaces before the matched letters or
					// they're capitals
				matchRangeDiscount = 1;

			/* DEBUG
				var matches = [],
					ranges = [],
					fromLastMatchRange = new Range(searchRange.location, score);

				setIndexesInRange(ranges, fromLastMatchRange, "+");
				log(indent(fill(ranges, "-")));
				setIndexesInRange(matches, remainingSearchRange, "|");
				setIndexesInRange(matches, new Range(searchRange.location, score), "-");
				log("score:", score, "useSkipReduction:", useSkipReduction);
			*/

			if (matchedRange.location > searchRange.location) {
				var j;

					// some letters were skipped when finding this match, so
					// adjust the score based on whether spaces or capital
					// letters were skipped
				if (useSkipReduction && WhitespacePattern.indexOf(itemString.charAt(matchedRange.location - 1)) > -1) {
					for (j = matchedRange.location - 2; j >= searchRange.location; j--) {
						if (WhitespacePattern.indexOf(itemString.charAt(j)) > -1) {
							/* DEBUG matches[j] = "w"; */
							score--;
						} else {
// this reduces the penalty for skipped chars when we also didn't skip over any other words
							score -= SkippedScore;
						}
					}
				} else if (useSkipReduction && UpperCasePattern.indexOf(itemString.charAt(matchedRange.location)) > -1) {
					for (j = matchedRange.location - 1; j >= searchRange.location; j--) {
						if (UpperCasePattern.indexOf(itemString.charAt(j)) > -1) {
							/* DEBUG matches[j] = "u"; */
							score--;
						} else {
							score -= SkippedScore;
						}
					}
				} else {
						// reduce the score by the number of chars we've
						// skipped since the beginning of the search range
						// and discount the remainingScore based on how much
						// larger the match is than the abbreviation, unless
						// the match is in the first 10% of the string, the
						// match range isn't too sparse and the whole string
						// is not too long
					score -= (matchedRange.location - searchRange.location);
//					score -= (matchedRange.location - searchRange.location) / 2;
//					matchRangeDiscount = abbreviation.length / fullMatchedRange.length;
//					matchRangeDiscount = (isShortString &&
//						matchStartPercentage <= BeginningOfStringPct &&
//						matchRangeDiscount >= MinMatchDensityPct) ? 1 : matchRangeDiscount;
//					matchStartDiscount = matchRangeDiscount >= MaxMatchDensityPct ?
//						1 : matchStartDiscount;
				}
			}

			/* DEBUG
				log(indent(fill(matches)));
				log("score:", score, "remaining:", clip(remainingScore), remainingSearchRange + "",
					"fullMatched: " + fullMatchedRange, "mStartPct:", clip(matchStartPercentage),
					"mRangeDiscount:", clip(matchRangeDiscount), "mStartDiscount:", clip(matchStartDiscount));
			*/

				// discount the scores of very long strings
			score += remainingScore * remainingSearchRange.length;
//			score += remainingScore * Math.min(remainingSearchRange.length, LongStringLength) *
//			score += remainingScore * remainingSearchRange.length *
//				matchRangeDiscount * matchStartDiscount;

			/* DEBUG log("score:", score); */

			score /= searchRange.length;

			/* DEBUG log(clip(score)); */

			return score;
		}
	}

	if (hitMask) {
			// the remaining abbreviation does not appear in the remaining
			// string, so clear the hitMask, since we'll start over with a
			// shorter piece of the abbreviation, which might match earlier
			// in the string, making the existing match indexes invalid.
		hitMask.length = 0;
	}

	return 0;
}


function getRangeOfSubstring(
	string,
	substring,
	searchRange)
{
	searchRange = searchRange || new Range(0, string.length);

	var stringToSearch = string.substr(searchRange.location, searchRange.length).toLocaleLowerCase(),
		subStringIndex = stringToSearch.indexOf(substring.toLocaleLowerCase()),
		result = new Range();

	if (subStringIndex > -1) {
		result.location = subStringIndex + searchRange.location;
		result.length = substring.length;
	}

	return result;
}


function addIndexesInRange(
	indexes,
	range)
{
	for (var i = range.location; i < range.max(); i++) {
		indexes.push(i);
	}

	return indexes;
}


module.exports = quickScore;
