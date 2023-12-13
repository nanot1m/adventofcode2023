// @ts-check

import { it, iterate, range } from "../modules/itertools.js"
import { tuple } from "../modules/lib.js"
import { Map2d, parseMap2d } from "../modules/map2d.js"
import { t } from "../modules/parser.js"

export const useExample = false

export const exampleInput = `\
#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = t.arr(t.str()).map((lines) => lines.map(parseMap2d)).parse

/**
 * @param {InputType} input
 */
export function part1(input) {
	return it(input)
		.map((p) => getFoldPosition(p))
		.map((p) => p.x + p.y * 100)
		.sum()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	return it(input)
		.map((m) => tuple(m, getFoldPosition(m)))
		.map(([m, og]) =>
			it(m)
				.map(({ pos, value }) => {
					m.set(pos, value === "#" ? "." : "#")
					const p = getFoldPosition(m, og)
					m.set(pos, value)
					return p
				})
				.filter((p) => p.x > 0 || p.y > 0)
				.map((p) => p.x + p.y * 100)
				.first(),
		)
		.sum()
}

/**
 * @param {Map2d<string>} m
 */
function getFoldPosition(m, og = { x: 0, y: 0 }) {
	const columns = it(m.columns())
		.map(([, cs]) => cs.map((c) => c.value).join(""))
		.toArray()

	const rows = it(m.lines())
		.map(([, cs]) => cs.map((c) => c.value).join(""))
		.toArray()

	return {
		x: findEvenPalindromeCenter(columns, og.x - 1) + 1,
		y: findEvenPalindromeCenter(rows, og.y - 1) + 1,
	}
}

/**
 * @param {string[]} strs
 * @param {number} skip
 * @returns {number | null}
 */
function findEvenPalindromeCenter(strs, skip = -1) {
	let longestLen = 0
	let longestIdx = -1

	for (let i = 0; i < strs.length - 1; i++) {
		if (i === skip) continue

		let left = i
		let right = i + 1
		while (left >= 0 && right < strs.length && strs[left] === strs[right]) {
			left--
			right++
		}

		if (right === strs.length || left === -1) {
			if (right - left > longestLen) {
				longestLen = right - left
				longestIdx = i
			}
		}
	}

	return longestIdx
}
