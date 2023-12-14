// @ts-check

import { V } from "./index.js"
import { it } from "./itertools.js"
import { vec3 } from "./vec3.js"

/**
 * @param {T} x
 * @returns {T}
 * @template T
 */
export function id(x) {
	return x
}

/**
 * @param {T[]} xs
 * @param {(arg: T) => string | number} fn
 *
 * @template T
 */
export function minBy(xs, fn) {
	return xs.reduce((a, b) => (fn(a) < fn(b) ? a : b))
}

/**
 * @param {T[]} xs
 * @param {(arg: T) => string | number} fn
 *
 * @template T
 */
export function maxBy(xs, fn) {
	return xs.reduce((a, b) => (fn(a) > fn(b) ? a : b))
}

/**
 * @param {number[]} xs
 */
export function min(xs) {
	return minBy(xs, id)
}

/**
 * @param {number[]} xs
 */
export function max(xs) {
	return maxBy(xs, id)
}

/**
 *
 * @param {T[]} xs
 * @param {T[][]} yss
 * @returns {T[][]}
 *
 * @template T
 */
export function zip(xs, ...yss) {
	const minLength = minBy(yss, (ys) => ys.length).length
	return xs.slice(0, minLength).map((val, i) =>
		yss.reduce(
			(a, arr) => {
				a.push(arr[i])
				return a
			},
			[val],
		),
	)
}

/**
 * @param {string} input
 */
export function readLines(input) {
	return input.split("\n")
}

/**
 * @param {string} input
 */
export function readBlocks(input) {
	return input.split("\n\n")
}

/**
 * @param {string} input
 * @returns
 */
export function readIntLines(input) {
	return readLines(input).map(Number)
}

/**
 * @param {string} input
 * @param {string} [separator]
 */
export function readIntArr(input, separator = ",") {
	return input.split(separator).map(Number)
}

/**
 * @param {number} n
 * @param {number} m
 * @returns
 */
export const mod = (n, m) => ((n % m) + m) % m

/**
 *
 * @param {T} value
 * @template T
 */
export function functor(value) {
	return {
		/**
		 *
		 * @param {(arg: T) => R} fn
		 * @template R
		 */
		map(fn) {
			return functor(fn(value))
		},
		get() {
			return value
		},
	}
}

/**
 * @param {T[]} xs
 * @param {number} n
 * @template T
 */
export function cycle(xs, n) {
	return xs.slice(n).concat(xs.slice(0, n))
}

/**
 * @param {T[]} xs
 * @param {number} n
 * @template T
 */
export function at(xs, n) {
	if (n < 0) {
		n = xs.length + n
	}
	return xs[n]
}

/**
 * @param {number} a
 * @param {number} b
 * @returns
 */
export function add(a, b) {
	return a + b
}

/**
 * @param {number} a
 * @param {number} b
 * @returns
 */
export function mul(a, b) {
	return a * b
}

/**
 *
 * @param {number[][]} m1
 * @param {number[][]} m2
 */
export function mulMatrix(m1, m2) {
	/** @type {number[][]} */
	const result = []
	for (let i = 0; i < m1.length; i++) {
		result[i] = []
		for (let j = 0; j < m2[0].length; j++) {
			let sum = 0
			for (let k = 0; k < m1[0].length; k++) {
				sum += m1[i][k] * m2[k][j]
			}
			result[i][j] = sum
		}
	}
	return result
}

/**
 *  @param {number[][]} mat1
 * @param  {...number[][]} mats
 */
export function mulMatrices(mat1, ...mats) {
	return mats.reduce(mulMatrix, mat1)
}

/**
 * @param {number} a
 * @param {number} b
 * @returns
 */
export function compareAsc(a, b) {
	return a - b
}

/**
 * @param {number} a
 * @param {number} b
 * @returns
 */
export function compareDesc(a, b) {
	return b - a
}

/**
 *
 * @param {T[]} xs
 * @param {number} i
 * @param {(arg: T) => T} fn
 *
 * @template T
 */
export function update(xs, i, fn) {
	return xs
		.slice(0, i)
		.concat(fn(xs[i]))
		.concat(xs.slice(i + 1))
}

/**
 * @param {number} x
 */
export function inc(x) {
	return x + 1
}

