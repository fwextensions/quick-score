import {quickScore} from "./quick-score";


/**
 * A class for scoring and sorting a list of items against a query string.  Each
 * item receives a floating point score between `0` and `1`.
 */
export class QuickScore {
	/**
	 * @memberOf QuickScore.prototype
	 * @member {Array<object>} items - The array of items to search, which
	 * should only be modified via the [setItems()]{@link QuickScore#setItems}
	 * method.
	 * @readonly
	 */

	/**
	 * @memberOf QuickScore.prototype
	 * @member {Array<string|object>} keys - Array of keys to search.
	 * @readonly
	 */

	/**
	 * @param {Array<string|object>} [items] - The list of items to score.  If
	 * the list is not a flat array of strings, a `keys` array must be supplied
	 * via the second parameter.  The `items` array is not modified by QuickScore.
	 *
	 * @param {Array<string|object>|Options} [options] - If the `items` parameter
	 * is an array of flat strings, the `options` parameter can be left out.  If
	 * it is a list of objects containing keys that should be scored, the
	 * `options` parameter must either be an array of key names or an object
	 * containing a `keys` property.
	 *
	 * @param {Array<string|string[]|{name: string, scorer: function}>} [options.keys] -
	 * In the simplest case, an array of key names to score on the objects in
	 * the `items` array.
	 *
	 * The key names can point to a nested key by passing either a dot-delimited
	 * string or an array of sub-keys that specify the path to the value.  So a
	 * key `name` of `"foo.bar"` would evaluate to `"baz"` given an object like
	 * `{ foo: { bar: "baz" } }`.  Alternatively, that path could be passed as
	 * an array, like `["foo", "bar"]`.  In either case, if this sub-key's match
	 * produces the highest score for an item in the search results, its
	 * `scoreKey` name will be `"foo.bar"`.
	 *
	 * If your items have keys that contain periods, e.g., `"first.name"`, but
	 * you don't want these names to be treated as paths to nested keys, simply
	 * wrap the name in an array, like `{ keys: ["ssn", ["first.name"],
	 * ["last.name"]] }`.
	 *
	 * Instead of a string or string array, an item in `keys` can also be passed
	 * as a `{name, scorer}` object, which lets you specify a different scoring
	 * function for each key.  The scoring function should behave as described
	 * next.
	 *
	 * @param {string} [options.sortKey=options.keys[0]] - An optional key name
	 * that will be used to sort items with identical scores.  Defaults to the
	 * name of the first item in the `keys` parameter.  If `sortKey` points to
	 * a nested key, use a dot-delimited string instead of an array to specify
	 * the path.
	 *
	 * @param {number} [options.minimumScore=0] - An optional value that
	 * specifies the minimum score an item must have to appear in the results
	 * returned from [search()]{@link QuickScore#search}.  Defaults to `0`,
	 * so items that don't match the full `query` will not be returned.  This
	 * value is ignored if the `query` is empty or undefined, in which case all
	 * items are returned, sorted alphabetically and case-insensitively on the
	 * `sortKey`, if any.
	 *
	 * @param {TransformStringFunction} [options.transformString] -
	 * An optional function that takes a `string` parameter and returns a
	 * transformed version of that string.  This function will be called on each
	 * of the searchable keys in the `items` array as well as on the `query`
	 * parameter to the `search()` method.  The default function calls
	 * `toLocaleLowerCase()` on each string, for a case-insensitive search.  The
	 * result of this function is cached for each searchable key on each item.
	 *
	 * You can pass a function here to do other kinds of preprocessing, such as
	 * removing diacritics from all the strings or converting Chinese characters
	 * to pinyin.  For example, you could use the
	 * [`latinize`](https://www.npmjs.com/package/latinize) npm package to
	 * convert characters with diacritics to the base character so that your
	 * users can type an unaccented character in the query while still matching
	 * items that have accents or diacritics.  Pass in an `options` object like
	 * this to use a custom `transformString()` function:
	 * `{ transformString: s => latinize(s.toLocaleLowerCase()) }`
	 *
	 * @param {ScorerFunction} [options.scorer] -
	 * An optional function that takes `string` and `query` parameters and
	 * returns a floating point number between 0 and 1 that represents how
	 * well the `query` matches the `string`.  It defaults to the
	 * [quickScore()]{@link quickScore} function in this library.
	 *
	 * If the function gets a third `matches` parameter, it should fill the
	 * passed-in array with indexes corresponding to where the query
	 * matches the string, as described in the [search()]{@link QuickScore#search}
	 * method.
	 *
	 * @param {object} [options.config] - An optional object that can be passed
	 * to the scorer function to further customize its behavior.  If the
	 * `scorer` function has a `createConfig()` method on it, the `QuickScore`
	 * instance will call that with the `config` value and store the result.
	 * This can be used to extend the `config` parameter with default values.
	 */
	constructor(
		items = [],
		options = {})
	{
		const {
			scorer = quickScore,
			transformString = toLocaleLowerCase,
			keys = [],
			sortKey = "",
			minimumScore = 0,
			config
		} = Array.isArray(options)
			? { keys: options }
			: options;

		this.scorer = scorer;
		this.minimumScore = minimumScore;
		this.config = config;
		this.transformStringFunc = transformString;

		if (typeof scorer.createConfig === "function") {
				// let the scorer fill out the config with default values
			this.config = scorer.createConfig(config);
		}

		this.setKeys(keys, sortKey);
		this.setItems(items);

			// the scoring function needs access to this.sortKey
		this.compareScoredStrings = this.compareScoredStrings.bind(this);
	}


