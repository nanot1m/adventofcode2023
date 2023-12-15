// @ts-check

import { it } from "../modules/itertools.js"
import { t } from "../modules/parser.js"

export const useExample = false

export const exampleInput = `\
rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = t.arr(t.str(), ",").parse

/**
 * @param {string} str
 */
const getHash = (str) => it(str).reduce((cur, c) => ((cur + c.charCodeAt(0)) * 17) % 256, 0)

/**
 * @param {InputType} input
 */
export function part1(input) {
	return it(input)
		.map((str) => it(str).reduce((cur, c) => ((cur + c.charCodeAt(0)) * 17) % 256, 0))
		.sum()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	const boxes = it(input)
		.map((str) => str.split(/[=-]/))
		.reduce(
			(boxes, [key, value]) => {
				const hash = it(key).reduce((cur, c) => ((cur + c.charCodeAt(0)) * 17) % 256, 0)
				const idx = boxes[hash].findIndex((item) => item.key === key)
				if (value) {
					if (~idx) boxes[hash][idx].value = value
					else boxes[hash].push({ key, value })
				} else {
					if (~idx) boxes[hash].splice(idx, 1)
				}
				return boxes
			},
			Array.from({ length: 256 }, () => []),
		)

	return it(boxes)
		.map((b, bi) =>
			it(b)
				.map((v, vi) => (bi + 1) * (vi + 1) * Number(v.value))
				.sum(),
		)
		.sum()
}
