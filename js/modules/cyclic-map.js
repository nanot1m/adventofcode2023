// @ts-check

/**
 * @template T
 *
 * @implements {Iterable<T>}
 */
export class CyclicSeq {
	/**
	 * @template T
	 * @param {Iterable<T>} iterable
	 * @param {(val: T, idx: number) => any} toHash
	 */
	static from(iterable, toHash = (x, idx) => x) {
		let periodStart = 0
		let periodLength = 0

		const arr = /** @type {T[]} */ ([])
		const map = new Map()

		for (const val of iterable) {
			const hash = toHash(val, arr.length)
			if (map.has(hash)) {
				periodStart = map.get(hash)
				periodLength = arr.length - periodStart
				break
			}
			map.set(hash, arr.length)
			arr.push(val)
		}

		return new CyclicSeq(arr, periodStart, periodLength)
	}

	/** @readonly */
	periodStart

	/** @readonly */
	periodLength

	/**
	 * @private
	 * @param {T[]} arr
	 * @param {number} periodStart
	 * @param {number} periodLength
	 */
	constructor(arr, periodStart, periodLength) {
		this.arr = arr
		this.periodStart = periodStart
		this.periodLength = periodLength
	}

	/**
	 * @param {number} idx
	 */
	get(idx) {
		if (idx < this.periodStart) return this.arr[idx]
		return this.arr[this.periodStart + ((idx - this.periodStart) % this.periodLength)]
	}

	*[Symbol.iterator]() {
		let i = 0
		while (true) {
			yield this.get(i++)
		}
	}
}
