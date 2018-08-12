# quick-score

> `quick-score` is a JavaScript string-scoring and fuzzy-matching library based on the Quicksilver algorithm, which is intended for interactive matching as a user types a query.

intended for long strings
return matches in a "sensible" order


## Install

```sh
npm install --save quick-score
```


## Usage

You can import the libray as a CommonJS module:

```js
const quickScore = require("quick-score");
```

Or as an ES6 module:

```js
import quickScore from "quick-score";
```



```js
quickScore("thought", "gh");   // 0.7000000000000001
quickScore("GitHub", "gh");    // 0.9166666666666666
```

```js
const scoreArray = require("quick-score").scoreArray;
```

```js
import {createScorer} from "quick-score";

const scoreArray = createScorer();
const strings = ["thought", "giraffe", "GitHub", "hello, Garth"];
const result = scoreArray(strings, "gh");

console.log(result); //
```

scoreArray()

will modify array of strings passed in

always case-insensitive, uses `toLocaleLowerCase()`

first key in array is used for sorting strings with the same score

