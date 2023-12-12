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
 * @param {string} pattern
 * @param {number[]} groups
 * @returns {number}
 */
function recur(pattern, groups, pos = 0, curGroupIdx = 0, curGroupLength = 0, memo = new Map()) {
	const key = `${pos},${curGroupIdx},${curGroupLength}`
	if (memo.has(key)) return memo.get(key)

	if (pos === pattern.length) {
		if (curGroupIdx === groups.length - 1 && curGroupLength === groups[curGroupIdx]) return 1
		if (curGroupIdx === groups.length && curGroupLength === 0) return 1
		return 0
	}

	const recurDot = () => {
		if (curGroupLength === 0) {
			return recur(pattern, groups, pos + 1, curGroupIdx, 0, memo)
		}
		if (curGroupLength === groups[curGroupIdx]) {
			return recur(pattern, groups, pos + 1, curGroupIdx + 1, 0, memo)
		}
		return 0
	}

	const recurHash = () => {
		return recur(pattern, groups, pos + 1, curGroupIdx, curGroupLength + 1, memo)
	}

	let count = 0
	if (pattern[pos] === "?") count += recurDot() + recurHash()
	if (pattern[pos] === ".") count += recurDot()
	if (pattern[pos] === "#") count += recurHash()

	memo.set(key, count)
	return count
}

/**
 * @param {InputType} input
 */
export function part1(input) {
	return it(input)
		.map(([pattern, groups]) => recur(pattern, groups))
		.sum()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	input = input.map(([pattern, groups]) => [
		repeatWithDelimiters(pattern, "?", 5),
		repeatWithDelimiters(groups, [], 5),
	])
	return it(input)
		.map(([pattern, groups]) => recur(pattern, groups))
		.sum()
}
