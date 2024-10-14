// @ts-check

import { tuple } from "./lib.js"
import * as V from "./vec.js"

/**
 * @template T
 *
 * @typedef {Object} PathItem
 * @property {V.Vec2} pos
 * @property {number} distance
 * @property {T} value
 * @property {PathItem<T>} [parent]
 */

/**
 *@template T
 *
 * @param {Map2d<T>} map2d
 * @param {(pos: V.Vec2, map: Map2d<T>) => IteratorObject<V.Vec2>} getNext
 * @param {V.Vec2} start
 *
 * @returns {IteratorObject<PathItem<T>>}
 */
export function* dfs(map2d, getNext, start) {
	const visited = new Map2d()
	/** @type {PathItem<T>} */
	let current = {
		distance: 0,
		pos: start,
		value: map2d.get(start),
		parent: null,
	}
	visited.set(current.pos, true)

	while (current) {
		const next = getNext(current.pos, map2d).find((pos) => !visited.has(pos))

		if (next) {
			visited.set(next, true)
			current = {
				distance: current.distance + 1,
				pos: next,
				value: map2d.get(next),
				parent: current,
			}
		} else {
			yield current
			current = current.parent
		}
	}
}

/**
 *
 * @template T
 *
 * @param {Map2d<T>} map2d
 * @param {(from: PathItem<T>, to: PathItem<T>) => boolean} canGoFromTo
 * @param {V.Vec2 | Iterable<V.Vec2>} start
 * @param {(pos: V.Vec2, map: Map2d<T>) => Iterable<V.Vec2>} getNeighbors
 */
export function* bfs(map2d, canGoFromTo, start, getNeighbors) {
	/** @type {PathItem<T>[]} */
	const queue = []

	if (V.isVec(start)) {
		queue.push({
			distance: 0,
			pos: start,
			value: map2d.get(start),
			parent: null,
		})
	} else {
		for (const pos of start) {
			queue.push({
				distance: 0,
				pos: pos,
				value: map2d.get(pos),
				parent: null,
			})
		}
	}

	const visited = new Set()

	while (queue.length) {
		const current = queue.shift()
		const key = current.pos.join()
		if (visited.has(key)) continue
		visited.add(key)

		yield current

		for (const next of getNeighbors(current.pos, map2d)) {
			const nextBfs = {
				distance: current.distance + 1,
				pos: next,
				value: map2d.get(next),
				parent: current,
			}

			if (canGoFromTo(current, nextBfs)) {
				queue.push(nextBfs)
			}
		}
	}
}

/**
 * @implements {Iterable<{pos: V.Vec2;value: T;}>}
 * @template T
 */
export class Map2d {
	/**
	 * @param {R[][]} raw
	 * @template R
	 */
	static fromArray(raw) {
		/** @type {Map2d<R>} */
		const map = new Map2d()
		raw.forEach((row, y) => {
			row.forEach((value, x) => {
				map.set(V.vec(x, y), value)
			})
		})
		return map
	}

	/**
	 *
	 * @param {V.Vec2} pos
	 * @param {Map2d<T>} map
	 * @returns {Iterable<V.Vec2>}
	 */
	#getNeighbors = (pos, map) =>
		V.DIRS_4.map((dir) => V.add(pos, dir)).filter((pos) => this.has(pos))

	/**
	 * @type {Map<number, Map<number, T>>}
	 */
	#data = new Map()

	#minX = Infinity
	#minY = Infinity
	#maxX = -Infinity
	#maxY = -Infinity

	#needRecalculateBounds = false

