declare module "quick-score" {

type ScorerFunction = (string: string, query: string, matches?: [number, number][]) => number;

type TransformStringFunction = (string: string) => string;

type KeyName = string | string[];

type ItemKey = (KeyName | { name: KeyName, scorer: ScorerFunction });

interface Options {
	keys?: ItemKey[],
	sortKey?: string,
	minimumScore?: number,
	transformString?: TransformStringFunction,
	scorer?: ScorerFunction,
	config?: Config
}

interface StringResult {
	item: string,
	score: number,
	matches: RangeArray[],
}

interface ObjectResult<T> {
	item: T,
	score: number,
	scoreKey: string,
	scoreValue: string,
	scores: { [k: string]: number },
	matches: { [k: string]: number },
	_: unknown
}

type Result<T> = T extends string
	? StringResult
	: ObjectResult<T>;

/**
 * A class for scoring and sorting a list of items against a query string.  Each
 * item receives a floating point score between `0` and `1`.
 */
class QuickScore<T> {
	/**
	 * @param {Array<string|object>} [items]  The list of items to score.  If
	 * the list is not a flat array of strings, a `keys` array must be supplied
	 * via the second parameter.  The `items` array is not modified by QuickScore.
	 *
	 * @param {Array<ItemKey>|Options} [options]  If the `items` parameter
	 * is an array of flat strings, the `options` parameter can be left out.  If
	 * it is a list of objects containing keys that should be scored, the
	 * `options` parameter must either be an array of key names or an object
	 * containing a `keys` property.
	 *
	 * @param {Array<ItemKey>} [options.keys]  In the simplest case, an array of
	 * key names to score on the objects in the `items` array.
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
	 * @param {string} [options.sortKey=options.keys[0]]  An optional key name
	 * that will be used to sort items with identical scores.  Defaults to the
	 * name of the first item in the `keys` parameter.  If `sortKey` points to
	 * a nested key, use a dot-delimited string instead of an array to specify
	 * the path.
	 *
	 * @param {number} [options.minimumScore=0]  An optional value that
	 * specifies the minimum score an item must have to appear in the results
	 * returned from [search()]{@link QuickScore#search}.  Defaults to `0`,
	 * so items that don't match the full `query` will not be returned.  This
	 * value is ignored if the `query` is empty or undefined, in which case all
	 * items are returned, sorted alphabetically and case-insensitively on the
	 * `sortKey`, if any.
	 *
	 * @param {TransformStringFunction} [options.transformString]  An optional
	 * function that takes a `string` parameter and returns a transformed
	 * version of that string.  This function will be called on each of the
	 * searchable keys in the `items` array as well as on the `query`
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
	 * @param {ScorerFunction} [options.scorer]  An optional function that takes
	 * `string` and `query` parameters and returns a floating point number
	 * between 0 and 1 that represents how well the `query` matches the
	 * `string`.  It defaults to the [quickScore()]{@link quickScore} function
	 * in this library.
	 *
	 * If the function gets a third `matches` parameter, it should fill the
	 * passed-in array with indexes corresponding to where the query
	 * matches the string, as described in the [search()]{@link QuickScore#search}
	 * method.
	 *
	 * @param {Config} [options.config]  An optional object that is passed to
	 * the scorer function to further customize its behavior.  If the
	 * `scorer` function has a `createConfig()` method on it, the `QuickScore`
	 * instance will call that with the `config` value and store the result.
	 * This can be used to extend the `config` parameter with default values.
	 */
	constructor(
		items?: T[],
		options?: ItemKey[] | Options
	);

	/**
	 * Scores the instance's items against the `query` and sorts them from
	 * highest to lowest.
	 *
	 * @param {string} query  The string to score each item against.  The
	 * instance's `transformString()` function is called on this string before
	 * it's matched against each item.
	 *
	 * @returns {Array<StringResult|ObjectResult>} When the instance's `items`
	 * are flat strings, the result objects contain the following properties:
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
	search(query: string): Result<T>[];

	/**
	 * Sets the `keys` configuration.  `setItems()` must be called after
	 * changing the keys so that the items' transformed strings get cached.
	 *
	 * @param {Array<ItemKey>} keys  List of keys to score, as either strings
	 * or `{name, scorer}` objects.
	 *
	 * @param {string} [sortKey=keys[0]]  Name of key on which to sort
	 * identically scored items.  Defaults to the first `keys` item.
	 */
	setKeys(keys: ItemKey[], sortKey?: string): void;

