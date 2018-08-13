/* eslint no-param-reassign: 0, object-curly-spacing: 0, object-property-newline: 0 */

import quickScore from "./quick-score";


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
				item.hits = {};

				for (const keyInfo of keys) {
					item.scores[keyInfo.key] = 0;
					item.hits[keyInfo.key] = [];
				}

				return item;
			});
		}

		for (const item of items) {
			let highScore = 0;
			let scoreKey = "";

				// find the highest score for each keyed string on this item
			for (let keyInfo of keys) {
				const hits = [];
				const {key} = keyInfo;
				const newScore = keyInfo.scorer(item[key], query, hits);

				item.scores[key] = newScore;
				item.hits[key] = hits;

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


export default createScorer();
