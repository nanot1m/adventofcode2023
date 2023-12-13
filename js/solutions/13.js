// @ts-check

import { V } from "../modules/index.js"
import { it } from "../modules/itertools.js"
import { Map2d, parseMap2d } from "../modules/map2d.js"
import { t } from "../modules/parser.js"
import { Range } from "../modules/range.js"

export const useExample = true

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
		.map(findReflectionPosition)
		.map((p) => p.x + p.y * 100)
		.sum()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	let total = 0

	const ogReflections = it(input).map(findReflectionPosition).toArray()

	let idx = 0
	for (const m of input) {
		const widthCenter = m.width / 2
		const heightCenter = m.height / 2
		const ogReflection = ogReflections[idx]
		const ogX = ogReflection.x
		const ogY = ogReflection.y
		let ignoreColumnsRange = new Range(-1, -1)
		let ignoreRowsRange = new Range(-1, -1)
		if (ogX > 0) {
			if (ogX < widthCenter) {
				ignoreColumnsRange = new Range(ogX * 2 - 1, m.width - 1)
			} else {
				ignoreColumnsRange = new Range(0, ogX * 2 - m.width + 1)
			}
		} else {
			if (ogY < heightCenter) {
				ignoreRowsRange = new Range(ogY * 2 - 1, m.height - 1)
			} else {
				ignoreRowsRange = new Range(0, ogY * 2 - m.height + 1)
			}
		}

		console.log({ ignoreColumnsRange, ignoreRowsRange }, idx)

		let found = false
		for (const { pos, value } of m) {
			if (ignoreColumnsRange.includes(pos[0]) || ignoreRowsRange.includes(pos[0])) continue
			m.set(pos, value === "#" ? "." : "#")
			const p = findReflectionPosition(m)
			if (p.x > 0 || p.y > 0) {
				found = true
				total += p.x + p.y * 100
				break
			} else {
				m.set(pos, value)
			}
		}
		if (!found) {
			throw new Error("Smudge not found in map " + idx)
		}
		idx++
	}

	return total
}

/**
 * @param {Map2d<string>} m
 */
function findReflectionPosition(m) {
	const columns = it(m.columns())
		.map(([, cs]) => Array.from(cs, (c) => c.value).join(""))
		.toArray()
	const centerX = findEvenPalindromeCenter(columns)

	const rows = it(m.lines())
		.map(([, cs]) => Array.from(cs, (c) => c.value).join(""))
		.toArray()
	const centerY = findEvenPalindromeCenter(rows)

	const x = centerX === null ? 0 : centerX + 1
	const y = centerY === null ? 0 : centerY + 1

	if (x > 0 && y > 0) {
		return { x: 0, y: 0 }
		// console.log(m.toString({ valToString: (v) => (v === "#" ? "🔳" : "⬜️") }))
		// console.log({ x, y })
		// throw new Error("Both x and y are positive")
	}

	return { x, y }
}

/**
 * @param {string[]} strs
 *
 * @returns {number | null}
 */
function findEvenPalindromeCenter(strs) {
	let j = 0
	for (let i = 0; i < strs.length - 1; i++) {
		const result = expand(i)
		if (j === strs.length || result === -1) {
			return i
		}
	}
	return null

	function expand(/** @type {number} */ i) {
		j = i + 1
		while (i >= 0 && j < strs.length && strs[i] === strs[j]) {
			i--
			j++
		}
		return i
	}
}