/**
 * @param {T} xs
 * @param {number} n
 * @returns {[T, T]}
 *
 * @template {{slice(start: number, end?: number): T}} T
 */
export function splitAt(xs, n) {
	return [xs.slice(0, n), xs.slice(n)]
}

/**
 *
 * @param {T[][]} arr
 * @param {boolean} clockwise
 * @returns {T[][]}
 *
 * @template T
 */
export function rotate2d(arr, clockwise = true) {
	const height = arr.length
	const width = it(arr)
		.map((line) => line.length)
		.max()

	const rotated = Array.from({ length: width }, () => Array.from({ length: height }))

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const value = arr[y]?.[x]
			const [i, j] = clockwise ? [x, height - y - 1] : [width - x - 1, y]
			rotated[i][j] = value
		}
	}

	return rotated
}

/**
 *
 * @param {string[]} strings
 * @param {boolean} clockwise
 */
export function rotateStrings2d(strings, clockwise = true) {
	const rotated = rotate2d(
		strings.map((str) => str.split("")),
		clockwise,
	)

	return rotated.map((line) =>
		line
			.map((x) => x ?? " ")
			.join("")
			.trimEnd(),
	)
}

/**
 *
 * @param {string} str
 * @param {boolean} [clockwise]
 *
 * @returns {string}
 */
export function rotateString2d(str, clockwise = true) {
	return rotateStrings2d(str.split("\n"), clockwise).join("\n")
}

/**
 *
 * @param  {T} args
 * @returns {T}
 *
 * @template {unknown[]} T
 */
export function tuple(...args) {
	return args
}

/**
 * @type {import("./types.js").RotateFn}
 *
 * @template T
 */
// @ts-ignore
export const rotate = (/** @type {string | string[] | T[][]} */ rotatable, clockwise = true) => {
	if (typeof rotatable === "string") {
		return rotateString2d(rotatable, clockwise)
	}
	if (typeof rotatable[0] === "string") {
		return rotateStrings2d(/** @type {string[]} */ (rotatable), clockwise)
	}
	return rotate2d(/** @type {T[][]} */ (rotatable), clockwise)
}

/**
 * Solve a square equation of the form ax^2 + bx + c = 0
 * @param {number} a The coefficient of x^2
 * @param {number} b The coefficient of x
 * @param {number} c The constant term
 * @returns {[] | [number] | [number, number]} An array of solutions for x
 */
export function solveSquareEquation(a, b, c) {
	const discriminant = b * b - 4 * a * c
	if (discriminant < 0) {
		return [] // No real solutions
	} else if (discriminant === 0) {
		const x = -b / (2 * a)
		return [x] // One real solution
	} else {
		const sqrtDiscriminant = Math.sqrt(discriminant)
		const x1 = (-b + sqrtDiscriminant) / (2 * a)
		const x2 = (-b - sqrtDiscriminant) / (2 * a)
		return [x1, x2] // Two real solutions
	}
}

/**
 * Returns the greatest common divisor of two numbers
 *
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function gcd(a, b) {
	return !b ? a : gcd(b, a % b)
}

/**
 * Returns the least common multiple of two numbers
 *
 * @param {number} a
 * @param {number} b
 */
export function lcm(a, b) {
	return (a * b) / gcd(a, b)
}

/**
 * @template T
 *
 * @param {T[]} xs
 * @param {number} count
 * @param {T[][]} [result]
 * @param {T[]} [current]
 * @returns {T[][]}
 */
export function combinations(xs, count, result = [], current = [], start = 0) {
	if (count === 0) {
		result.push([...current])
		return
	}
	for (let i = start; i < xs.length; i++) {
		current.push(xs[i])
		combinations(xs, count - 1, result, current, i + 1)
		current.pop()
	}
	return result
}

/**
 * @template {Iterable<any>} T
 * @param {T} xs
 * @param {T} delimiters
 * @param {number} count
 *
 * @returns {T extends string ? string : T extends Iterable<infer U> ? U[] : never}
 */
export function repeatWithDelimiters(xs, delimiters, count) {
	/** @type {any} */
	let result = typeof xs === "string" ? "" : []
	for (let i = 0; i < count; i++) {
		if (i > 0) result = result.concat(delimiters)
		result = result.concat(xs)
	}
	return result
}

/**
 * @param {object} x
 */
export function toString(x) {
	return x.toString()
}
