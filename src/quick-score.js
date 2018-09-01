import {Range} from "./range";
import {DefaultConfig} from "./config";


const LongStringLength = 151;
const MaxMatchStartPct = .15;


export function quickScore(
	string,
	query,
	matches,
	config = DefaultConfig,
	stringRange = new Range(0, string.length))
{
	if (!query) {
		return config.skippedScore;
	}

	const lcString = string.toLocaleLowerCase();
	const lcQuery = query.toLocaleLowerCase();

	return calcScore(stringRange, new Range(0, query.length), new Range());


	function calcScore(
		searchRange,
		queryRange,
		fullMatchedRange)
	{
		if (!queryRange.length) {
				// deduct some points for all remaining characters
			return config.ignoredScore;
		}

		if (queryRange.length > searchRange.length) {
			return 0;
		}

		for (let i = queryRange.length; i > 0; i--) {
			const querySubstring = lcQuery.substring(queryRange.location, queryRange.location + i);
				// reduce the length of the search range by the number of chars
				// we're skipping in the query, to make sure there's enough string
				// left to possibly contain the skipped chars
			const matchedRange = getRangeOfSubstring(lcString, querySubstring,
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
			const remainingQueryRange = new Range(queryRange.location + i, queryRange.length - i);
			const remainingScore = calcScore(remainingSearchRange, remainingQueryRange, fullMatchedRange);

			if (remainingScore) {
				const isShortString = string.length < LongStringLength;
				const matchStartPercentage = fullMatchedRange.location / string.length;
				const useSkipReduction = config.skipReduction === true &&
					(isShortString || matchStartPercentage < MaxMatchStartPct);
				let score = remainingSearchRange.location - searchRange.location;
					// default to true since we only want to apply a discount if
					// we hit the final else clause below, and we won't get to
					// any of them if the match is right at the start of the
					// searchRange
				let skippedSpecialChar = true;

				if (matchedRange.location > searchRange.location) {
						// some letters were skipped when finding this match, so
						// adjust the score based on whether spaces or capital
						// letters were skipped
					if (useSkipReduction &&
							config.wordSeparators.indexOf(string[matchedRange.location - 1]) > -1) {
						for (let j = matchedRange.location - 2; j >= searchRange.location; j--) {
							if (config.wordSeparators.indexOf(string[j]) > -1) {
								score--;
							} else {
								score -= config.skippedScore;
							}
						}
					} else if (useSkipReduction &&
							config.uppercaseLetters.indexOf(string[matchedRange.location]) > -1) {
						for (let j = matchedRange.location - 1; j >= searchRange.location; j--) {
							if (config.uppercaseLetters.indexOf(string[j]) > -1) {
								score--;
							} else {
								score -= config.skippedScore;
							}
						}
					} else {
							// reduce the score by the number of chars we've
							// skipped since the beginning of the search range
						score -= matchedRange.location - searchRange.location;
						skippedSpecialChar = false;
					}
				}

				score += config.adjustRemainingScore(string,
					query, remainingScore, skippedSpecialChar, searchRange,
					remainingSearchRange, matchedRange, fullMatchedRange);
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
}


function getRangeOfSubstring(
	string,
	substring,
	searchRange = new Range(0, string.length))
{
	const stringToSearch = string.substring(searchRange.location, searchRange.max());
	const subStringIndex = stringToSearch.indexOf(substring);
	const result = new Range();

	if (subStringIndex > -1) {
		result.location = subStringIndex + searchRange.location;
		result.length = substring.length;
	}

	return result;
}
