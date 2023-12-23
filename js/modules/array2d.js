// @ts-check

import { V } from "./index.js"
import { mod } from "./lib.js"

/**
 * @template T
 * @param {T[][]} xs
 * @param {'lines' | 'columns'} by
 */
export function* traverse(xs, by = "lines", reverse = false) {
	const minX = 0
	const minY = 0
	const maxX = xs[0].length
	const maxY = xs.length

	if (by === "lines") {
		const y0 = reverse ? maxY - 1 : minY
		const y1 = reverse ? minY - 1 : maxY
		const yStep = reverse ? -1 : 1

		const x0 = reverse ? maxX - 1 : minX
		const x1 = reverse ? minX - 1 : maxX
		const xStep = reverse ? -1 : 1

		for (let y = y0; y !== y1; y += yStep) {
			for (let x = x0; x !== x1; x += xStep) {
				yield { pos: V.vec(x, y), value: xs[y][x] }
			}
		}
	}

	if (by === "columns") {
		const x0 = reverse ? maxX - 1 : minX
		const x1 = reverse ? minX - 1 : maxX
		const xStep = reverse ? -1 : 1

		const y0 = reverse ? maxY - 1 : minY
		const y1 = reverse ? minY - 1 : maxY
		const yStep = reverse ? -1 : 1

		for (let x = x0; x !== x1; x += xStep) {
			for (let y = y0; y !== y1; y += yStep) {
				yield { pos: V.vec(x, y), value: xs[y][x] }
			}
		}
	}
}

/**
 * @template T
 *
 * @param {T[][]} xs
 * @returns {T[][]}
 */
export function rotateCW(xs) {
	const res = []

	for (let y = 0; y < xs[0].length; y++) {
		res.push([])
		for (let x = 0; x < xs.length; x++) {
			res[y].push(xs[xs.length - x - 1][y])
		}
	}

	return res
}

/**
 * @template T
 *
 * @param {T[][]} xs
 * @returns {T[][]}
 */
export function rotateCCW(xs) {
	const res = []

	for (let y = 0; y < xs[0].length; y++) {
		res.push([])
		for (let x = 0; x < xs.length; x++) {
			res[y].push(xs[x][xs[0].length - y - 1])
		}
	}

	return res
}

/**
 * @param {string} input
 * @returns {string[][]}
 */
export function parse(input) {
	return input.split("\n").map((l) => l.split(""))
}

/**
 * @template T
 * @param {number} width
 * @param {number} height
 * @param {(x: number, y: number) => T} getVal
 * @returns {T[][]}
 */
export function create(width, height, getVal) {
	const res = []
	for (let y = 0; y < height; y++) {
		res.push([])
		for (let x = 0; x < width; x++) {
			res[y].push(getVal(x, y))
		}
	}
	return res
}

/**
 * @template T
 * @param {T[][]} xs
 * @param {Readonly<V.Vec2>} pos
 */
export function get(xs, pos) {
	return xs[pos[1]]?.[pos[0]]
}

/**
 * @template T
 * @param {T[][]} xs
 * @param {V.Vec2} pos
 * @returns {T}
 */
export function modGet(xs, pos) {
	return xs[mod(pos[1], height(xs))][mod(pos[0], width(xs))]
}

/**
 * @template T
 * @param {T[][]} xs
 * @param {V.Vec2} pos
 * @param {T} value
 */
export function set(xs, pos, value) {
	xs[pos[1]][pos[0]] = value
}

/**
 * @template T
 * @param {T[][]} xs
 * @returns {string}
 */
export function toString(xs) {
	return xs.map((l) => l.join("")).join("\n")
}

/**
 * @template T
 * @template U
 * @param {T[][]} xs
 * @param {(v: T, pos: V.Vec2) => U} fn
 * @returns {U[][]}
 */
export function map(xs, fn) {
	return xs.map((l, x) => l.map((v, y) => fn(v, [x, y])))
}

/**
 * @template T
 * @param {T[][]} xs
 */
export function height(xs) {
	return xs.length
}

/**
 * @template T
 * @param {T[][]} xs
 */
export function width(xs) {
	return xs[0].length
}

/**
 * @template T
 * @param {T[][]} xs
 * @returns {T[][]}
 */
export function clone(xs) {
	return xs.map((l) => l.slice())
}

/**
 * @template T
 * @param {T[][]} xs
 * @param {Readonly<V.Vec2>} pos
 * @returns {boolean}
 */
export function contains(xs, pos) {
	return pos[0] >= 0 && pos[1] >= 0 && pos[0] < width(xs) && pos[1] < height(xs)
}

/**
 * @template T
 * @param {T[][]} xs
 */
export function* borders(xs) {
	const w = width(xs)
	const h = height(xs)
	for (let x = 0; x < w; x++) {
		yield { pos: V.vec(x, 0), value: xs[0][x] }
		yield { pos: V.vec(x, h - 1), value: xs[h - 1][x] }
	}
	for (let y = 0; y < h; y++) {
		yield { pos: V.vec(0, y), value: xs[y][0] }
		yield { pos: V.vec(w - 1, y), value: xs[y][w - 1] }
	}
}

/**
 * @template T
 * @param {T[][]} xs
 */
export function rows(xs) {
	return xs
}

/**
 * @template T
 * @param {T[][]} xs
 */
export function columns(xs) {
	return transpose(xs)
}

/**
 * @template T
 * @param {T[][]} xs
 * @returns {T[][]}
 */
export function transpose(xs) {
	const res = []
	for (let x = 0; x < width(xs); x++) {
		res.push([])
		for (let y = 0; y < height(xs); y++) {
			res[x].push(xs[y][x])
		}
	}
	return res
}
