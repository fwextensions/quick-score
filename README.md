# quick-score

> `quick-score` is a JavaScript string-scoring and fuzzy-matching library based on the Quicksilver algorithm, intended for interactive matching as a user types a query.

intended for interactive matching, long strings
return matches in a "sensible" order


## Install

```sh
npm install --save quickscore
```


## Usage

CommonJS node

```js
const quickScore = require("quick-score");
```

es6 module

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

