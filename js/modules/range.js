// @ts-check

/**
 * Represents a range of values.
 */
export class Range {
	/**
	 * Creates a new Range instance.
	 * @param {number} start - The starting value of the range.
	 * @param {number} end - The ending value of the range.
	 */
	constructor(start, end) {
		this.start = Math.min(start, end)
		this.end = Math.max(start, end)
	}

	mid() {
		return (this.start + this.end) / 2
	}

	midFloor() {
		return Math.floor(this.mid())
	}

	slice(start = 0, end = this.end) {
		start = Math.max(start, this.start)
		end = Math.min(end, this.end)
		end = Math.max(end, start)
		return new Range(start, end)
	}

	/**
	 * Expands the range by a specified amount.
	 * @param {number} amount - The amount to expand the range by.
	 * @returns {Range} - The expanded range.
	 */
	expandBy(amount) {
		return new Range(this.start - amount, this.end + amount)
	}

	/**
	 * Calculates the intersection between two ranges.
	 * @param {Range} otherRange - The other range to intersect with.
	 * @returns {Range|null} - The intersection range, or null if there is no intersection.
	 */
	intersection(otherRange) {
		const start = Math.max(this.start, otherRange.start)
		const end = Math.min(this.end, otherRange.end)

		if (start <= end) {
			return new Range(start, end)
		} else {
			return null
		}
	}

	/**
	 * Calculates the union of two ranges.
	 * @param {Range} otherRange - The other range to union with.
	 * @returns {Range} - The union range.
	 */
	union(otherRange) {
		const start = Math.min(this.start, otherRange.start)
		const end = Math.max(this.end, otherRange.end)

		return new Range(start, end)
	}

	/**
	 * Excludes a range from the current range.
	 * @param {Range} excludedRange - The range to exclude.
	 * @returns {Array<Range>} - An array of ranges representing the result of the exclusion.
	 */
	exclude(excludedRange) {
		/** @type {Array<Range>} */
		const result = []

		if (excludedRange.start <= this.start && excludedRange.end >= this.end) {
			return result
		}

		if (excludedRange.start > this.start) {
			result.push(new Range(this.start, excludedRange.start - 1))
		}

		if (excludedRange.end < this.end) {
			result.push(new Range(excludedRange.end + 1, this.end))
		}

		return result
	}

	/**
	 * Excludes all ranges from the current range.
	 * @param {Array<Range>} excludedRanges - The ranges to exclude.
	 * @returns {Array<Range>} - An array of ranges representing the result of the exclusion.
	 */
	excludeAll(excludedRanges) {
		/** @type {Range[]} */
		const result = []

		let start = this.start
		excludedRanges.sort((a, b) => a.start - b.start)

		for (const excludedRange of excludedRanges) {
			if (excludedRange.start > start) {
				result.push(new Range(start, excludedRange.start - 1))
			}
			start = excludedRange.end + 1
		}

		if (start <= this.end) {
			result.push(new Range(start, this.end))
		}

		return result
	}

	/**
	 * Checks if the range intersects with another range.
	 * @param {Range} otherRange - The other range to check intersection with.
	 * @returns {boolean} - True if the ranges intersect, false otherwise.
	 */
	intersects(otherRange) {
		return this.start <= otherRange.end && otherRange.start <= this.end
	}

	/**
	 * Checks if the range includes a value.
	 * @param {number} value - The value to check.
	 * @returns {boolean} - True if the range includes the value, false otherwise.
	 */
	includes(value) {
		return value >= this.start && value <= this.end
	}

	/**
	 * Checks if the range contains another range.
	 * @param {Range} otherRange - The other range to check.
	 * @returns {boolean} - True if the range contains the other range, false otherwise.
	 */
	contains(otherRange) {
		return this.start <= otherRange.start && otherRange.end <= this.end
	}

	/**
	 * Returns the size of the range.
	 * @returns {number} - The size of the range.
	 */
	size() {
		return this.end - this.start + 1
	}

	/**
	 * Shifts the range by a specified amount.
	 * @param {number} amount - The amount to shift the range by.
	 * @returns {Range} - The shifted range.
	 */
	shiftBy(amount) {
		return new Range(this.start + amount, this.end + amount)
	}

	/**
	 * Returns an iterator for the range.
	 * @returns {Iterator<number>} - The iterator for the range.
	 */
	*[Symbol.iterator]() {
		let current = this.start
		const end = this.end

		while (current <= end) {
			yield current++
		}
	}
}
