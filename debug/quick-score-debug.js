const fs = require("fs");
const statements = require("./debug-statements");


function log(
	...values)
{
	console.log.apply(console, values);
}


function indent(
	string)
{
	return "        " + string;
}


function clip(
	value)
{
	return value.toPrecision(5);
}


function fill(
	array,
	filler)
{
	for (var i = 0; i < array.length; i++) {
		array[i] = array[i] || filler || " ";
	}

	return array.join("");
}


function logRanges(
	searchRange,
	hitMask,
	fullMatchedRange)
{
	var ranges = setIndexesFromArray([], hitMask || []),
		matchedRange = [];

	if (searchRange.isValid()) {
		ranges[searchRange.location] = "(";
		ranges[searchRange.max() - 1] = ")";
	}

	setIndexesInRange(matchedRange, fullMatchedRange, "^");

	log(indent(fill(ranges)));
//	log(indent(fill(matchedRange)));
}


function setIndexesInRange(
	indexes,
	range,
	char)
{
	for (var i = range.location; i < range.max(); i++) {
		indexes[i] = char || "*";
	}

	return indexes;
}


function setIndexesFromArray(
	indexes,
	array,
	char)
{
	array.forEach(index => {
		indexes[index] = char || "*";
	});

	return indexes;
}


function logScore(
	string,
	query,
	hits)
{
	log(indent(string));
	log("\n" + quickScore(string, query, hits || []));
	log(new Array(60).join("=") + "\n");
}


var scoreSource = fs.readFileSync("../src/quick-score.js", "utf8");

	// fix the path to range.js
scoreSource = scoreSource.replace('"./range"', '"../src/range"');

const lines = scoreSource.split("\n");

for (let [line, statement] of statements.reverse()) {
		// add the lines in reverse order so the line numbers don't get shifted.
		// subtract 1 because the line numbers are 1-based.
	lines.splice(line - 1, 0, statement);
}

scoreSource = lines.join("\n");

eval(scoreSource);

module.exports = logScore;
