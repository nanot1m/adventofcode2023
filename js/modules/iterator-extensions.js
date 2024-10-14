import { add, lcm, mul } from "./lib.js"

Iterator.prototype.first = function () {
	for (const x of this) {
		return x
	}
}

/**
 * @template T
 *
 * @param {T} defaultValue
 */
Iterator.prototype.firstOrDefault = function (defaultValue) {
	for (const x of this) {
		return x
	}
	return defaultValue
}

Iterator.prototype.last = function () {
	let last
	for (const x of this) {
		last = x
	}
	return last
}

/**
 * @param {number} n
 */
Iterator.prototype.skip = function* (n) {
	let i = 0
	for (const x of this) {
		if (i >= n) {
			yield x
		}
		i++
	}
}

/**
 * @param {number} n
 */
Iterator.prototype.groupsOf = function* (n) {
	let group = []
	for (const x of this) {
		group.push(x)
		if (group.length === n) {
			yield group
			group = []
		}
	}
	if (group.length > 0) {
		yield group
	}
}

/**
 * @param {IteratorObject<number>} xs
 */
export function sum(xs) {
	return xs.reduce(add, 0)
}

Iterator.prototype.sum = function () {
	return sum(this)
}

/**
 * @param {IteratorObject<number>} xs
 */
export function multiply(xs) {
	return xs.reduce(mul, 1)
}

Iterator.prototype.multiply = function () {
	return multiply(this)
}

/**
 * @template T
 */
Iterator.prototype.count = function (predicate = (/** @type {T} */ x) => true) {
	let count = 0
	for (const x of this) {
		if (predicate(x)) {
			count += 1
		}
	}
	return count
}

/**
 *
 * @param {Iterable<U>} iterableB
 * @returns {IteratorObject<[T, U]>}
 *
 * @template T, U
 */
Iterator.prototype.zip = function* (iterableB) {
	const iterA = this[Symbol.iterator]()
	const iterB = iterableB[Symbol.iterator]()
	while (true) {
		const { value: a, done: doneA } = iterA.next()
		const { value: b, done: doneB } = iterB.next()
		if (doneA || doneB) {
			return
		}
		yield [a, b]
	}
}

Iterator.prototype.indexed = function () {
	return range(Infinity).zip(this)
}

/**
 * @param {number} size
 * @returns {IteratorObject<T[]>}
 *
 * @template T
 */
Iterator.prototype.windowed = function* windowed(size) {
	const buffer = []
	for (const x of this) {
		buffer.push(x)
		if (buffer.length === size) {
			yield buffer.slice()
			buffer.shift()
		}
	}
}

/**
 * @param {(value: T) => boolean} predicate
 * @returns {number}
 * @template T
 */
Iterator.prototype.findIndex = function (predicate) {
	let i = 0
	for (const x of this) {
		if (predicate(x)) {
			return i
		}
		i++
	}
	return -1
}

/**
 * @param {T} value
 * @returns {number}
 * @template T
 */
Iterator.prototype.indexOf = function (value) {
	return this.findIndex((x) => x === value)
}

/**
 * @param {number} [n]
 * @returns {IteratorObject<T>}
 *
 * @template T
 */
Iterator.prototype.skipLast = function* (n = 1) {
	if (n <= 0) {
		yield* this
		return
	}

	const buffer = Array(n)
	let i = 0
	for (const x of this) {
		if (i >= n) {
			yield buffer[i % n]
		}
		buffer[i % n] = x
		i++
	}
}

/**
 *
 * @param {number} every
 * @param {number} [skipInitial]
 * @returns {IteratorObject<T>}
 *
 * @template T
 */
Iterator.prototype.takeEvery = function* takeEvery(every, skipInitial = 0) {
	if (every <= 0) {
		return
	}
	if (skipInitial < 0) {
		skipInitial = 0
	}

	for (const x of this) {
		if (skipInitial === 0) {
			yield x
			skipInitial = every
		}
		skipInitial--
	}
}

/**
 * @param {(value: T) => boolean} predicate
 * @returns {IteratorObject<T>}
 * @template T
 */
Iterator.prototype.takeWhile = function* takeWhile(predicate) {
	for (const x of this) {
		if (!predicate(x)) {
			return
		}
		yield x
	}
}

/**
 * @param {(value: T) => boolean} predicate
 * @returns {IteratorObject<T>}
 * @template T
 */
Iterator.prototype.takeUntil = function* (predicate) {
	for (const x of this) {
		if (predicate(x)) {
			return
		}
		yield x
	}
}

/**
 * @param {(arg: T) => any} [mapFn]
 * @returns {IteratorObject<T>}
 * @template T
 */
Iterator.prototype.distinct = function* (mapFn = (x) => x) {
	const set = new Set()
	for (const x of this) {
		const key = mapFn(x)
		if (!set.has(key)) {
			set.add(key)
			yield x
		}
	}
}

Iterator.prototype.min = function () {
	let min
	for (const x of this) {
		if (min === undefined || x < min) {
			min = x
		}
	}
	return min
}

Iterator.prototype.max = function () {
	let max
	for (const x of this) {
		if (max === undefined || x > max) {
			max = x
		}
	}
	return max
}

/**
 * @template T
 * @param {(arg: T) => number | string} fn
 * @returns {T}
 */
Iterator.prototype.maxBy = function maxBy(fn) {
	let max
	let maxVal
	for (const x of this) {
		const val = fn(x)
		if (max === undefined || val > maxVal) {
			max = x
			maxVal = val
		}
	}
	return max
}

/**
 * @template T
 */
Iterator.prototype.countFrequencies = function () {
	return this.toMap(
		(x) => x,
		(x, map) => (map.get(x) ?? 0) + 1,
	)
}

/**
 * @template T
 *
 * @param {T[]} xs
 * @param {number} count
 * @param {T[]} [current]
 * @returns {IteratorObject<T[]>}
 */
export function* combinations(xs, count, current = [], start = 0) {
	if (count === 0) {
		yield [...current]
		return
	}
	for (let i = start; i < xs.length; i++) {
		current.push(xs[i])
		yield* combinations(xs, count - 1, current, i + 1)
		current.pop()
	}
}

Iterator.prototype.combinations = function (/** @type {number} */ count) {
	return combinations(this.toArray(), count)
}

/**
 * @param {(arg: R, acc: Map<K,V>) => K} keyFn
 * @param {(arg: R, acc: Map<K,V>) => V} valueFn
 * @returns {Map<K,V>}
 *
 * @template R
 * @template K
 * @template V
 */
Iterator.prototype.toMap = function (keyFn, valueFn) {
	/** @type {Map<K, V>} */
	const map = new Map()
	for (const x of this) {
		map.set(keyFn(x, map), valueFn(x, map))
	}
	return map
}

Iterator.prototype.lcm = function () {
	return this.reduce(lcm, 1)
}

/**
 * @param {(x: T) => void} fn
 * @template T
 */
Iterator.prototype.tap = function* (fn) {
	for (const x of this) {
		fn(x)
		yield x
	}
}

/**
 *
 * @param {(x:Iterable<T>) => IteratorObject<U>} fn
 * @template T
 * @template U
 */
Iterator.prototype.chain = function (fn) {
	return fn(this)
}
