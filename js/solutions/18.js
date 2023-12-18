// @ts-check

import { V } from "../modules/index.js"
import { t } from "../modules/parser.js"

export const useExample = false

export const exampleInput = `\
R 6 (#70c710)
D 5 (#0dc571)
L 2 (#5713f0)
D 2 (#d2c081)
R 2 (#59c680)
D 2 (#411b91)
L 5 (#8ceee2)
U 2 (#caa173)
L 1 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 3 (#a77fa3)
L 2 (#015232)
U 2 (#7a21e3)`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = t.arr(t.tpl`${"dir|str"} ${"len|int"} (#${"color|str"})`).parse

/**
 * @param {InputType} input
 */
export function part1(input) {
	let area = 0
	let perimeter = 0
	let cur = V.vec(0, 0)
	for (const { dir, len } of input) {
		const next = V.add(cur, V.scale(V.DIR_TO_VEC[dir], len))
		area += V.cross(cur, next)
		perimeter += len
		cur = next
	}
	return (area + perimeter) / 2 + 1
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	return part1(
		input.map(({ color }) => ({
			dir: ["R", "D", "L", "U"][+color.at(-1)],
			len: parseInt(color.slice(0, -1), 16),
			color,
		})),
	)
}
