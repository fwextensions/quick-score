 export class Range {
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
		value)
	{
		if (typeof value == "number") {
			this.length = value - this.location;
		}

			// the NSMaxRange() function in Objective-C returns this value
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
