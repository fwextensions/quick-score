# quick-score

![travis](https://travis-ci.com/fwextensions/quick-score.svg?branch=quickscore-class) [![codecov](https://codecov.io/gh/fwextensions/quick-score/branch/quickscore-class/graph/badge.svg)](https://codecov.io/gh/fwextensions/quick-score)

> `quick-score` is a JavaScript string-scoring and fuzzy-matching library based on the Quicksilver algorithm, and is perfect for interactive matching as a user types a query.

intended for long strings
return matches in a "sensible" order


## Install

```sh
npm install --save quick-score
```


## Usage

You can import the `quickScore` function from a property of the CommonJS module:

```js
const quickScore = require("quick-score").quickScore;
```

Or as an ES6 module:

```js
import {quickScore} from "quick-score";
```



```js
quickScore("thought", "gh");   // 0.7000000000000001
quickScore("GitHub", "gh");    // 0.9166666666666666
```

```js
const scoreArray = require("quick-score").scoreArray;
```

```js
import {scoreArray} from "quick-score";

const strings = ["thought", "giraffe", "GitHub", "hello, Garth"];
const result = scoreArray(strings, "gh");

console.log(result); //
```


will modify array of strings passed in

always case-insensitive, uses `toLocaleLowerCase()`

first key in array is used for sorting strings with the same score


## License

MIT
