const fs = require("fs");
const path = require("path");
const statements = require("./debug-statements");


function log(
	...values)
{
	console.log.apply(console, values);
}


function indent(
	string)
{
	return "         " + string;
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
	hits,
	...args)
{
	const line = new Array(70).join("=");

	log(line);
	log(indent(string));
	log("\n" + quickScore(string, query, hits || [], ...args));
	log(line + "\n");
}


var scoreSource = fs.readFileSync(path.resolve(__dirname, "../src/quick-score.js"), "utf8");

	// fix the path to range.js
scoreSource = scoreSource.replace('"./range"', '"../src/range"');

	// insert the statements before or after the target lines
statements.reduce((startIndex, [statement, position, target]) => {
	const index = scoreSource.indexOf(target, startIndex);
	const indent = target.match(/^(\s*)/)[1];
	const statementLine = indent + statement + "\n\n";
	const replacement = (position == "before")
		? statementLine + target
		: target + "\n\n" + statementLine;

	if (index > -1) {
		scoreSource = scoreSource.replace(target, replacement);
	} else {
		throw new Error("Couldn't find target: " + target);
	}

	return startIndex + replacement.length;
}, 0);

eval(scoreSource);


module.exports = logScore;
