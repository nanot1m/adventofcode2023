// @ts-check

import { CyclicMap } from "../modules/cyclic-map.js"
import { V } from "../modules/index.js"
import { it, iterate } from "../modules/itertools.js"
import { toString } from "../modules/lib.js"
import { Map2d, parseMap2d } from "../modules/map2d.js"
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

export const parseInput = parseMap2d

function tilt(/** @type {Map2d<string>} */ input, /** @type {V.Vec2} */ dir) {
	const zeros = it(input)
		.filter((t) => t.value === "O")
		.toArray()

	if (V.eq(dir, DIR_TO_VEC.U) || V.eq(dir, DIR_TO_VEC.R)) zeros.reverse()

	for (const p of zeros) {
		let cur
		let next = p.pos

		do (cur = next), (next = V.add(next, dir))
		while (input.get(next) === ".")

		if (cur === p.pos) continue

		input.set(cur, "O")
		input.set(p.pos, ".")
	}

	return input
}

/**
 * @param {InputType} input
 */
export function part1(input) {
	return it(tilt(input, [0, -1]))
		.filter((t) => t.value === "O")
		.map((t) => input.height - t.pos[1])
		.sum()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	const dirs = [DIR_TO_VEC.D, DIR_TO_VEC.L, DIR_TO_VEC.U, DIR_TO_VEC.R]

	const mapsIter = iterate(input, (m) => dirs.reduce(tilt, m))
	const resultMap = CyclicMap.from(it(mapsIter).map(toString)).get(1_000_000_000)

	return it(parseMap2d(resultMap))
		.filter((t) => t.value === "O")
		.map((t) => input.height - V.y(t.pos))
		.sum()
}
