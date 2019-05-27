# QuickScore

> `quick-score` is a JavaScript string-scoring and fuzzy-matching library based on the Quicksilver algorithm, designed for smart auto-complete.

[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![Dependencies][dependencies-badge]][dependencies]
[![Minzip Size][size-badge]][size]
[![MIT License][license-badge]][license]
<!--[![Package][package-badge]][package]-->

QuickScore improves on the original Quicksilver algorithm by tuning the scoring for long strings, such as webpage titles or URLs, so that the order of the search results makes more sense.  It's used by the [QuicKey extension for Chrome](https://chrome.google.com/webstore/detail/quickey-%E2%80%93-the-quick-tab-s/ldlghkoiihaelfnggonhjnfiabmaficg) to enable users to easily find an open tab via search.

QuickScore is fast, dependency-free, and is less than 2KB when minified and gzipped.


## Demo

[See QuickScore in action](https://fwextensions.github.io/quick-score-demo/), and compare its results to other scoring and matching libraries.


## Install

```sh
npm install --save quick-score
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

You can then call `quickScore()` with a `string` and a `query` to score against that string.  It will return a floating point score between `0` and `1`.  A higher score means that string is a better match for the query.  A `1` means the query is the highest match for the string, though the two strings may still differ in case and whitespace characters.

```js
quickScore("thought", "gh");   // 0.7000000000000001
quickScore("GitHub", "gh");    // 0.9166666666666666
```

Matching `gh` against `GitHub` returns a higher score than `thought`, because it matches the capital letters in `GitHub`, which are weighted more highly.


### Sorting lists of strings with a `QuickScore` instance

A typical use-case for string scoring is auto-completion, where you want the user to get to the desired result by typing as few characters as possible.  Instead of calling `quickScore()` directly for every item in a list and then sorting it based on the score, it's simpler to use an instance of the [`QuickScore`](https://fwextensions.github.io/quick-score/QuickScore.html) class:

```js
import {QuickScore} from "quick-score";

const qs = new QuickScore(["thought", "giraffe", "GitHub", "hello, Garth"]);
const results = qs.search("gh");

//=>
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

The `results` array is a list of objects that represent the results of matching the query against each string that was passed to the constructor.  It's sorted high to low on each item's score.  Strings with identical scores are sorted alphabetically and case-insensitively.  In the simple case of scoring bare strings, each item in the results array has three properties:

* `item`: the string that was scored
* `score`: the floating point score of the string for the current query
* `matches`: an array of arrays that specifies the character ranges where the query matched the string

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
    ...
];
const qs = new QuickScore(bookmarks, ["title", "url"]);
const results = qs.search("devel");

//=>
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

This function is an example of how an item could be highlighted using React.  It surrounds each sequence of matching letters in a `<mark>` tag and then returns the full string in a `<span>`.  You could then style the `<mark>` tag to be bold or a different color to highlight the matches.  (Something similar could be done by concatenating plain strings of HTML tags, though you'll need to be careful to escape the substrings.)

```jsx
function highglight(string, matches) {
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

The [QuickScore demo](https://fwextensions.github.io/quick-score-demo/) uses this approach to highlight the matches, via the [MatchedString](https://github.com/fwextensions/quick-score-demo/blob/master/src/js/MatchedString.js) component.


## API

See the [API docs](https://fwextensions.github.io/quick-score/) for a full description of the [QuickScore class](https://fwextensions.github.io/quick-score/QuickScore.html) and the [quickScore function](https://fwextensions.github.io/quick-score/global.html#quickScore).


## License

[MIT](./LICENSE) © [John Dunning](https://github.com/fwextensions)


[build-badge]: https://img.shields.io/travis/com/fwextensions/quick-score.svg?style=flat-square
[build]: https://travis-ci.com/fwextensions/quick-score
[coverage-badge]: https://img.shields.io/codecov/c/github/fwextensions/quick-score.svg?style=flat-square 
[coverage]: https://codecov.io/gh/fwextensions/quick-score
[dependencies-badge]: https://img.shields.io/david/fwextensions/quick-score.svg?style=flat-square
[dependencies]: https://www.npmjs.com/package/quick-score
[license-badge]: https://img.shields.io/npm/l/quick-score.svg?style=flat-square
[license]: https://github.com/fwextensions/quick-score/blob/master/LICENSE
[size-badge]: https://img.shields.io/bundlephobia/minzip/quick-score.svg?style=flat-square
[size]: https://www.npmjs.com/package/quick-score
[package-badge]: https://img.shields.io/npm/v/quick-score.svg?style=flat-square
[package]: https://www.npmjs.com/package/quick-score