	/**
	 * Scores the instance's items against the `query` and sorts them from
	 * highest to lowest.
	 *
	 * @param {string} query - The string to score each item against.  The
	 * instance's `transformString()` function is called on this string before
	 * it's matched against each item.
	 *
	 * @returns {object[]} When the instance's `items` are flat strings,
	 * the result objects contain the following properties:
	 *
	 * - `item`: the string that was scored
	 * - `score`: the floating point score of the string for the current query
	 * - `matches`: an array of arrays that specify the character ranges
	 *   where the query matched the string
	 *
	 * When the `items` are objects, the result objects contain:
	 *
	 * - `item`: the object that was scored
	 * - `score`: the highest score from among the individual key scores
	 * - `scoreKey`: the name of the key with the highest score, which will be
	 *   an empty string if they're all zero
	 * - `scoreValue`: the value of the key with the highest score, which makes
	 *   it easier to access if it's a nested string
	 * - `scores`: a hash of the individual scores for each key
	 * - `matches`: a hash of arrays that specify the character ranges of the
	 *   query match for each key
	 *
	 * The results array is sorted high to low on each item's score.  Items with
	 * identical scores are sorted alphabetically and case-insensitively on the
	 * `sortKey` option.  Items with scores that are <= the `minimumScore` option
	 * (defaults to `0`) are not returned, unless the `query` is falsy, in which
	 * case all of the items are returned, sorted alphabetically.
	 *
	 * The arrays of start and end indices in the `matches` array can be used as
	 * parameters to the `substring()` method to extract the characters from
	 * each string that match the query.  This can then be used to format the
	 * matching characters with a different color or style.
	 *
	 * Each result item also has a `_` property, which caches transformed
	 * versions of the item's strings, and might contain additional internal
	 * metadata in the future.  It can be ignored.
	 */
	search(
		query)
	{
		const results = [];
		const {items, transformedItems, keys: sharedKeys, config} = this;
			// if the query is empty, we want to return all items, so make the
			// minimum score less than 0
		const minScore = query ? this.minimumScore : -1;
		const transformedQuery = this.transformString(query);
		const itemCount = items.length;
		const sharedKeyCount = sharedKeys.length;

		if (typeof items[0] === "string") {
				// items is an array of strings
			for (let i = 0; i < itemCount; i++) {
				const item = items[i];
				const transformedItem = transformedItems[i];
				const matches = [];
				const score = this.scorer(item, query, matches, transformedItem,
					transformedQuery, config);

				if (score > minScore) {
					results.push({
						item,
						score,
						matches,
						_: transformedItem
					});
				}
			}
		} else {
			for (let i = 0; i < itemCount; i++) {
				const item = items[i];
				const transformedItem = transformedItems[i];
				const result = {
					item,
					score: 0,
					scoreKey: "",
					scoreValue: "",
					scores: {},
					matches: {},
					_: transformedItem
				};
					// if an empty keys array was passed into the constructor,
					// score all of the non-empty string keys on the object
				const keys = sharedKeyCount ? sharedKeys : Object.keys(transformedItem);
				const keyCount = keys.length;
				let highScore = 0;
				let scoreKey = "";
				let scoreValue = "";

					// find the highest score for each keyed string on this item
				for (let j = 0; j < keyCount; j++) {
					const key = keys[j];
						// use the key as the name if it's just a string, and
						// default to the instance's scorer function
					const {name = key, scorer = this.scorer} = key;
					const transformedString = transformedItem[name];

						// setItems() checks for non-strings and empty strings
						// when creating the transformed objects, so if the key
						// doesn't exist there, we can skip the processing
						// below for this key in this item
					if (transformedString) {
						const string = this.getItemString(item, key);
						const matches = [];
						const newScore = scorer(string, query, matches,
							transformedString, transformedQuery, config);

						result.scores[name] = newScore;
						result.matches[name] = matches;

						if (newScore > highScore) {
							highScore = newScore;
							scoreKey = name;
							scoreValue = string;
						}
					}
				}

				if (highScore > minScore) {
					result.score = highScore;
					result.scoreKey = scoreKey;
					result.scoreValue = scoreValue;
					results.push(result);
				}
			}
		}

		results.sort(this.compareScoredStrings);

		return results;
	}


