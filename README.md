# QuickScore

![travis](https://travis-ci.com/fwextensions/quick-score.svg) [![codecov](https://codecov.io/gh/fwextensions/quick-score/graph/badge.svg)](https://codecov.io/gh/fwextensions/quick-score)

> `quick-score` is a JavaScript string-scoring and fuzzy-matching library based on the Quicksilver algorithm, and is ideal for interactive matching as a user types a query.

intended for long strings
return matches in a "sensible" order
2.85KB minified and gzipped
used by the [QuicKey extension for Chrome](https://chrome.google.com/webstore/detail/quickey-%E2%80%93-the-quick-tab-s/ldlghkoiihaelfnggonhjnfiabmaficg) for quickly searching through the open tabs


## Install

```sh
npm install --save quick-score
```


## Usage

### Calling `quickScore()` directly

You can import the `quickScore` function as an ES6 module

```js
import {quickScore} from "quick-score";
```

Or from a property of the CommonJS module:

```js
const quickScore = require("quick-score").quickScore;
```

You can then call `quickScore()` with a `string` and a `query` to score against that string.  It will return a floating point score between `0` and `1`.  A higher score means that string is a better match for the query.  A `1` means the string and the query are identical.

```js
quickScore("thought", "gh");   // 0.7000000000000001
quickScore("GitHub", "gh");    // 0.9166666666666666
```

Matching `gh` against `GitHub` returns a higher score than `thought`, because it matches the capital letters in `GitHub`, which are weighted more highly.


### Sorting lists of strings with a `QuickScore` instance

A common use-case is sorting and filtering lists of items in real time as the user types a query.  Instead of calling `quickScore()` directly for every item in the list and then sorting, it's simpler to use an instance of the `QuickScore` class:

```js
import {QuickScore} from "quick-score";

const qs = new QuickScore(["thought", "giraffe", "GitHub", "hello, Garth"]);
const results = qs.search("gh");

//->
[
    {
        "item": "GitHub",
        "score": 0.9166666666666666,
        "matches": [[0, 1], [3, 4]]
    },
    {
        "item": "hello, Garth",
        "score": 0.6263888888888888,
        "matches": [[7, 8], [11, 12]]
    },
    ...
```

The `results` array is a list of objects that represent the results of matching the query against each string that was passed to the constructor.  It's sorted high to low on each item's score.  Strings with identical scores are sorted alphabetically and case-insensitively.  In the simple case of scoring bare strings, each item has three properties:

* `item`: the string that was scored
* `score`: the floating point score of the string for the current query
* `matches`: an array of arrays that specifies the character ranges where the query matched the string

This array could then be used to render a list of matching results as the user types a query.  By default, items with scores of zero are returned in the array.


### Sorting lists of objects

Typically, you'll be sorting items more complex than a bare string.  To tell QuickScore which of an object's keys to score a query against, pass an array of keys as the second parameter to the `QuickScore()` constructor:

```js
const bookmarks = [
    {
        "title": "lodash documentation",
        "url": "https://lodash.com/docs"
    },
    {
        "title": "Supplying Images - Google Chrome",
        "url": "developer.chrome.com/webstore/images"
    },
    ...
];
const qs = new QuickScore(bookmarks, ["title", "url"]);
const results = qs.search("devel");

//->
[
    {
        "item": {
            "title": "Supplying Images - Google Chrome",
            "url": "developer.chrome.com/webstore/images"
        },
        "scores": {
            "title": 0,
            "url": 0.9138888888888891
        },
        "matches": {
            "title": [],
            "url": [[0, 5]]
        },
        "score": 0.9138888888888891,
        "scoreKey": "url"
    },
    ...
```

Each item in the results array has a few more properties when matching against objects:

* `item`: the object that was scored
* `score`: the highest score from among the individual key scores
* `scoreKey`: the name of the key with the highest score, which will be an empty string if they're all zero
* `scores`: a hash of the individual scores for each key
* `matches`: a hash of arrays that specify the character ranges of the query match for each key

When two items have the same score, they're sorted alphabetically and case-insensitively on the first key in the keys array.  In the example above, that would be `title`.


### Highlighting matched letters

Many search interfaces highlight the letters in each item that match what the user has typed.  The `matches` property of each item in the results array contains information that can be used to highlight those matching letters.

This function is an example of how an item could be highlighted using React.  It surrounds each sequence of matching letters in a `<strong>` tag to make them bold and then returns the full string in a `<span>`.  (Something similar could be done by concatenating plain strings of HTML tags, though you'll need to be careful to escape the substrings.)

```js
function highglight(string, matches) {
    const substrings = [];
    let previousEnd = 0;

    for (let [start, end] of matches) {
        const prefix = string.substring(previousEnd, start);
        const match = <strong>{string.substring(start, end)}</strong>;

        substrings.push(prefix, match);
        previousEnd = end;
    }

    substrings.push(string.substring(previousEnd));

    return <span>{React.Children.toArray(substrings)}</span>;
}
```


## API

### new QuickScore(items, [options])

Returns a `QuickScore` instance that can be used to score the strings or objects in the `items` array.


* `items` : Array

    An array of strings or objects containing strings that will be scored against a query.  The `items` array is not modified by QuickScore.


* `options` : Array or Object

    If the `items` parameter is an array of flat strings, the `options` parameter can be left out.  If it is a list of objects containing keys that should be scored, the `options` parameter should either be an array of key names or an object containing a `keys` property.

    If `options` is an object, it can contain include the following optional keys:

    * `keys`: In the simplest case, an array of key names to score on the objects in the `items` array.  The first item in this array is considered the primary key, which is used to sort items when they have the same score.  The keys should be top-level properties of the items to be scored.

        Each key item can instead be an object containing `key` and `scorer` properties, which lets you specify a different scoring function for each key.  The scoring function should behave as described next.

    * `scorer`: An optional function with the signature `fn(string, query, [matches], [config])`.  Given `string` and `query` parameters, the function should return a floating point number between `0` and `1` that represents how well the `query` matches the `string`.

        If the function takes the `matches` parameter, it should fill the passed in array with indexes corresponding to where the `query` matches the `string`, as described in the `search()` method below.

    * `config`: An optional object that can be passed to the `scorer` function to further customize it's behavior.  If the `scorer` function has a `createConfig()` method on it, the `QuickScore` instance will call that with the `config` value and store the result.  This can be used to extend the `config` parameter with default values.


#### .search(query)

Returns an array of results that include the score of each item for the given `query` string.  When the instance's `items` are flat strings, the result objects contain:

* `item`: the string that was scored
* `score`: the floating point score of the string for the current query
* `matches`: an array of arrays that specifies the character ranges where the query matched the string

When the `items` are objects, the result objects contain:

* `item`: the object that was scored
* `score`: the highest score from among the individual key scores
* `scoreKey`: the name of the key with the highest score, which will be an empty string if they're all zero
* `scores`: a hash of the individual scores for each key
* `matches`: a hash of arrays that specify the character ranges of the query match for each key

The results array is sorted high to low on each item's score.  Items with identical scores are sorted alphabetically and case-insensitively.  Items with scores of zero are returned in the array, sorted to the end.


* `query` : String

    The string to score each item against.


#### .setItems(items)

Updates a `QuickScore` instance with a new list of items to score.  Changing the items without calling this method may lead to unpredictable results.

* `items` : Array

    The new list of items to score.


#### .setKeys(keys)

Updates a `QuickScore` instance with a new list of keys to score.

* `keys` : Array

    The new list of keys to score on each object.


## Algorithm

returns highest score, because averaging usually doesn't make sense

setItems()
setKeys()
doesn't modify items array

algorithm discounts sparse matches, matches later in the string, very long strings
always case-insensitive, uses `toLocaleLowerCase()`

searching `jqu` shows all the jquery results in QS, but fuzzy matches push others down in the Fuse results
searching `real` shows relevant "realtime" QS results, but crazy Fuse results.  RethinkDB is 5 pages down
or `reake` shows react key down on second page
fuse search `jqz` doesn't put jQuery Zoom first, matches against a random z in param
`libr` when using Quicksilver algo doesn't list a lot of library items at the top
accidentally typing `zom` instead of `zoom` still puts `jQuery Zoom` at the top with QuickScore, but fuzzysort matches `phonegap.com`, since the letters are in the long token at the end
lowering the threshold reduces some of the noise, but then may miss reasonable matches
QuicKey doesn't notice recently opened tabs?
stop rescoring on every render, memoize may work now
enable per-key configs


## License

[MIT](./LICENSE) © John Dunning
