import {quickScore} from "./quick-score";


/**
 * A class for scoring and sorting a list of items against a query string.  Each
 * item receives a floating point score between `0` and `1`.
 */
export class QuickScore {
	/**
	 * @param {Array<string> | Array<object>} [items] - The list of items to
	 * score.  If the list is not a flat array of strings, a `keys` array must
	 * be supplied via the second parameter.  This array is not modified.
	 *
	 * @param {Array<string> | object} [options] - If the `items` parameter is
	 * an array of flat strings, the `options` parameter can be left out.  If
	 * it is a list of objects containing keys that should be scored, the
	 * `options` parameter must either be an array of key names or an object
	 * containing a `keys` property.
	 *
	 * @param {Array<string> | Array<{key: string, scorer: function}>} [options.keys] -
	 * In the simplest case, an array of key names to score on the objects
	 * in the `items` array. The first item in this array is considered the
	 * primary key, which is used to sort items when they have the same
	 * score. The keys should be top-level properties of the items to be scored.
	 *
	 * Each item in `keys` can instead be a `{key, scorer}` object, which
	 * lets you specify a different scoring function for each key. The
	 * scoring function should behave as described next.
	 *
	 * @param {function(string, string, array?, object?): number} [options.scorer] -
	 * An optional function that takes `string` and `query` parameters and
	 * returns a floating point number between 0 and 1 that represents how
	 * well the `query` matches the `string`.
	 *
	 * If the function gets a `matches` parameter, it should fill the
	 * passed in array with indexes corresponding to where the query
	 * matches the string, as described in the [search()]{@link QuickScore#search}
	 * method.
	 *
	 * @param {object} [options.config] - An optional object that can be passed
	 * to the scorer function to further customize it's behavior. If the
	 * `scorer` function has a `createConfig()` method on it, the `QuickScore`
	 * instance will call that with the `config` value and store the result.
	 * This can be used to extend the `config` parameter with default values.
	 */
	constructor(
		items = [],
		options = {})
	{
		let optionsValue = options;

		if (options instanceof Array) {
			optionsValue = { keys: options };
		}

		const {
			scorer = quickScore,
			keys = [],
			config
		} = optionsValue;

		this.scorer = scorer;
		this.config = config;

		if (typeof scorer.createConfig == "function") {
				// let the scorer fill out the config with default values
			this.config = scorer.createConfig(config);
		}

		this.setItems(items);
		this.setKeys(keys);

		this.compareScoredStrings = this.compareScoredStrings.bind(this);
	}


	/**
	 * Scores the instance's items against the `query` and sorts them from
	 * highest to lowest.
	 *
	 * @param {string} query - The string to score each item against.
	 *
	 * @returns {Array<object>} When the instance's `items` are flat strings,
	 * the result objects contain the following properties:
	 *
	 * - `item`: the string that was scored
	 * - `score`: the floating point score of the string for the current query
	 * - `matches`: an array of arrays that specifies the character ranges
	 *   where the query matched the string
	 *
	 * When the `items` are objects, the result objects contain:
	 *
	 * - `item`: the object that was scored
	 * - `score`: the highest score from among the individual key scores
	 * - `scoreKey`: the name of the key with the highest score, which will be
	 *   an empty string if they're all zero
	 * - `scores`: a hash of the individual scores for each key
	 * - `matches`: a hash of arrays that specify the character ranges of the
	 *   query match for each key
	 *
	 * The results array is sorted high to low on each item's score.  Items with
	 * identical scores are sorted alphabetically and case-insensitively.  Items
	 * with scores of zero are also returned in the array, sorted alphabetically
	 * at the end of the list.
	 *
	 * The arrays of start and end indices in the `matches` array can be used as
	 * parameters to the `substring()` method to extract the characters from
	 * each string that match the query.
	 */
	search(
		query)
	{
		const results = [];
		const {items, keys, config} = this;

		if (keys.length) {
			for (const item of items) {
				const result = {
					item: item,
					scores: {},
					matches: {}
				};
				let highScore = 0;
				let scoreKey = "";

					// find the highest score for each keyed string on this item
				for (const keyInfo of keys) {
					const matches = [];
					const {key} = keyInfo;
					const newScore = keyInfo.scorer(item[key], query, matches, config);

					result.scores[key] = newScore;
					result.matches[key] = matches;

					if (newScore > highScore) {
						highScore = newScore;
						scoreKey = key;
					}
				}

				result.score = highScore;
				result.scoreKey = scoreKey;
				results.push(result);
			}
		} else {
				// items is a flat array of strings
			for (const item of items) {
				const matches = [];
				const score = this.scorer(item, query, matches, config);

				results.push({
					item,
					score,
					matches
				});
			}
		}

		results.sort(this.compareScoredStrings);

		return results;
	}


	/**
	 * Sets the `keys` configuration.
	 *
	 * @param {Array<string> | Array<object>} keys - List of keys to score, as
	 * either flat strings or `{key, scorer}` objects.
	 */
	setKeys(
		keys)
	{
		this.keys = Array.from(keys);

		if (this.keys.length) {
			const {scorer} = this;

				// associate each key with the scorer function, if it isn't already
				/* eslint object-curly-spacing: 0, object-property-newline: 0 */
			this.keys = this.keys.map(key => (
				(typeof key !== "object") ? { key, scorer } : key
			));

			this.defaultKeyName = this.keys[0].key;
		} else {
				// defaultKeyName will be null if items is a flat array of
				// strings, which is handled in compareScoredStrings()
			this.defaultKeyName = null;
		}
	}


	/**
	 * Sets the `items` array.
	 *
	 * @param {Array<string> | Array<object>} items - List of items to score.
	 */
	setItems(
		items)
	{
		this.items = items;
	}


	compareScoredStrings(
		a,
		b)
	{
		const itemA = a.item;
		const itemB = b.item;
			// if there's no defaultKeyName, then item will be a string, so
			// fallback to lowercasing that
		const itemAString = typeof itemA == "string" ? itemA :
			itemA[this.defaultKeyName] || "";
		const itemBString = typeof itemB == "string" ? itemB :
			itemB[this.defaultKeyName] || "";

		if (a.score == b.score) {
			return itemAString && itemAString.toLocaleLowerCase() <
				itemBString.toLocaleLowerCase() ? -1 : 1;
		} else {
			return b.score - a.score;
		}
	}
}
