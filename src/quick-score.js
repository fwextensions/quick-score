import {Range} from "./range";
import {createConfig, DefaultConfig} from "./config";


/**
 * Scores a string against a query.
 *
 * @param {string} string - The string to score.
 *
 * @param {string} query - The query string to score the `string` parameter against.
 *
 * @param {Array} [matches] - If supplied, the `quickScore()` will push
 * onto `matches` an array with start and end indexes for each substring range
 * of `string` that matches `query`.  These indexes can be used to highlight the
 * matching characters in an auto-complete UI.
 *
 * @param {string} [lcString] - A lowercase version of `string`.
 *
 * @param {string} [lcQuery] - A lowercase version of `query`.
 *
 * @param {object} [config] - A configuration object that can modify how the
 * `quickScore` algorithm behaves.
 *
 * @param {Range} [stringRange] - The range of characters in `string` that should
 * be checked for matches against `query`.  Defaults to all of the `string`
 * parameter.
 *
 * @returns {number}
 */
export function quickScore(
	string = "",
	query = "",
	matches,
	lcString = string.toLocaleLowerCase(),
	lcQuery = query.toLocaleLowerCase(),
	config = DefaultConfig,
	stringRange = new Range(0, string.length))
{
	if (!query) {
		return config.emptyQueryScore;
	}

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

		const initialMatchesLength = matches && matches.length;

		for (let i = queryRange.length; i > 0; i--) {
			const querySubstring = lcQuery.substring(queryRange.location, queryRange.location + i);
				// reduce the length of the search range by the number of chars
				// we're skipping in the query, to make sure there's enough string
				// left to possibly contain the skipped chars
			const matchedRange = getRangeOfSubstring(lcString, querySubstring,
				new Range(searchRange.location, searchRange.length - queryRange.length + i));

			if (!matchedRange.isValid()) {
					// we didn't find the query substring, so try again with a
					// shorter substring
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
				let score = remainingSearchRange.location - searchRange.location;
					// default to true since we only want to apply a discount if
					// we hit the final else clause below, and we won't get to
					// any of them if the match is right at the start of the
					// searchRange
				let skippedSpecialChar = true;
				const useSkipReduction = config.useSkipReduction(string, query,
					remainingScore, remainingSearchRange, searchRange,
					remainingSearchRange, matchedRange, fullMatchedRange);

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
			} else if (matches) {
					// the remaining query does not appear in the remaining
					// string, so strip off any matches we've added during the
					// current call, as they'll be invalid when we start over
					// with a shorter piece of the query
				matches.length = initialMatchesLength;
			}
		}

		return 0;
	}
}

	// make createConfig() available on quickScore so that the QuickScore
	// constructor has access to it
quickScore.createConfig = createConfig;


function getRangeOfSubstring(
	string,
	substring,
	searchRange)
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
