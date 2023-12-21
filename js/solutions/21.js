// @ts-check

import { Array2d as A, Graph, V } from "../modules/index.js"
import { it, range } from "../modules/itertools.js"

export const useExample = false

export const exampleInput = `\
...........
.....###.#.
.###.##..#.
..#.#...#..
....#.#....
.##..S####.
.##..#...#.
.......##..
.##.#.####.
.##..##.##.
...........`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = A.parse

/**
 * @param {Iterable<number>} distances
 */
function* collectDistances(distances) {
	let prev = undefined
	let evenCount = 0
	let oddCount = 0
	for (const distance of distances) {
		if (prev !== undefined && distance !== prev) {
			yield prev % 2 === 0 ? evenCount : oddCount
		}
		prev = distance
		evenCount += Number(distance % 2 === 0)
		oddCount += Number(distance % 2 === 1)
	}
}

/**
 * @param {InputType} input
 */
export function part1(input) {
	const startPos = it(A.traverse(input)).find((p) => p.value === "S").pos

	/**
	 * @param {V.Vec2} p
	 */
	const getNexts = (p) =>
		V.DIRS_4.map((dir) => V.add(p, dir)).filter(
			(p) => A.contains(input, p) && A.get(input, p) !== "#",
		)

	return it(Graph.bfs(getNexts, [startPos], (p) => p.join()))
		.map((p) => p.distance)
		.chain((distances) => collectDistances(distances))
		.skip(64)
		.first()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	const startPos = it(A.traverse(input)).find((p) => p.value === "S").pos

	/**
	 * @param {V.Vec2} p
	 */
	const getNexts = (p) =>
		V.DIRS_4.map((dir) => V.add(p, dir)).filter((p) => A.modGet(input, p) !== "#")

	const startX = startPos[0]
	const inputSize = A.height(input)

	const [d1, d2, d3] = it(Graph.bfs(getNexts, [startPos], (p) => p.join()))
		.map((p) => p.distance)
		.chain((distances) => collectDistances(distances))
		.skip(startX)
		.takeEvery(inputSize)
		.take(3)
		.toArray()

	// diff of the diff
	// dd = d3 - d2 - (d2 - d1) = d3 - 2 * d2 + d1
	const dd = d3 - 2 * d2 + d1
	// d3 = dd + 2 * d2 - d1
	// or
	// d[i] = dd + 2 * d[i - 1] - d[i - 2]

	const dp = [d1, d2]
	for (let i = 2; i <= (26501365 - startX) / inputSize; i++) {
		dp[i] = dd + 2 * dp[i - 1] - dp[i - 2]
	}

	return dp.at(-1)
}
