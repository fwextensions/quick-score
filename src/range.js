class Range {
	constructor(
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


	max(
		max)
	{
		if (typeof max == "number") {
			this.length = max - this.location;
		}

// TODO: calling this max is a little weird. [0, 3) would be 0, 1, 2.  this is one past the max
		return this.location + this.length;
	}


	isValid()
	{
		return (this.location > -1);
	}


	toString()
	{
		if (this.location == -1) {
			return "invalid range";
		} else {
			return "[" + this.location + "," + this.max() + ")";
		}
	}
}


module.exports = Range;
