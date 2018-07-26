const score = require("./quick-score-debug");
const Range = require("../src/range");

var hits = [];

score("This excellent string tells us an intes foo", "test", hits);
console.log(hits);
score("This excellent string tells us an interesting story", "test", hits, false, new Range(0, 39));
score("This excellent string tells us an interesting story", "tein", null, false, new Range(0, 39));

score("Test string", "ts");
score("Test string", "tet");
score("Test string", "tstr");
score("QuicKey", "qk");
score("WhatIsQuicKey?", "qk");
score("QuicKey", "QuicKey");
score("quickly", "qk");
score("   QuicKey", "QuicKey");
score("react-hot-loader", "rhl");
score("are there walls?", "rhl");
score("This excellent string tells us an interesting story", "test");
