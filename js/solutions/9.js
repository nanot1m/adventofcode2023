// @ts-check

import { iterate } from "../modules/itertools.js"
import { t } from "../modules/parser.js"

export const useExample = false

export const exampleInput = `\
0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = t.arr(t.arr(t.int())).parse

const diffsByPairs = (/** @type {IteratorObject<number>} */ nums) =>
	nums.windowed(2).map(([a, b]) => b - a)

/**
 * @param {InputType} input
 */
export function part1(input) {
	return input
		.values()
		.map((line) =>
			iterate(line.values(), diffsByPairs)
				.takeWhile((cur) => cur.some(Boolean))
				.map((it) => it.last())
				.sum(),
		)
		.sum()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	return input
		.values()
		.map((line) =>
			iterate(line.values(), diffsByPairs)
				.takeWhile((cur) => cur.some(Boolean))
				.map((it) => it.first())
				.toArray()
				.reduceRight((acc, b) => b - acc),
		)
		.sum()
}
