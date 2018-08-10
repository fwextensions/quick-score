/* eslint no-param-reassign: 0, object-curly-spacing: 0, object-property-newline: 0 */

export default function createScorer(
	score,
	searchKeyInfo)
{
		// force keyNames to be an array, then associate each key with the score
		// function, if it isn't already
	const keys = [].concat(searchKeyInfo || "string").map(key => (
		(typeof key != "object") ? { key, score } : key
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
				// find the highest score for each keyed string on this item
			item.score = keys.reduce((currentScore, keyInfo) => {
				const hits = [];
				const {key} = keyInfo;
				const newScore = keyInfo.score(item[key], query, hits);

				item.scores[key] = newScore;
				item.hits[key] = hits;

				return Math.max(currentScore, newScore);
			}, 0);
		}

		items.sort(compareScoredStrings);

		return items;
	};
}