	/**
	 * Sets the `items` array and caches a transformed copy of all the item
	 * strings specified by the `keys` parameter to the constructor, using the
	 * `transformString` option (which defaults to `toLocaleLowerCase()`).
	 *
	 * @param {T[]} items  List of items to score.
	 */
	setItems(items: T[]): void;
}


/**
 * A class representing a half-open interval of characters.  A range's `location`
 * property and `max()` value can be used as arguments for the `substring()`
 * method to extract a range of characters.
 */
class Range {
	/**
	 * @param {number} [location=-1] - Starting index of the range.
	 * @param {number} [length=0] - Number of characters in the range.
	 */
	constructor(location?: number, length?: number);

	location: number;
	length: number;

	/**
	 * Gets the end index of the range, which indicates the character
	 * immediately after the last one in the range.
	 *
	 * @returns {number}
	 */ /**
	* Sets the end index of the range, which indicates the character
	* immediately after the last one in the range.
	*
	* @param {number} [value] - End of the range.
	*
	* @returns {number}
	*/
	max(value?: number): number;

	/**
	 * Returns whether the range contains a location >= 0.
	 *
	 * @returns {boolean}
	 */
	isValid(): boolean;

	/**
	 * Returns an array of the range's start and end indexes.
	 *
	 * @returns {RangeArray}
	 */
	toArray(): RangeArray;

	/**
	 * Returns a string representation of the range's open interval.
	 *
	 * @returns {string}
	 */
	toString(): string;
}

type RangeArray = [number, number];


interface ConfigOptions {
	wordSeparators?: string,
	uppercaseLetters?: string,
	ignoredScore?: number,
	skippedScore?: number,
	emptyQueryScore?: number,
	maxIterations?: number,
}

interface QSConfigOptions extends ConfigOptions {
	longStringLength: number,
	maxMatchStartPct: number,
	minMatchDensityPct: number,
	maxMatchDensityPct: number,
	beginningOfStringPct: number
}

class Config {
	constructor(options: ConfigOptions);

	useSkipReduction(
		string: string,
		query: string,
		remainingScore: number,
		searchRange: Range,
		remainingSearchRange: Range,
		matchedRange: Range,
		fullMatchedRange: Range
	): boolean;

	adjustRemainingScore(
		string: string,
		query: string,
		remainingScore: number,
		skippedSpecialChar: boolean,
		searchRange: Range,
		remainingSearchRange: Range,
		matchedRange: Range,
		fullMatchedRange: Range
	): number;
}

class QuickScoreConfig extends Config { }

function createConfig(
	options: Config | ConfigOptions | QSConfigOptions
): Config;

const DefaultConfig: QuickScoreConfig;
const BaseConfig: Config;
const QuicksilverConfig: Config;


/**
 * Scores a string against a query.
 *
 * @param {string} string  The string to score.
 *
 * @param {string} query  The query string to score the `string` parameter against.
 *
 * @param {Array<RangeArray>} [matches]  If supplied, `quickScore()` will push onto
 * `matches` an array with start and end indexes for each substring range of
 * `string` that matches `query`.  These indexes can be used to highlight the
 * matching characters in an auto-complete UI.
 *
 * @param {string} [transformedString]  A transformed version of the string that
 * will be used for matching.  This defaults to a lowercase version of `string`,
 * but it could also be used to match against a string with all the diacritics
 * removed, so an unaccented character in the query would match an accented one
 * in the string.
 *
 * @param {string} [transformedQuery]  A transformed version of `query`.  The
 * same transformation applied to `transformedString` should be applied to this
 * parameter, or both can be left as `undefined` for the default lowercase
 * transformation.
 *
 * @param {object} [config]  A configuration object that can modify how the
 * `quickScore` algorithm behaves.
 *
 * @param {Range} [stringRange]  The range of characters in `string` that should
 * be checked for matches against `query`.  Defaults to the entire `string`
 * parameter.
 *
 * @returns {number}  A number between 0 and 1 that represents how well the
 * `query` matches the `string`.
 */
function quickScore(
	string: string,
	query: string,
	matches?: RangeArray[],
	transformedString?: string,
	transformedQuery?: string,
	config?: Config,
	stringRange?: Range
): number;

namespace quickScore {
	export { createConfig };
}

}
