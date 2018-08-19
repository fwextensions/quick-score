/* eslint no-param-reassign: 0, object-curly-spacing: 0, object-property-newline: 0 */

import {quickScore} from "./quick-score";


export function createScorer(
	searchKeys,
	scorer = quickScore)
{
		// force keyNames to be an array, then associate each key with the score
		// function, if it isn't already
	const keys = [].concat(searchKeys || "string").map(key => (
		(typeof key != "object") ? { key, scorer } : key
	));
	const defaultKeyName = keys[0].key;


	function compareScoredStrings(
		a,
		b)
	{
		if (a.score == b.score) {
			return a[defaultKeyName].toLocaleLowerCase() < b[defaultKeyName].toLocaleLowerCase() ? -1 : 1;
		} else {
			return b.score - a.score;
		}
	}


	return function scoreArray(
		items,
		query)
	{
		if (items.length && !items[0].scores) {
			items = items.map(item => {
				if (typeof item == "string") {
					item = {
						[defaultKeyName]: item
					};
				}

				item.score = 0;
				item.scores = {};
				item.matches = {};

				for (const keyInfo of keys) {
					item.scores[keyInfo.key] = 0;
					item.matches[keyInfo.key] = [];
				}

				return item;
			});
		}

		for (const item of items) {
			let highScore = 0;
			let scoreKey = "";

				// find the highest score for each keyed string on this item
			for (const keyInfo of keys) {
				const matches = [];
				const {key} = keyInfo;
				const newScore = keyInfo.scorer(item[key], query, matches);

				item.scores[key] = newScore;
				item.matches[key] = matches;

				if (newScore > highScore) {
					highScore = newScore;
					scoreKey = key;
				}
			}

			item.score = highScore;
			item.scoreKey = scoreKey;
		}

		items.sort(compareScoredStrings);

		return items;
	};
}


export const scoreArray = createScorer();
