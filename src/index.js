export {QuickScore} from "./QuickScore";
export {quickScore} from "./quick-score";
export * from "./config";
export {Range} from "./range";

/**
 * @typedef {Array<number, number>} RangeArray
 * @property {number} 0 - Location
 * @property {number} 1 - Max
 */

/**
 * @typedef {function(string, string, Array<RangeArray>?): number} ScorerFunction -
 * A function that takes `string` and `query` parameters and returns a floating
 * point number between 0 and 1 that represents how well the `query` matches the
 * `string`.  It defaults to the [quickScore()]{@link quickScore} function in
 * this library.
 *
 * If the function gets a third `matches` parameter, it should fill the passed-in
 * array with indexes corresponding to where the query matches the string, as
 * described in the [search()]{@link QuickScore#search} method.
 */

/**
 * @typedef {function(string): string} TransformStringFunction - A function that
 * takes a `string` parameter and returns a transformed version of that string.
 */

/**
 * @typedef {string|string[]} KeyName - A reference to an item's key to search.
 * The key names can point to a nested key by passing either a dot-delimited
 * string or an array of sub-keys that specify the path to the value.
 */

/**
 * @typedef {KeyName|{name: KeyName, scorer: ScorerFunction}} ItemKey - A
 * reference to an item's key to search.  This type can also include a custom
 * scoring function to use for the given key.
 */

/**
 * @typedef {object} Options - An object specifying various options that can
 * customize QuickScore's scoring behavior.
 * @property {Array<ItemKey>} [keys] - An array that specifies which keys to
 * search.
 * @property {string} [sortKey] - The name of the key that will be used to sort
 * items with identical scores.
 * @property {number} [minimumScore] - The minimum score an item must have to
 * appear in the results returned from `search()`.
 * @property {TransformStringFunction} [transformString] - A function that takes
 * a `string` parameter and returns a transformed version of that string.
 * @property {ScorerFunction} [scorer] - A function that takes `string` and
 * `query` parameters and returns a floating point number between 0 and 1 that
 * represents how well the `query` matches the `string`.
 * @property {Config} [config] - An object that is passed to the scorer function
 * to further customize its behavior.
 */

/**
 * @typedef {object} StringResult
 * @property {string} item - The string that was scored.
 * @property {number} score - The floating point score of the string for the
 * current query.
 * @property {RangeArray} matches - An array of arrays that specify the
 * character ranges where the query matched the string.
 */

/**
 * @typedef {object} ObjectResult
 * @property {object} item - The object that was scored.
 * @property {number} score - The highest score from among the individual key scores.
 * @property {string} scoreKey - The name of the key with the highest score,
 * which will be an empty string if they're all zero.
 * @property {string} scoreValue - The value of the key with the highest score,
 * which makes it easier to access if it's a nested string.
 * @property {object} scores - A hash of the individual scores for each key.
 * @property {object} matches - A hash of arrays that specify the character
 * ranges of the query match for each key.
 * @property {object} _ - An internal cache of the transformed versions of this
 * item's strings and other metadata, which can be ignored.
 */