	/**
	 * Sets the `keys` configuration.  `setItems()` must be called after changing
	 * the keys so that the items' transformed strings get cached.
	 *
	 * @param {Array<string> | Array<object>} keys - List of keys to score, as
	 * either strings or `{name, scorer}` objects.
	 *
	 * @param {string} [sortKey=keys[0]] - Name of key on which to sort
	 * identically scored items.  Defaults to the first `keys` item.
	 */
	setKeys(
		keys,
		sortKey = "")
	{
			// create a shallow copy of the keys array so that changes to its
			// order outside of this instance won't affect searching
		this.keys = keys.slice(0);
		this.sortKey = sortKey;

		if (this.keys.length) {
			const {scorer} = this;

				// associate each key with the scorer function, if it isn't already
			this.keys = this.keys.map(keyItem => {
					// items in the keys array should either be a string or
					// array specifying a key name, or a { name, scorer } object
				const key = keyItem.length
					? { name: keyItem, scorer }
					: keyItem;

				if (Array.isArray(key.name)) {
					if (key.name.length > 1) {
						key.path = key.name;
						key.name = key.path.join(".");
					} else {
							// this path consists of just one key name, which was
							// probably wrapped in an array because it contains
							// dots but isn't intended as a key path.  so don't
							// create a path array on this key, so that we're not
							// constantly calling reduce() to get this one key.
						[key.name] = key.name;
					}
				} else if (key.name.indexOf(".") > -1) {
					key.path = key.name.split(".");
				}

				return key;
			});

			this.sortKey = this.sortKey || this.keys[0].name;
		}
	}


	/**
	 * Sets the `items` array and caches a transformed copy of all the item
	 * strings specified by the `keys` parameter to the constructor, using the
	 * `transformString` option (which defaults to `toLocaleLowerCase()`).
	 *
	 * @param {Array<string|object>} items - List of items to score.
	 */
	setItems(
		items)
	{
			// create a shallow copy of the items array so that changes to its
			// order outside of this instance won't affect searching
		const itemArray = items.slice(0);
		const itemCount = itemArray.length;
		const transformedItems = [];
		const sharedKeys = this.keys;
		const sharedKeyCount = sharedKeys.length;

		if (typeof itemArray[0] === "string") {
			for (let i = 0; i < itemCount; i++) {
				transformedItems.push(this.transformString(itemArray[i]));
			}
		} else {
			for (let i = 0; i < itemCount; i++) {
				const item = itemArray[i];
				const transformedItem = {};
				const keys = sharedKeyCount ? sharedKeys : Object.keys(item);
				const keyCount = keys.length;

				for (let j = 0; j < keyCount; j++) {
					const key = keys[j];
					const string = this.getItemString(item, key);

					if (string && typeof string === "string") {
						transformedItem[key.name || key] =
							this.transformString(string);
					}
				}

				transformedItems.push(transformedItem);
			}
		}

		this.items = itemArray;
		this.transformedItems = transformedItems;
	}


	/**
	 * Gets an item's key, possibly at a nested path.
	 *
	 * @private
	 * @param {object} item - An object with multiple string properties.
	 * @param {object|string} key - A key object with
	 * the name of the string to get from `item`, or a plain string when all
	 * keys on an item are being matched.
	 * @returns {string}
	 */
	getItemString(
		item,
		key)
	{
		const {name, path} = key;

		if (path) {
			return path.reduce((value, prop) => value && value[prop], item);
		} else {
				// if this instance is scoring all the keys on each item, key
				// will just be a string, not a { name, scorer } object
			return item[name || key];
		}
	}


	/**
	 * Transforms a string into a canonical form for scoring.
	 *
	 * @private
	 * @param {string} string - The string to transform.
	 * @returns {string}
	 */
	transformString(
		string)
	{
		return this.transformStringFunc(string);
	}


	/**
	 * Compares two items based on their scores, or on their `sortKey` if the
	 * scores are identical.
	 *
	 * @private
	 * @param {object} a - First item.
	 * @param {object} b - Second item.
	 * @returns {number}
	 */
	compareScoredStrings(
		a,
		b)
	{
			// use the transformed versions of the strings for sorting
		const itemA = a._;
		const itemB = b._;
		const itemAString = typeof itemA === "string"
			? itemA
			: itemA[this.sortKey];
		const itemBString = typeof itemB === "string"
			? itemB
			: itemB[this.sortKey];

		if (a.score === b.score) {
				// sort undefineds to the end of the array, as per the ES spec
			if (itemAString === undefined || itemBString === undefined) {
				if (itemAString === undefined && itemBString === undefined) {
					return 0;
				} else if (itemAString === undefined) {
					return 1;
				} else {
					return -1;
				}
			} else if (itemAString === itemBString) {
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


/**
 * Default function for transforming each string to be searched.
 *
 * @private
 * @param {string} string - The string to transform.
 * @returns {string} The transformed string.
 */
function toLocaleLowerCase(
	string)
{
	return string.toLocaleLowerCase();
}
