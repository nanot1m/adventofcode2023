// @ts-check

/**
 *
 * @param {IteratorObject<T>} iterable
 * @returns {Iterable<T>}
 * @template T
 */
export const it = Iterator.from

/**
 * @param {number} [start]
 * @param {number} [end]
 * @param {number} [step]
 */
export function* range(start, end, step = 1) {
	if (start === undefined) {
		start = 0
	}
	if (end === undefined) {
		end = start
		start = 0
	}
	if (step === undefined) {
		step = 1
	}
	for (let i = start; i < end; i += step) {
		yield i
	}
}

/**
 *
 * @param {T} x
 * @param {(arg: T, idx: number) => T} f
 *
 * @template T
 */
export function* iterate(x, f) {
	let idx = 0
	yield x
	while (true) {
		x = f(x, idx++)
		yield x
	}
}
