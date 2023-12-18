// @ts-check

import { Array2d, Graph, V } from "../modules/index.js"
import { it } from "../modules/itertools.js"
import { DIR_TO_VEC } from "../modules/vec.js"

export const useExample = false

export const exampleInput = `\
.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = Array2d.parse

/**
 * @param {string} point
 * @param {V.Vec2} dir
 */
function getNextDirections(point, dir) {
	const { U, R, D, L } = DIR_TO_VEC
	if (point === "/" && D === dir) return [L]
	if (point === "/" && L === dir) return [D]
	if (point === "/" && U === dir) return [R]
	if (point === "/" && R === dir) return [U]
	if (point == "\\" && D === dir) return [R]
	if (point == "\\" && R === dir) return [D]
	if (point == "\\" && U === dir) return [L]
	if (point == "\\" && L === dir) return [U]
	if (point === "|" && R === dir) return [U, D]
	if (point === "|" && L === dir) return [U, D]
	if (point === "-" && U === dir) return [L, R]
	if (point === "-" && D === dir) return [L, R]
	return [dir]
}

/**
 * @param {InputType} input
 */
export function part1(input, pos = V.vec(0, 0), dir = DIR_TO_VEC.R) {
	const dfsIter = Graph.dfs(
		(cur) =>
			getNextDirections(Array2d.get(input, cur.pos), cur.dir)
				.map((dir) => ({ pos: V.add(cur.pos, dir), dir }))
				.filter((p) => Array2d.contains(input, p.pos)),
		{ pos, dir },
		(p) => `${p.pos.join()}:${p.dir.join()}`,
	)
	return it(dfsIter)
		.map((p) => p.value.pos.join())
		.distinct()
		.count()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	return it(Array2d.borders(input))
		.flatMap((p) => V.DIRS_4.map((dir) => ({ pos: p.pos, dir })))
		.map((p) => part1(input, p.pos, p.dir))
		.max()
}
