const Range = require("./range");


const WordSeparators = "-/\\:()<>%._=&[] \t\n\r",
	UpperCaseLetters = (function() {
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
				// reduce the length of the search range by the number of chars
				// we're skipping in the query, to make sure there's enough string
				// left to possibly contain the skipped chars
			matchedRange = getRangeOfSubstring(itemString, abbreviationSubstring,
				new Range(searchRange.location, searchRange.length - abbreviationRange.length + i));

		if (!matchedRange.isValid()) {
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

		var remainingSearchRange = new Range(matchedRange.max(), searchRange.max() - matchedRange.max()),
			remainingScore = quickScore(itemString, abbreviation,
				hitMask, noSkipReduction, remainingSearchRange,
				new Range(abbreviationRange.location + i, abbreviationRange.length - i),
				fullMatchedRange);

		if (remainingScore) {
			var score = remainingSearchRange.location - searchRange.location,
				matchStartPercentage = fullMatchedRange.location / itemString.length,
				isShortString = itemString.length < LongStringLength,
				useSkipReduction = true,
//				useSkipReduction = !noSkipReduction && (isShortString || matchStartPercentage < MaxMatchStartPct),
				matchStartDiscount = (1 - matchStartPercentage),
					// default to no match-sparseness discount, for cases
					// where there are spaces before the matched letters or
					// they're capitals
				matchRangeDiscount = 1;

			if (matchedRange.location > searchRange.location) {
				var j;
// TODO: remove this, which replicates a bug in QSSense.m where the inline buffer is filled from strRange
// instead of the whole string.  we also have to check that the chars are non-zero strings, since "foo".indexOf("") == 0 (!)
var inlineBuffer = itemString.substr(searchRange.location, searchRange.length), prev = inlineBuffer.charAt(matchedRange.location - 1), current = inlineBuffer.charAt(matchedRange.location);

					// some letters were skipped when finding this match, so
					// adjust the score based on whether spaces or capital
					// letters were skipped
				if (useSkipReduction && prev && WordSeparators.indexOf(prev) > -1) {
//				if (useSkipReduction && WordSeparators.indexOf(itemString.charAt(matchedRange.location - 1)) > -1) {
					for (j = matchedRange.location - 2; j >= searchRange.location; j--) {
						if (WordSeparators.indexOf(inlineBuffer.charAt(j)) > -1) {
//						if (WordSeparators.indexOf(itemString.charAt(j)) > -1) {
							score--;
						} else {
							score -= SkippedScore;
						}
					}
				} else if (useSkipReduction && current && UpperCaseLetters.indexOf(current) > -1) {
//				} else if (useSkipReduction && UpperCaseLetters.indexOf(itemString.charAt(matchedRange.location)) > -1) {
					for (j = matchedRange.location - 1; j >= searchRange.location; j--) {
						if (UpperCaseLetters.indexOf(inlineBuffer.charAt(j)) > -1) {
//						if (UpperCaseLetters.indexOf(itemString.charAt(j)) > -1) {
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
//					score -= matchedRange.location - searchRange.location;
//					score -= (matchedRange.location - searchRange.location) / 2.0;
// TODO: remove this, which replicates a bug in QSSense.m, where the remainder is ignored
					score -= Math.floor((matchedRange.location - searchRange.location) / 2);

					matchRangeDiscount = abbreviation.length / fullMatchedRange.length;
					matchRangeDiscount = (isShortString &&
						matchStartPercentage <= BeginningOfStringPct &&
						matchRangeDiscount >= MinMatchDensityPct) ? 1 : matchRangeDiscount;
					matchStartDiscount = matchRangeDiscount >= MaxMatchDensityPct ?
						1 : matchStartDiscount;
				}
			}

				// discount the scores of very long strings
			score += remainingScore * remainingSearchRange.length;
//			score += remainingScore * Math.min(remainingSearchRange.length, LongStringLength) *
//			score += remainingScore * remainingSearchRange.length *
//				matchRangeDiscount * matchStartDiscount;

			score /= searchRange.length;

			return score;
		}
	}

	if (hitMask) {
			// the remaining abbreviation does not appear in the remaining
			// string, so clear the hitMask, since we'll start over with a
			// shorter piece of the abbreviation, which might match earlier
			// in the string, making any existing match indexes invalid.
// TODO: uncomment this, which replicates a bug in QSSense.m, where the hitMask isn't reset when the function recurses
//		hitMask.length = 0;
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
