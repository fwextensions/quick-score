const score = require("./quick-score-debug");

var hits = [];

score("This excellent string tells us an intes foo", "test", hits);
console.log(hits);
score("This excellent string tells us an interesting story", "test");


score("Test string", "tstr");

