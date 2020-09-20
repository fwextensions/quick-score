import {quickScore} from "./quick-score";


/**
 * A class for scoring and sorting a list of items against a query string.  Each
 * item receives a floating point score between `0` and `1`.
 */
export class QuickScore {
	/**
	 * @param {Array<string> | Array<object>} [items] - The list of items to
	 * score.  If the list is not a flat array of strings, a `keys` array must
	 * be supplied via the second parameter.  The `items` array is not modified
	 * by QuickScore.
	 *
	 * @param {Array<string> | object} [options] - If the `items` parameter is
	 * an array of flat strings, the `options` parameter can be left out.  If
	 * it is a list of objects containing keys that should be scored, the
	 * `options` parameter must either be an array of key names or an object
	 * containing a `keys` property.
	 *
	 * @param {Array<string> | Array<{name: string, scorer: function}>} [options.keys] -
	 * In the simplest case, an array of key names to score on the objects
	 * in the `items` array.  The first item in this array is considered the
	 * primary key, which is used to sort items when they have the same
	 * score.  The key name strings can point to a nested key by specifying a
	 * dot-delimited path to the value.  So a key `name` of `"foo.bar"` would
	 * evaluate to `"baz"` given an object like `{ foo: { bar: "baz" } }`.
	 *
	 * Each item in `keys` can instead be a `{name, scorer}` object, which
	 * lets you specify a different scoring function for each key.  The
	 * scoring function should behave as described next.
	 *
	 * @param {function(string, string, array?): number} [options.scorer] -
	 * An optional function that takes `string` and `query` parameters and
	 * returns a floating point number between 0 and 1 that represents how
	 * well the `query` matches the `string`.  It defaults to the
	 * [quickScore()]{@link quickScore} function in this library.
	 *
	 * If the function gets a `matches` parameter, it should fill the
	 * passed in array with indexes corresponding to where the query
	 * matches the string, as described in the [search()]{@link QuickScore#search}
	 * method.
	 *
	 * @param {function(string): string} [options.preprocessString] -
	 * An optional function that takes a `string` parameter and returns a
	 * processed version of that string.  This function will be called on all of
	 * the searchable keys in the `items` array as well as on the `query`
	 * parameter to the `search()` method.  The default function calls
	 * `toLocaleLowerCase()` on each string, for a case-insensitive search.
	 *
	 * You can pass a function here to do other kinds of preprocessing, such as
	 * removing diacritics from all the strings or converting Chinese characters
	 * to pinyin.  For example, you could use the `latinize` npm package to
	 * convert characters with diacritics to the base character so that your
	 * users can type an unaccented character in the query while still matching
	 * items that have accents or diacritics:
	 * `{ preprocessString: s => latinize(s.toLocaleLowerCase()) }`
	 *
	 * @param {object} [options.config] - An optional object that can be passed
	 * to the scorer function to further customize it's behavior.  If the
	 * `scorer` function has a `createConfig()` method on it, the `QuickScore`
	 * instance will call that with the `config` value and store the result.
	 * This can be used to extend the `config` parameter with default values.
	 *
	 * @param {number} [options.minimumScore=0] - An optional value that
	 * specifies the minimum score an item must have to appear in the results
	 * array returned from [search()]{@link QuickScore#search}.  Defaults to `0`,
	 * so items that don't match the full `query` will not be returned.  This
	 * value is ignored if the `query` is empty or undefined, in which case all
	 * items are returned, sorted alphabetically and case-insensitively.
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
			preprocessString = this.preprocessString,
			keys = [],
			minimumScore = 0,
			config
		} = optionsValue;

		this.scorer = scorer;
		this.minimumScore = minimumScore;
		this.config = config;
		this.preprocessString = preprocessString;

		if (typeof scorer.createConfig == "function") {
				// let the scorer fill out the config with default values
			this.config = scorer.createConfig(config);
		}

		this.setKeys(keys);
		this.setItems(items);

			// the scoring function needs access to this.defaultKeyName
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
	 * identical scores are sorted alphabetically and case-insensitively on the
	 * primary key.  Items with scores that are <= the `minimumScore` option
	 * (defaults to `0`) are not returned, unless the `query` is falsy, in which
	 * case all of the items are returned, sorted alphabetically.
	 *
	 * The arrays of start and end indices in the `matches` array can be used as
	 * parameters to the `substring()` method to extract the characters from
	 * each string that match the query.  This can then be used to format the
	 * matching characters with a different color or style.
	 *
	 * Each result item also contains a `_` property, which contains lowercase
	 * versions of the item's strings, and might contain additional internal
	 * metadata in the future.  It can be ignored.
	 */
	search(
		query)
	{
		const results = [];
		const {items, lcItems, keys, config} = this;
			// if the query is empty, we want to return all items, so make the
			// minimum score less than 0
		const minScore = query ? this.minimumScore : -1;
		const lcQuery = this.preprocessString(query);

		if (keys.length) {
			for (let i = 0, len = items.length; i < len; i++) {
				const item = items[i];
				const lc = lcItems[i];
				const result = {
					item,
					score: 0,
					scoreKey: "",
					scores: {},
					matches: {},
					_: lc
				};
				let highScore = 0;
				let scoreKey = "";

					// find the highest score for each keyed string on this item
				for (let j = 0, jlen = keys.length; j < jlen; j++) {
					const key = keys[j];
					const {name} = key;
					const lcString = lc[name];

						// setItems() checks for non-strings and empty strings
						// when creating the lc objects, so if the key doesn't
						// exist there, we can ignore it for this item
					if (lcString) {
						const string = this.getItemString(item, key);
						const matches = [];
						const newScore = key.scorer(string, query, matches,
							lcString, lcQuery, config);

						result.scores[name] = newScore;
						result.matches[name] = matches;

						if (newScore > highScore) {
							highScore = newScore;
							scoreKey = name;
						}
					}
				}

				if (highScore > minScore) {
					result.score = highScore;
					result.scoreKey = scoreKey;
					results.push(result);
				}
			}
		} else {
				// items is a flat array of strings
			for (let i = 0, len = items.length; i < len; i++) {
				const item = items[i];
				const lc = lcItems[i];
				const matches = [];
				const score = this.scorer(item, query, matches, lc, lcQuery, config);

				if (score > minScore) {
					results.push({
						item,
						score,
						matches,
						_: lc
					});
				}
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
			this.keys = this.keys.map(keyItem => {
				const key = (typeof keyItem == "string") ?
					{ name: keyItem, scorer } : keyItem;

				if (key.name.indexOf(".") > -1) {
					key.path = key.name.split(".");
				}

				return key;
			});
			this.defaultKeyName = this.keys[0].name;
		} else {
				// defaultKeyName will be null if items is a flat array of
				// strings, which is handled in compareScoredStrings()
			this.defaultKeyName = null;
		}
	}


	/**
	 * Sets the `items` array and caches a lowercase copy of all the item
	 * strings specified by the `keys` parameter to the constructor.
	 *
	 * @param {Array<string> | Array<object>} items - List of items to score.
	 */
	setItems(
		items)
	{
		const {keys} = this;
		const lcItems = [];

		this.items = items;
		this.lcItems = lcItems;

		if (keys.length) {
			for (let i = 0, len = items.length; i < len; i++) {
				const item = items[i];
				const lc = {};

				for (let j = 0, jlen = keys.length; j < jlen; j++) {
					const key = keys[j];
					const string = this.getItemString(item, key);

					if (string && typeof string === "string") {
						lc[key.name] = this.preprocessString(string);
					}
				}

				lcItems.push(lc);
			}
		} else {
			for (let i = 0, len = items.length; i < len; i++) {
				lcItems.push(this.preprocessString(items[i]));
			}
		}
	}


	getItemString(
		item,
		key)
	{
		const {name, path} = key;

		if (path) {
			return path.reduce((value, prop) => value && value[prop], item);
		} else {
			return item[name];
		}
	}


	preprocessString(
		string)
	{
		return string.toLocaleLowerCase();
	}


	compareScoredStrings(
		a,
		b)
	{
			// use the lowercase versions of the strings for sorting
		const itemA = a._;
		const itemB = b._;
		const itemAString = typeof itemA === "string" ? itemA :
			itemA[this.defaultKeyName];
		const itemBString = typeof itemB === "string" ? itemB :
			itemB[this.defaultKeyName];

		if (a.score == b.score) {
				// sort undefineds to the end of the array, as per the ES spec
			if (itemAString === undefined || itemBString === undefined) {
				if (itemAString === undefined && itemBString === undefined) {
					return 0;
				} else if (itemAString == undefined) {
					return 1;
				} else {
					return -1;
				}
			} else if (itemAString == itemBString) {
				return 0;
			} else if (itemAString < itemBString) {
				return -1;
			} else {
				return 1;
			}
		} else {
			return b.score - a.score;
		}
	}
}
