# QuickScore

> `quick-score` is a JavaScript string-scoring and fuzzy-matching library based on the Quicksilver algorithm, designed for smart auto-complete.

[![Code Coverage][coverage-badge]][coverage]
[![Build Status][build-badge]][build]
[![Minzip Size][size-badge]][size]
[![MIT License][license-badge]][license]

QuickScore improves on the original Quicksilver algorithm by tuning the scoring for long strings, such as webpage titles or URLs, so that the order of the search results makes more sense.  It's used by the [QuicKey extension for Chrome](https://chrome.google.com/webstore/detail/quickey-%E2%80%93-the-quick-tab-s/ldlghkoiihaelfnggonhjnfiabmaficg) to enable users to easily find an open tab via search.

QuickScore is fast, dependency-free, and is just 2KB when minified and gzipped.


## Demo

[See QuickScore in action](https://fwextensions.github.io/quick-score-demo/), and compare its results to other scoring and matching libraries.


## Install

```sh
npm install --save quick-score
```

If you prefer to use the built library files directly instead of using `npm`, you can download them from [https://unpkg.com/browse/quick-score/dist/](https://unpkg.com/browse/quick-score/dist/).

Or you can load a particular release of the minified script directly from `unpkg.com`, and then access the library via the `quickScore` global:

```html
<script src="https://unpkg.com/quick-score@0.0.14/dist/quick-score.min.js"></script>
<script type="text/javascript">
    console.log(quickScore.quickScore("thought", "gh"));
</script>
```


## Usage

### Calling `quickScore()` directly

You can import the [`quickScore()`](https://fwextensions.github.io/quick-score/global.html#quickScore) function from the ES6 module:

```js
import {quickScore} from "quick-score";
```

Or from a property of the CommonJS module:

```js
const quickScore = require("quick-score").quickScore;
```

Then call `quickScore()` with a `string` and a `query` to score against that string.  It will return a floating point score between `0` and `1`.  A higher score means that string is a better match for the query.  A `1` means the query is the highest match for the string, though the two strings may still differ in case and whitespace characters.

```js
quickScore("thought", "gh");   // 0.4142857142857143
quickScore("GitHub", "gh");    // 0.9166666666666666
```

Matching `gh` against `GitHub` returns a higher score than `thought`, because it matches the capital letters in `GitHub`, which are weighted more highly.


### Sorting lists of strings with a `QuickScore` instance

A typical use-case for string scoring is auto-completion, where you want the user to get to the desired result by typing as few characters as possible.  Instead of calling `quickScore()` directly for every item in a list and then sorting it based on the score, it's simpler to use an instance of the [`QuickScore`](https://fwextensions.github.io/quick-score/QuickScore.html) class:

```js
import {QuickScore} from "quick-score";

const qs = new QuickScore(["thought", "giraffe", "GitHub", "hello, Garth"]);
const results = qs.search("gh");

// results =>
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
    // ...
]
```

The `results` array in this example is a list of [ScoredString](https://fwextensions.github.io/quick-score/global.html#ScoredString) objects that represent the results of matching the query against each string that was passed to the constructor.  It's sorted high to low on each item's score.  Strings with identical scores are sorted alphabetically and case-insensitively.  In the simple case of scoring bare strings, each `ScoredString` item has three properties:

* `item`: the string that was scored
* `score`: the floating point score of the string for the current query
* `matches`: an array of arrays that specify the character ranges where the query matched the string

This array could then be used to render a list of matching results as the user types a query.


### Sorting lists of objects

Typically, you'll be sorting items more complex than a bare string.  To tell QuickScore which of an object's keys to score a query against, pass an array of key names or dot-delimited paths as the second parameter to the `QuickScore()` constructor:

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
    // ...
];
const qs = new QuickScore(bookmarks, ["title", "url"]);
const results = qs.search("devel");

// results =>
[
    {
        "item": {
            "title": "Supplying Images - Google Chrome",
            "url": "developer.chrome.com/webstore/images"
        },
        "score": 0.9138888888888891,
        "scoreKey": "url",
        "scores": {
            "title": 0,
            "url": 0.9138888888888891
        },
        "matches": {
            "title": [],
            "url": [[0, 5]]
        }
    },
    // ...
]
```

When matching against objects, each item in the results array is a [ScoredObject](https://fwextensions.github.io/quick-score/global.html#ScoredObject), with a few additional properties :

* `item`: the object that was scored
* `score`: the highest score from among the individual key scores
* `scoreKey`: the name of the key with the highest score, which will be an empty string if they're all zero
* `scoreValue`: the value of the key with the highest score, which makes it easier to access if it's a nested string
* `scores`: a hash of the individual scores for each key
* `matches`: a hash of arrays that specify the character ranges of the query match for each key

When two items have the same score, they're sorted alphabetically and case-insensitively on the key specified by the `sortKey` option, which defaults to the first item in the keys array.  In the example above, that would be `title`.

Each `ScoredObject` item also has a `_` property, which caches transformed versions of the item's strings, and might contain additional internal metadata in the future.  It can be ignored.


### TypeScript support

Although the QuickScore codebase is currently written in JavaScript, the package comes with full TypeScript typings.  The QuickScore class takes a generic type parameter based on the type of objects in the `items` array passed to the constructor.  That way, you can access `.item` on the `ScoredObject` result and get back an object of the same type that you passed in.


### Ignoring diacritics and accents when scoring

If the strings you're matching against contain diacritics on some of the letters, like `à` or `ç`, you may want to count a match even when the query string contains the unaccented forms of those letters.  The QuickScore library doesn't contain support for this by default, since it's only needed with certain strings and the code to remove accents would triple its size.  But it's easy to combine  QuickScore with other libraries to ignore diacritics.

One example is the [latinize](https://github.com/dundalek/latinize) [npm package](https://www.npmjs.com/package/latinize), which will strip accents from a string and can be used in a `transformString()` function that's passed as an option to the [QuickScore constructor](https://fwextensions.github.io/quick-score/QuickScore.html#QuickScore).  This function takes a `string` parameter and returns a transformed version of that string:

```js
// including latinize.js on the page creates a global latinize() function
import {QuickScore} from "quick-score";

const items = ["Café", "Cafeteria"];
const qs = new QuickScore(items, { transformString: s => latinize(s).toLowerCase() });
const results = qs.search("cafe");

// results =>
[
    {
        "item": "Café",
        "score": 1,
        "matches": [[0, 4]],
        "_": "cafe"
    },
    // ...
]
```

`transformString()` will be called on each of the searchable keys in the `items` array as well as on the `query` parameter to the `search()` method.  The default function calls `toLocaleLowerCase()` on each string, for a case-insensitive search.  In the example above, the basic `toLowerCase()` call is sufficient, since `latinize()` will have already stripped any accents.


### Highlighting matched letters

Many search interfaces highlight the letters in each item that match what the user has typed.  The `matches` property of each item in the results array contains information that can be used to highlight those matching letters.

The functional component below is an example of how an item could be highlighted using React.  It surrounds each sequence of matching letters in a `<mark>` tag and then returns the full string in a `<span>`.  You could then style the `<mark>` tag to be bold or a different color to highlight the matches.  (Something similar could be done by concatenating plain strings of HTML tags, though you'll need to be careful to escape the substrings.)

```jsx
function MatchedString({ string, matches }) {
    const substrings = [];
    let previousEnd = 0;

    for (let [start, end] of matches) {
        const prefix = string.substring(previousEnd, start);
        const match = <mark>{string.substring(start, end)}</mark>;

        substrings.push(prefix, match);
        previousEnd = end;
    }

    substrings.push(string.substring(previousEnd));

    return <span>{React.Children.toArray(substrings)}</span>;
}
```

The [QuickScore demo](https://fwextensions.github.io/quick-score-demo/) uses this approach to highlight the query matches, via the [MatchedString](https://github.com/fwextensions/quick-score-demo/blob/master/src/js/MatchedString.js) component.


## API

See the [API docs](https://fwextensions.github.io/quick-score/) for a full description of the [QuickScore class](https://fwextensions.github.io/quick-score/QuickScore.html) and the [quickScore function](https://fwextensions.github.io/quick-score/global.html#quickScore).


## License

[MIT](./LICENSE) © [John Dunning](https://github.com/fwextensions)


[build-badge]: https://github.com/fwextensions/quick-score/actions/workflows/gh-pages.yml/badge.svg?style=flat-square
[build]: https://github.com/fwextensions/quick-score/actions/workflows/gh-pages.yml
[coverage-badge]: https://img.shields.io/codecov/c/github/fwextensions/quick-score.svg?style=flat-square
[coverage]: https://codecov.io/gh/fwextensions/quick-score
[dependencies-badge]: https://img.shields.io/hackage-deps/v/quick-score?style=flat-square
[dependencies]: https://www.npmjs.com/package/quick-score
[license-badge]: https://img.shields.io/npm/l/quick-score.svg?style=flat-square
[license]: https://github.com/fwextensions/quick-score/blob/master/LICENSE
[size-badge]: https://img.shields.io/bundlephobia/minzip/quick-score.svg?style=flat-square
[size]: https://www.npmjs.com/package/quick-score
[package-badge]: https://img.shields.io/npm/v/quick-score.svg?style=flat-square
[package]: https://www.npmjs.com/package/quick-score
