// @ts-check

import { Array2d, Graph, V } from "../modules/index.js"
import { it } from "../modules/itertools.js"

export const useExample = false

export const exampleInput = `\
2413432311323
3215453535623
3255245654254
3446585845452
4546657867536
1438598798454
4457876987766
3637877979653
4654967986887
4564679986453
1224686865563
2546548887735
4322674655533`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = Array2d.parse

/**
 * @param {InputType} input
 */
export function part1(input) {
	const iter = Graph.dijkstra(
		(p) =>
			V.DIRS_4.filter((dir) => !V.eq(p.dir, V.neg(dir)))
				.map((dir) => ({
					pos: V.add(p.pos, dir),
					dir,
					distance: V.eq(dir, p.dir) ? p.distance + 1 : 0,
				}))
				.filter((n) => Array2d.contains(input, n.pos) && n.distance < 3),
		(p) => +Array2d.get(input, p.pos),
		[
			{ pos: V.vec(0, 1), dir: V.vec(0, 1), distance: 0 },
			{ pos: V.vec(1, 0), dir: V.vec(1, 0), distance: 0 },
		],
		(p) => `${p.pos.join()}:${p.dir.join()}:${p.distance}`,
	)

	const targetPos = V.vec(Array2d.width(input) - 1, Array2d.height(input) - 1)
	return it(iter).find((p) => V.eq(p.value.pos, targetPos)).distance
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	const iter = Graph.dijkstra(
		(p) =>
			p.distance < 3
				? [
						{
							pos: V.add(p.pos, p.dir),
							dir: p.dir,
							distance: p.distance + 1,
						},
				  ].filter((n) => Array2d.contains(input, n.pos))
				: V.DIRS_4.filter((dir) => !V.eq(p.dir, V.neg(dir)))
						.map((dir) => ({
							pos: V.add(p.pos, dir),
							dir,
							distance: V.eq(dir, p.dir) ? p.distance + 1 : 0,
						}))
						.filter((n) => Array2d.contains(input, n.pos) && n.distance < 10),
		(p) => +Array2d.get(input, p.pos),
		[
			{ pos: V.vec(0, 1), dir: V.vec(0, 1), distance: 0 },
			{ pos: V.vec(1, 0), dir: V.vec(1, 0), distance: 0 },
		],
		(p) => `${p.pos.join()}:${p.dir.join()}:${p.distance}`,
	)

	const targetPos = V.vec(Array2d.width(input) - 1, Array2d.height(input) - 1)
	const result = it(iter).find((p) => V.eq(p.value.pos, targetPos) && p.value.distance >= 3)

	return result.distance
}
