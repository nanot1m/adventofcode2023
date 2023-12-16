// @ts-check

import { Array2d, V } from "../modules/index.js"
import { it } from "../modules/itertools.js"
import { add, combinations, tuple } from "../modules/lib.js"
import { parseMap2d } from "../modules/map2d.js"
import { Range } from "../modules/range.js"

export const useExample = false

export const exampleInput = `\
...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = Array2d.parse

/**
 * @param {InputType} input
 */
export function part1(input, count = 2) {
	const extraLines = input
		.map(tuple)
		.filter(([line]) => line.every((cell) => cell === "."))
		.map(([, y]) => y)
	const extraCols = Array2d.transpose(input)
		.map(tuple)
		.filter(([line]) => line.every((cell) => cell === "."))
		.map(([, x]) => x)
	const galaxies = it(Array2d.traverse(input))
		.filter((x) => x.value === "#")
		.toArray()

	return combinations(galaxies, 2)
		.map(([a, b]) => {
			const xRange = new Range(a.pos[0], b.pos[0])
			const extraX = extraCols.filter((x) => xRange.includes(x)).length * (count - 1)
			const yRange = new Range(a.pos[1], b.pos[1])
			const extraY = extraLines.filter((y) => yRange.includes(y)).length * (count - 1)
			return V.mLen(a.pos, b.pos) + extraX + extraY
		})
		.reduce(add, 0)
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	return part1(input, 1_000_000)
}
