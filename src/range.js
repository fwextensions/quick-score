/**
 * A class representing a half-open interval of characters.  A range's `location`
 * property and `max()` value can be used as arguments for the `substring()`
 * method to extract a range of characters.
 */
export class Range {
	/**
	 * @memberOf Range.prototype
	 * @member {number} location  Starting index of the range.
	 */

	/**
	 * @memberOf Range.prototype
	 * @member {number} length  Number of characters in the range.
	 */

	/**
	 * @param {number} [location=-1]  Starting index of the range.
	 * @param {number} [length=0]  Number of characters in the range.
	 */
	constructor(
		location = -1,
		length = 0)
	{
		this.location = location;
		this.length = length;
	}


	/* eslint no-inline-comments: 0 */
	/**
	 * Gets the end index of the range, which indicates the character
	 * immediately after the last one in the range.
	 *
	 * @returns {number}
	 */
	/**
	 * Sets the end index of the range, which indicates the character
	 * immediately after the last one in the range.
	 *
	 * @param {number} [value]  End of the range.
	 *
	 * @returns {number}
	 */
	max(
		value)
	{
		if (typeof value == "number") {
			this.length = value - this.location;
		}

			// the NSMaxRange() function in Objective-C returns this value
		return this.location + this.length;
	}


	/**
	 * Returns whether the range contains a location >= 0.
	 *
	 * @returns {boolean}
	 */
	isValid()
	{
		return (this.location > -1);
	}


	/**
	 * Returns an array of the range's start and end indexes.
	 *
	 * @returns {RangeArray}
	 */
	toArray()
	{
		return [this.location, this.max()];
	}


	/**
	 * Returns a string representation of the range's open interval.
	 *
	 * @returns {string}
	 */
	toString()
	{
		if (this.location == -1) {
			return "invalid range";
		} else {
			return "[" + this.location + "," + this.max() + ")";
		}
	}
}
