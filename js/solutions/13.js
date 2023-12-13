// @ts-check

import { it } from "../modules/itertools.js"
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
		.map((p) => findReflectionPosition(p))
		.map((p) => p.x + p.y * 100)
		.sum()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	let total = 0

	let idx = 0
	for (const m of input) {
		const og = findReflectionPosition(m)

		let found = false
		outer: for (const { pos, value } of m) {
			m.set(pos, value === "#" ? "." : "#")
			const md = findReflectionPosition(m, og)

			const points = []
			if (md.x > 0 && md.y > 0) {
				points.push({ x: md.x, y: 0 }, { x: 0, y: md.y })
			} else if (md.x > 0 || md.y > 0) {
				points.push(md)
			}

			for (const p of points) {
				found = true
				total += p.x + p.y * 100
				break outer
			}
			m.set(pos, value)
		}
		if (!found) {
			console.log(m.toString())
			throw new Error("Smudge not found in map " + idx)
		}
		idx++
	}

	return total
}

/**
 * @param {Map2d<string>} m
 */
function findReflectionPosition(m, og = { x: 0, y: 0 }) {
	const columns = it(m.columns())
		.map(([, cs]) => Array.from(cs, (c) => c.value).join(""))
		.toArray()
	const centerX = findEvenPalindromeCenter(columns, [og.x - 1])

	const rows = it(m.lines())
		.map(([, cs]) => Array.from(cs, (c) => c.value).join(""))
		.toArray()
	const centerY = findEvenPalindromeCenter(rows, [og.y - 1])

	const x = centerX === null ? 0 : centerX + 1
	const y = centerY === null ? 0 : centerY + 1

	return { x, y }
}

/**
 * @param {string[]} strs
 * @param {number[]} skips
 *
 * @returns {number | null}
 */
function findEvenPalindromeCenter(strs, skips = []) {
	let longest = [0, 0]
	let longestIdx = -1
	let right = 0
	let found = false
	for (let i = 0; i < strs.length - 1; i++) {
		if (skips.includes(i)) continue
		const left = expand(i)
		if (right === strs.length || left === -1) {
			found = true
			if (right - left > longest[1] - longest[0]) {
				longest = [left + 1, right - 1]
				longestIdx = i
			}
		}
	}
	return found ? longestIdx : null

	function expand(/** @type {number} */ left) {
		right = left + 1
		while (left >= 0 && right < strs.length && strs[left] === strs[right]) {
			left--
			right++
		}
		return left
	}
}
