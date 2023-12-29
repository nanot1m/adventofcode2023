// @ts-check

import { Array2d, Graph, V } from "../modules/index.js"

export const useExample = false

export const exampleInput = `\
#.#####################
#.......#########...###
#######.#########.#.###
###.....#.>.>.###.#.###
###v#####.#v#.###.#.###
###.>...#.#.#.....#...#
###v###.#.#.#########.#
###...#.#.#.......#...#
#####.#.#.#######.#.###
#.....#.#.#.......#...#
#.#####.#.#.#########v#
#.#...#...#...###...>.#
#.#.#v#######v###.###v#
#...#.>.#...>.>.#.###.#
#####v#.#.###v#.#.###.#
#.....#...#...#.#.#...#
#.#########.###.#.#.###
#...###...#...#...#.###
###.###.#.###v#####v###
#...#...#.#.>.>.#.>.###
#.###.###.#.###.#.#v###
#.....###...###...#...#
#####################.#`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = Array2d.parse

/** @type {Record<string, Readonly<V.Vec2>>} */
const slopes = {
	">": V.DIR_TO_VEC.R,
	"<": V.DIR_TO_VEC.L,
	"^": V.DIR_TO_VEC.U,
	v: V.DIR_TO_VEC.D,
}

const imVec = {
	/** @type {Map<string, Readonly<V.Vec2>>} */
	cache: new Map(),
	vec: (/** @type {number} */ x, /** @type {number} */ y) => {
		const key = `${x}:${y}`
		if (!imVec.cache.has(key)) imVec.cache.set(key, V.vec(x, y))
		return imVec.cache.get(key)
	},
	add: (/** @type {Readonly<V.Vec2>} */ a, /** @type {Readonly<V.Vec2>} */ b) =>
		imVec.vec(a[0] + b[0], a[1] + b[1]),
}

/**
 * @param {InputType} input
 */
export function part1(input) {
	const startPos = imVec.vec(1, 0)
	const endPos = imVec.vec(Array2d.width(input) - 2, Array2d.height(input) - 1)

	const graph = compressGraph(startPos, (pos) => {
		let nexts =
			Array2d.get(input, pos) in slopes
				? [imVec.add(pos, slopes[Array2d.get(input, pos)])]
				: V.DIRS_4.map((d) => imVec.add(pos, d))
		return nexts.filter((p) => Array2d.contains(input, p) && Array2d.get(input, p) !== "#")
	})

	const dfsIter = Graph.dfs(
		({ distance: d, node, visited: v }) =>
			node.children
				.filter((n) => v.indexOf(n.node.pos) === -1)
				.map((n) => ({ node: n.node, distance: d + n.distance, visited: [...v, node.pos] })),
		{ node: graph.get(startPos), distance: 0, visited: [] },
	)

	let result = 0
	for (const val of dfsIter) {
		if (val.value.node.pos === endPos) {
			result = Math.max(result, val.value.distance)
		}
	}

	return result
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	const startPos = imVec.vec(1, 0)
	const endPos = imVec.vec(Array2d.width(input) - 2, Array2d.height(input) - 1)

	const graph = compressGraph(startPos, (pos) =>
		V.DIRS_4.map((d) => imVec.add(pos, d)).filter(
			(p) => Array2d.contains(input, p) && Array2d.get(input, p) !== "#",
		),
	)

	let result = 0

	/**
	 * @param {Node} node
	 * @param {number} distance
	 * @param {Map<Readonly<V.Vec2>, boolean>} visited
	 */
	function backtrack(node, distance, visited) {
		if (node.pos === endPos) {
			result = Math.max(result, distance)
		} else {
			for (const child of node.children) {
				if (visited.get(child.node.pos) === true) continue
				visited.set(node.pos, true)
				backtrack(child.node, distance + child.distance, visited)
				visited.set(node.pos, false)
			}
		}
	}
	backtrack(graph.get(startPos), 0, new Map())

	return result
}

/**
 * @typedef {object} Node
 * @property {Readonly<V.Vec2>} pos
 * @property {{node: Node, distance: number}[]} children
 */

/**
 * @param {Readonly<V.Vec2>} startPos
 * @param {(pos: Readonly<V.Vec2>) => Readonly<V.Vec2>[]} getAdjacents
 */
function compressGraph(startPos, getAdjacents) {
	/** @type {Node} */
	let startNode = { pos: startPos, children: [] }

	const nodeMap = new Map([[startPos, startNode]])

	const queue = [startNode]
	const memo = new Set()

	while (queue.length > 0) {
		const current = queue.shift()
		if (memo.has(current.pos)) continue
		memo.add(current.pos)

		const nexts = getAdjacents(current.pos)

		const visited = [current.pos]
		const getNexts = (/** @type {Readonly<V.Vec2>} */ pos) =>
			getAdjacents(pos).filter((p) => visited.indexOf(p) === -1)

		for (const pos of nexts) {
			visited.push(pos)

			let nNexts = getNexts(pos)
			let distance = 1
			let prev = [pos]
			while (nNexts.length === 1) {
				visited.push(nNexts[0])
				prev = nNexts
				nNexts = getNexts(nNexts[0])
				distance++
			}

			const node = nodeMap.get(prev[0]) ?? {
				pos: prev[0],
				children: [],
			}
			nodeMap.set(node.pos, node)
			current.children.push({ node, distance })
			queue.push(node)
		}
	}

	return nodeMap
}
