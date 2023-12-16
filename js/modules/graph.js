// @ts-check

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
 * @param {(value: T) => number | string} valToHash
 *
 * @returns {Iterable<PathItem<T>>}
 */
export function* dfs(getNext, start, valToHash) {
	const visited = new Set()
	const queue = /** @type {PathItem<T>[]} */ ([{ distance: 0, value: start, parent: null }])

	while (queue.length) {
		const current = queue.pop()
		yield current

		for (const next of getNext(current.value, current)) {
			const hash = valToHash(next)
			if (!visited.has(hash)) {
				visited.add(hash)
				queue.push({ distance: current.distance + 1, value: next, parent: current })
			}
		}
	}
}


/**
 * @template T
 *
 * @param {(value: T, step: PathItem<T>) => Iterable<T>} getNext
 * @param {T} start
 * @param {(value: T) => number | string} valToHash
 *
 * @returns {Iterable<PathItem<T>>}
 */
export function* bfs(getNext, start, valToHash) {
	const visited = new Set()
	const queue = /** @type {PathItem<T>[]} */ ([{ distance: 0, value: start, parent: null }])

	while (queue.length) {
		const current = queue.shift()
		yield current

		for (const next of getNext(current.value, current)) {
			const hash = valToHash(next)
			if (!visited.has(hash)) {
				visited.add(hash)
				queue.push({ distance: current.distance + 1, value: next, parent: current })
			}
		}
	}
}