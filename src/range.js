function Range(
	location,
	length)
{
	if (typeof location == "number") {
		this.location = location;
		this.length = length;
	} else {
		this.location = -1;
		this.length = 0;
	}
}


Range.prototype.max = function(
	max)
{
	if (typeof max == "number") {
		this.length = max - this.location;
	}

// TODO: calling this max is a little weird. [0, 3) would be 0, 1, 2.  this is one past the max
	return this.location + this.length;
};


Range.prototype.isValid = function()
{
	return (this.location > -1);
};


Range.prototype.toString = function()
{
	if (this.location == -1) {
		return "invalid range";
	} else {
		return "[" + this.location + "," + this.max() + ")";
	}
};


Range.prototype.toValue = Range.prototype.toString;


module.exports = Range;