	get bounds() {
		if (this.#needRecalculateBounds) {
			this.#updateBounds()
		}
		return {
			minX: this.#minX,
			minY: this.#minY,
			maxX: this.#maxX,
			maxY: this.#maxY,
			botRight: V.vec(this.#maxX, this.#maxY),
			topLeft: V.vec(this.#minX, this.#minY),
		}
	}

	get height() {
		return this.#maxY - this.#minY + 1
	}

	get width() {
		return this.#maxX - this.#minX + 1
	}

	/**
	 * @param {Iterable<[V.Vec2, T]>} [data]
	 */
	constructor(data = []) {
		for (const [pos, value] of data) {
			this.set(pos, value)
		}
	}

	#updateBounds() {
		this.#data.forEach((row, y) => {
			row.forEach((_, x) => {
				this.#extendBounds(x, y)
			})
		})
		this.#needRecalculateBounds = false
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 */
	#extendBounds(x, y) {
		this.#minX = Math.min(this.#minX, x)
		this.#minY = Math.min(this.#minY, y)
		this.#maxX = Math.max(this.#maxX, x)
		this.#maxY = Math.max(this.#maxY, y)
	}

	/**
	 * @param {V.Vec2} vec
	 * @returns {T | undefined}
	 */
	get([x, y]) {
		return this.#data.get(x)?.get(y)
	}

	/**
	 * @param {V.Vec2} vec
	 * @param {T} value
	 * @returns {this}
	 */
	set([x, y], value) {
		if (this.#data.has(x) === false) {
			this.#data.set(x, new Map())
		}
		this.#data.get(x).set(y, value)

		this.#extendBounds(x, y)
		return this
	}

	/**
	 * @param {V.Vec2} vec
	 */
	has([x, y]) {
		return this.#data.get(x)?.has(y) === true
	}

	/**
	 * @param {(arg: T, pos: V.Vec2) => R} mapFn
	 * @returns {Map2d<R>}
	 *
	 * @template R
	 */
	map(mapFn) {
		const result = new Map2d()
		for (const { pos, value } of this) {
			result.set(pos, mapFn(value, pos))
		}
		return result
	}

	/**
	 *
	 * @param {(from: PathItem<T>, to: PathItem<T>) => boolean} canGoFromTo
	 * @param {V.Vec2} start
	 * @returns {Iterable<PathItem<T>>}
	 */
	bfs(canGoFromTo, start) {
		return bfs(this, canGoFromTo, start, this.#getNeighbors)
	}

	/**
	 *
	 * @param {(arg: V.Vec2, map: Map2d<T>) => Iterable<V.Vec2>} getNeighbors
	 */
	setGetNeighbors(getNeighbors) {
		this.#getNeighbors = getNeighbors
		return this
	}

	[Symbol.iterator]() {
		return toIterable(this.#data)
	}

	values() {
		return this[Symbol.iterator]()
	}

	/**
	 * @param {Object} params
	 * @param {V.Vec2} [params.topLeftPos]
	 * @param {V.Vec2} [params.botRightPos]
	 * @param {(arg: T | undefined) => J} params.valToString
	 * @returns
	 *
	 * @template J
	 */
	to2dArray({
		topLeftPos = V.vec(this.#minX, this.#minY),
		botRightPos = V.vec(this.#maxX, this.#maxY),
		valToString,
	}) {
		const [minX, minY] = topLeftPos
		const [maxX, maxY] = botRightPos
		const result = []
		for (let y = minY; y <= maxY; y++) {
			const row = []
			for (let x = minX; x <= maxX; x++) {
				const value = this.get([x, y])
				row.push(valToString(value))
			}
			result.push(row)
		}
		return result
	}

	/**
	 * @param {Object} params
	 * @param {V.Vec2} [params.topLeftPos]
	 * @param {V.Vec2} [params.botRightPos]
	 * @param {(arg: T | undefined) => string} [params.valToString]
	 * @returns
	 */
	toString({
		topLeftPos = V.vec(this.#minX, this.#minY),
		botRightPos = V.vec(this.#maxX, this.#maxY),
		valToString = (x) => (x ?? ".").toString(),
	} = {}) {
		return this.to2dArray({ topLeftPos, botRightPos, valToString })
			.map((row) => row.join(""))
			.join("\n")
	}

	/**
	 *
	 * @param {V.Vec2} pos
	 * @returns {{pos: V.Vec2; value: T}[]} 4 neighbors
	 */
	around4(pos) {
		return V.DIRS_4.map((dir) => V.add(pos, dir))
			.filter((pos) => this.has(pos))
			.map((pos) => ({ pos, value: this.get(pos) }))
	}

	/**
	 *
	 * @param {V.Vec2} pos
	 * @returns {{pos: V.Vec2; value: T}[]} 8 neighbors
	 */
	around8(pos) {
		return V.DIRS_8.map((dir) => V.add(pos, dir))
			.filter((pos) => this.has(pos))
			.map((pos) => ({ pos, value: this.get(pos) }))
	}

	/**
	 * Returns all lines in the map
	 *
	 * @returns {Iterable<[y: number, {pos: V.Vec2; value: T}[]]>}
	 */
	*lines() {
		for (let y = this.bounds.minY; y <= this.bounds.maxY; y++) {
			const line = []
			for (let x = this.bounds.minX; x <= this.bounds.maxX; x++) {
				line.push({ pos: V.vec(x, y), value: this.get([x, y]) })
			}

			yield tuple(y, line)
		}
	}

	/**
	 * Returns all columns in the map
	 *
	 * @returns {Iterable<[x: number, {pos: V.Vec2; value: T}[]]>}
	 */
	*columns() {
		for (let x = this.bounds.minX; x <= this.bounds.maxX; x++) {
			const column = []
			for (let y = this.bounds.minY; y <= this.bounds.maxY; y++) {
				column.push({ pos: V.vec(x, y), value: this.get([x, y]) })
			}

			yield tuple(x, column)
		}
	}

	/**
	 * @returns {Map2d<T>}
	 */
	clone() {
		const result = new Map2d()
		for (const { pos, value } of this) {
			result.set(pos, value)
		}
		return result
	}

	/**
	 * @returns {Iterable<{pos: V.Vec2; value: T}>}
	 */
	*borders() {
		for (let i = this.bounds.minX; i <= this.bounds.maxX; i++) {
			let pos = V.vec(i, this.bounds.minY)
			yield { pos, value: this.get(pos) }
			pos = V.vec(i, this.bounds.maxY)
			yield { pos, value: this.get(pos) }
		}
		for (let i = this.bounds.minY; i <= this.bounds.maxY; i++) {
			let pos = V.vec(this.bounds.minX, i)
			yield { pos, value: this.get(pos) }
			pos = V.vec(this.bounds.maxX, i)
			yield { pos, value: this.get(pos) }
		}
	}
}

/**
 * @param {T[][]} raw
 * @returns {Map2d<T>}
 * @template T
 */
export function toMap2d(raw) {
	return Map2d.fromArray(raw)
}

/**
 * @param {string} input
 */
export function parseMap2d(input) {
	const raw = input.split("\n").map((line) => line.split(""))
	return Map2d.fromArray(raw)
}

/**
 * @param {Map<number, Map<number, T>>} map2d
 *
 * @template T
 */
function* toIterable(map2d) {
	for (const x of map2d.keys()) {
		for (const y of map2d.get(x).keys()) {
			yield { pos: V.vec(x, y), value: map2d.get(x).get(y) }
		}
	}
}
