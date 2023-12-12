// @ts-check

import { it } from "../modules/itertools.js"
import { repeatWithDelimiters } from "../modules/lib.js"
import { t } from "../modules/parser.js"

export const useExample = false

export const exampleInput = `\
???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = t.arr(t.tuple([t.str(), t.arr(t.int())], " "), "\n").parse

/**
 * @param {InputType} input
 */
export function part1(input) {
	/**
	 * @param {string | string[]} springs
	 * @param {number[]} damaged
	 * @returns {number}
	 */
	function recur(springs, damaged, pos = 0, groupIdx = 0, groupLen = 0, memo = new Map()) {
		const key = `${pos},${groupIdx},${groupLen}`
		if (memo.has(key)) return memo.get(key)

		if (pos === springs.length) {
			if (groupIdx === damaged.length - 1 && groupLen === damaged[groupIdx]) return 1
			if (groupIdx === damaged.length && groupLen === 0) return 1
			return 0
		}

		let count = 0

		const recurDot = () => {
			if (groupLen === 0) {
				count += recur(springs, damaged, pos + 1, groupIdx, 0, memo)
			} else if (groupLen === damaged[groupIdx]) {
				count += recur(springs, damaged, pos + 1, groupIdx + 1, 0, memo)
			}
		}

		const recurHash = () => {
			count += recur(springs, damaged, pos + 1, groupIdx, groupLen + 1, memo)
		}

		if (springs[pos] === ".") recurDot()
		if (springs[pos] === "#") recurHash()
		if (springs[pos] === "?") {
			recurDot()
			recurHash()
		}

		memo.set(key, count)
		return count
	}

	return it(input)
		.map(([springs, damaged]) => recur(springs, damaged))
		.sum()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	return part1(
		input.map(([springs, damaged]) => [
			repeatWithDelimiters(springs, "?", 5),
			repeatWithDelimiters(damaged, [], 5),
		]),
	)
}
