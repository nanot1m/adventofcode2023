// @ts-check

import { V } from "../modules/index.js"
import { it } from "../modules/itertools.js"
import { add, combinations } from "../modules/lib.js"
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

export const parseInput = parseMap2d

/**
 * @param {InputType} input
 */
export function part1(input, count = 2) {
	const extraLines = it(input.lines())
		.filter(([, line]) => line.every((cell) => cell.value === "."))
		.map(([y]) => y)
		.toArray()
	const extraCols = it(input.columns())
		.filter(([, column]) => column.every((cell) => cell.value === "."))
		.map(([x]) => x)
		.toArray()

	const galaxies = it(input)
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
