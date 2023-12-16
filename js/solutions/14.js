// @ts-check

import { CyclicSeq } from "../modules/cyclic-map.js"
import { Array2d, V } from "../modules/index.js"
import { it, iterate } from "../modules/itertools.js"
import { DIR_TO_VEC } from "../modules/vec.js"

export const useExample = false

export const exampleInput = `\
O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = Array2d.parse

function tilt(/** @type {string[][]} */ input, dir = DIR_TO_VEC.D) {
	const nextMap = Array2d.clone(input)
	const reverse = dir[0] === 1 || dir[1] === 1

	for (const p of Array2d.traverse(nextMap, "columns", reverse)) {
		if (p.value !== "O") continue

		let cur
		let next = p.pos

		do (cur = next), (next = V.add(next, dir))
		while (Array2d.get(nextMap, next) === ".")

		if (cur === p.pos) continue

		Array2d.set(nextMap, cur, "O")
		Array2d.set(nextMap, p.pos, ".")
	}

	return nextMap
}

/**
 * @param {InputType} input
 */
export function part1(input) {
	return it(Array2d.traverse(tilt(input, DIR_TO_VEC.D)))
		.filter((t) => t.value === "O")
		.map((t) => Array2d.height(input) - V.y(t.pos))
		.sum()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	const { D, L, U, R } = DIR_TO_VEC

	const mapsIter = iterate(input, (m) => [D, L, U, R].reduce(tilt, m))
	const resultMap = CyclicSeq.from(mapsIter, Array2d.toString).get(1_000_000_000)

	return it(Array2d.traverse(resultMap))
		.filter((t) => t.value === "O")
		.map((t) => Array2d.height(input) - V.y(t.pos))
		.sum()
}
