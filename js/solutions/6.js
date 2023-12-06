// @ts-check

import { it, zip } from "../modules/itertools.js"
import { solveSquareEquation } from "../modules/lib.js"
import { t } from "../modules/parser.js"

export const useExample = false

export const exampleInput = `\
Time:      7  15   30
Distance:  9  40  200`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = t.str().parse

/**
 *
 * @param {[number, number]} param0
 * @returns
 */
function countDistance([a, b]) {
	const aa = Number.isInteger(a) ? a - 1 : Math.floor(a)
	const bb = Number.isInteger(b) ? b + 1 : Math.ceil(b)
	return aa - bb + 1
}

/**
 * @param {InputType} input
 */
export function part1(input) {
	const template = t.tpl`Time: ${"times|int[]"}\nDistance: ${"distances|int[]"}`
	const { times, distances } = template.parse(input)

	return it(zip(times, distances))
		.map(([time, distance]) => solveSquareEquation(1, -time, distance))
		.map((solutions) => (solutions.length === 2 ? countDistance(solutions) : 0))
		.multiply()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	const template = t.tpl`Time:${"time|int"}\nDistance:${"distance|int"}`
	const { time, distance } = template.parse(input.replaceAll(" ", ""))

	return it
		.of([time, distance])
		.map(([time, distance]) => solveSquareEquation(1, -time, distance))
		.map((solutions) => (solutions.length === 2 ? countDistance(solutions) : 0))
		.first()
}
