// @ts-check

import { first, it, iterate, last } from "../modules/itertools.js"
import { t } from "../modules/parser.js"

export const useExample = false

export const exampleInput = `\
0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = t.arr(t.arr(t.int(), " ")).parse

const diffsByPairs = (/** @type {Iterable<number>} */ nums) =>
	it(nums)
		.windowed(2)
		.map(([a, b]) => b - a)
		.toArray()

/**
 * @param {InputType} input
 */
export function part1(input) {
	return it(input)
		.map((line) =>
			it(iterate(line, diffsByPairs))
				.takeWhile((cur) => cur.some(Boolean))
				.map(last)
				.sum(),
		)
		.sum()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	return it(input)
		.map((line) =>
			it(iterate(line, diffsByPairs))
				.takeWhile((cur) => cur.some(Boolean))
				.map(first)
				.toArray()
				.reduceRight((acc, b) => b - acc),
		)
		.sum()
}
