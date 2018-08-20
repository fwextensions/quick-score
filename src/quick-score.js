import {Range} from "./range";


const WordSeparators = "-/\\:()<>%._=&[] \t\n\r";
const UpperCaseLetters = (function() {
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
//const MaxMatchStartPct = .15;
const MinMatchDensityPct = .75;
const MaxMatchDensityPct = .95;
const BeginningOfStringPct = .1;


export function quickScore(
	string,
	query,
	matches,
	noSkipReduction,
	searchRange = new Range(0, string.length),
	queryRange = new Range(0, query.length),
	fullMatchedRange = new Range())
{
	if (!queryRange.length) {
			// deduct some points for all remaining characters
		return IgnoredScore;
	}

	if (queryRange.length > searchRange.length) {
		return 0;
	}

	for (let i = queryRange.length; i > 0; i--) {
		const abbreviationSubstring = query.substring(queryRange.location, queryRange.location + i);
			// reduce the length of the search range by the number of chars
			// we're skipping in the query, to make sure there's enough string
			// left to possibly contain the skipped chars
		const matchedRange = getRangeOfSubstring(string, abbreviationSubstring,
			new Range(searchRange.location, searchRange.length - queryRange.length + i));

		if (!matchedRange.isValid()) {
			continue;
		}

		if (!fullMatchedRange.isValid()) {
			fullMatchedRange.location = matchedRange.location;
		} else {
			fullMatchedRange.location = Math.min(fullMatchedRange.location, matchedRange.location);
		}

		fullMatchedRange.max(matchedRange.max());

		if (matches) {
			matches.push([matchedRange.location, matchedRange.max()]);
		}

		const remainingSearchRange = new Range(matchedRange.max(), searchRange.max() - matchedRange.max());
		const remainingScore = quickScore(string, query, matches,
			noSkipReduction, remainingSearchRange, new Range(queryRange.location + i,
			queryRange.length - i), fullMatchedRange);

		if (remainingScore) {
			const matchStartPercentage = fullMatchedRange.location / string.length;
			const isShortString = string.length < LongStringLength;
			const useSkipReduction = true;
//			const useSkipReduction = !noSkipReduction && (isShortString || matchStartPercentage < MaxMatchStartPct),
			let score = remainingSearchRange.location - searchRange.location;
			let matchStartDiscount = (1 - matchStartPercentage);
				// default to no match-sparseness discount, for cases where there
				// are spaces before the matched letters or they're capitals
			let matchRangeDiscount = 1;

			if (matchedRange.location > searchRange.location) {
					// some letters were skipped when finding this match, so
					// adjust the score based on whether spaces or capital
					// letters were skipped
				if (useSkipReduction && WordSeparators.indexOf(string.charAt(matchedRange.location - 1)) > -1) {
					for (let j = matchedRange.location - 2; j >= searchRange.location; j--) {
						if (WordSeparators.indexOf(string.charAt(j)) > -1) {
							score--;
						} else {
							score -= SkippedScore;
						}
					}
				} else if (useSkipReduction && UpperCaseLetters.indexOf(string.charAt(matchedRange.location)) > -1) {
					for (let j = matchedRange.location - 1; j >= searchRange.location; j--) {
						if (UpperCaseLetters.indexOf(string.charAt(j)) > -1) {
							score--;
						} else {
							score -= SkippedScore;
						}
					}
				} else {
						// reduce the score by the number of chars we've
						// skipped since the beginning of the search range
						// and discount the remainingScore based on how much
						// larger the match is than the query, unless
						// the match is in the first 10% of the string, the
						// match range isn't too sparse and the whole string
						// is not too long
//					score -= matchedRange.location - searchRange.location;
					score -= (matchedRange.location - searchRange.location) / 2.0;

					matchRangeDiscount = query.length / fullMatchedRange.length;
					matchRangeDiscount = (isShortString &&
						matchStartPercentage <= BeginningOfStringPct &&
						matchRangeDiscount >= MinMatchDensityPct) ? 1 : matchRangeDiscount;
					matchStartDiscount = matchRangeDiscount >= MaxMatchDensityPct ?
						1 : matchStartDiscount;
				}
			}

				// discount the scores of very long strings
//			score += remainingScore * Math.min(remainingSearchRange.length, LongStringLength) *
//			score += remainingScore * remainingSearchRange.length *
//				matchRangeDiscount * matchStartDiscount;
			score += remainingScore * remainingSearchRange.length;

			score /= searchRange.length;

			return score;
		}
	}

	if (matches) {
			// the remaining query does not appear in the remaining
			// string, so clear the matches, since we'll start over with a
			// shorter piece of the query, which might match earlier
			// in the string, making any existing match indexes invalid.
		matches.length = 0;
	}

	return 0;
}


function getRangeOfSubstring(
	string,
	substring,
	searchRange = new Range(0, string.length))
{
	const stringToSearch = string.substring(searchRange.location, searchRange.max()).toLocaleLowerCase();
	const subStringIndex = stringToSearch.indexOf(substring.toLocaleLowerCase());
	const result = new Range();

	if (subStringIndex > -1) {
		result.location = subStringIndex + searchRange.location;
		result.length = substring.length;
	}

	return result;
}
