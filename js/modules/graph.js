// @ts-check

import { PriorityQueue } from "./priority-queue.js"

/**
 * @template T
 *
 * @typedef {Object} PathItem
 * @property {number} distance
 * @property {T} value
 * @property {PathItem<T>} [parent]
 */

/**
 * @template T
 *
 * @param {(value: T, step: PathItem<T>) => Iterable<T>} getNext
 * @param {T} start
 * @param {(value: T) => unknown} [valToHash]
 *
 * @returns {IteratorObject<PathItem<T>>}
 */
export function* dfs(getNext, start, valToHash) {
	const visited = new Set()
	const queue = /** @type {PathItem<T>[]} */ ([{ distance: 0, value: start, parent: null }])
	if (valToHash) {
		visited.add(valToHash(start))
	}

	while (queue.length) {
		const current = queue.pop()
		yield current

		for (const next of getNext(current.value, current)) {
			if (valToHash) {
				const hash = valToHash(next)
				if (!visited.has(hash)) {
					visited.add(hash)
					queue.push({ distance: current.distance + 1, value: next, parent: current })
				}
			} else {
				queue.push({ distance: current.distance + 1, value: next, parent: current })
			}
		}
	}
}

/**
 * @template T
 *
 * @param {(value: T, step: PathItem<T>) => IteratorObject<T>} getNext
 * @param {T[]} starts
 * @param {(value: T) => unknown} [valToHash]
 *
 * @returns {IteratorObject<PathItem<T>>}
 */
export function* bfs(getNext, starts, valToHash) {
	const visited = new Set()

	/** @type {PathItem<T>[]} */
	const queue = []

	for (const start of starts) {
		queue.push({ distance: 0, value: start, parent: null })
		if (valToHash) {
			visited.add(valToHash(start))
		}
	}

	while (queue.length) {
		const current = queue.shift()
		yield current

		for (const next of getNext(current.value, current)) {
			if (valToHash) {
				const hash = valToHash(next)
				if (!visited.has(hash)) {
					visited.add(hash)
					queue.push({ distance: current.distance + 1, value: next, parent: current })
				}
			} else {
				queue.push({ distance: current.distance + 1, value: next, parent: current })
			}
		}
	}
}

/**
 * @template T
 *
 * @param {(value: T, step: PathItem<T>) => Iterable<T>} getNext
 * @param {(value: T) => number} getDistance
 * @param {T[]} starts
 * @param {(value: T) => unknown} [valToHash]
 */
export function* dijkstra(getNext, getDistance, starts, valToHash) {
	const visited = new Set()

	/** @type {PriorityQueue<PathItem<T>>} */
	const queue = new PriorityQueue((a, b) => a.distance - b.distance)

	for (const start of starts) {
		queue.push({ distance: getDistance(start), value: start, parent: null })
		if (valToHash) {
			visited.add(valToHash(start))
		}
	}

	while (queue.length) {
		const current = queue.pop()
		yield current

		for (const next of getNext(current.value, current)) {
			if (valToHash) {
				const hash = valToHash(next)
				if (!visited.has(hash)) {
					visited.add(hash)
					queue.push({
						distance: current.distance + getDistance(next),
						value: next,
						parent: current,
					})
				}
			} else {
				queue.push({
					distance: current.distance + getDistance(next),
					value: next,
					parent: current,
				})
			}
		}
	}
}
