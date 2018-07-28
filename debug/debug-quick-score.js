const score = require("./debug-harness");
const Range = require("../src/range");

/*
var hits = [];
score("This excellent string tells us an intes foo", "test", hits);
console.log(hits);
score("This excellent string tells us an interesting story", "test", null, false, new Range(0, 39));
score("This excellent string tells us an interesting story", "tein", null, false, new Range(0, 39));
*/

/*
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
*/

(() => {
	const str = "This excellent string tells us an interesting story";
	const strRange = new Range(0, 27); //  ^--- range ends here initially
	const abbr = "test";
	const hits = [];

	for (let i = 0; i < 7; i++) {
		score(str, abbr, hits, false, strRange);
		console.log("hits:", hits, "\n\n\n");
		strRange.length += 4;
		hits.length = 0;
	}
})();
