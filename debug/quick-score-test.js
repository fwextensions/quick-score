const score = require("./quick-score-debug");

var hits = [];

score("This excellent string tells us an intes foo", "test", hits);
console.log(hits);
score("This excellent string tells us an interesting story", "test");


score("Test string", "tstr");
score("QuicKey", "qk");
score("quickly", "qk");
score("QuicKey", "QuicKey");
score("   QuicKey", "QuicKey");
score("react-hot-loader", "rhl");
score("are there walls?", "rhl");
score("WhatIsQuicKey?", "qk");
