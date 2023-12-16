// @ts-check

import { it, sum } from "../modules/itertools.js"
import { t } from "../modules/parser.js"

export const useExample = false

export const exampleInput = `\
rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = t.arr(t.str(), ",").parse

/**
 * @param {string} str
 */
function getHash(str) {
	let curValue = 0

	for (const c of str) {
		curValue += c.charCodeAt(0)
		curValue *= 17
		curValue %= 256
	}

	return curValue
}

/**
 * @param {InputType} input
 */
export function part1(input) {
	return it(input).map(getHash).sum()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	/** @type {{key: string, value: string}[][]} */
	const boxes = Array.from({ length: 256 }, () => [])

	for (const str of input) {
		const [key, value] = str.split(/[=-]/)

		const box = boxes[getHash(key)]
		const valueIdx = box.findIndex((item) => item.key === key)

		if (value) {
			if (~valueIdx) box[valueIdx].value = value
			else box.push({ key, value })
		} else {
			if (~valueIdx) box.splice(valueIdx, 1)
		}
	}

	return it(boxes)
		.map((b, bi) => b.map((v, vi) => (bi + 1) * (vi + 1) * Number(v.value)))
		.flatMap((b) => b)
		.sum()
}
