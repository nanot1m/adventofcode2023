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
 * @param {InputType} input
 */
export function part1(input) {
	const steps = 64
	const startPos = it(A.traverse(input)).find((p) => p.value === "S").pos

	/**
	 * @param {V.Vec2} p
	 */
	function getNexts(p) {
		return V.DIRS_4.map((dir) => V.add(p, dir)).filter(
			(p) => A.contains(input, p) && A.get(input, p) !== "#",
		)
	}

	const bfsIter = Graph.bfs(
		(p, s) => (s.distance < steps ? getNexts(p) : []),
		[startPos],
		(p) => p.join(),
	)

	return it(bfsIter)
		.filter((p) => p.distance % 2 === steps % 2)
		.count()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	const startPos = it(A.traverse(input)).find((p) => p.value === "S").pos

	const inputSize = A.height(input)
	const startX = startPos[0]

	const maxDistance = inputSize * 3 + startX

	/**
	 * @param {V.Vec2} p
	 */
	const getNexts = (p) =>
		V.DIRS_4.map((dir) => V.add(p, dir)).filter((p) => A.modGet(input, p) !== "#")

	const bfsIter = Graph.bfs(
		(p, s) => (s.distance < maxDistance ? getNexts(p) : []),
		[startPos],
		(p) => p.join(),
	)

	const distances = it(bfsIter)
		.map((p) => p.distance)
		.toArray()

	const [d1, d2, d3] = it(range(0, maxDistance + 1))
		.skip(startX)
		.takeEvery(inputSize)
		.map((i) => it(distances).count((d) => d <= i && d % 2 === i % 2))
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
