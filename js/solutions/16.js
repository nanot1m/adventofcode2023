// @ts-check

import { V } from "../modules/index.js"
import { it } from "../modules/itertools.js"
import { Map2d, parseMap2d } from "../modules/map2d.js"
import { DIR_TO_VEC } from "../modules/vec.js"

export const useExample = false

export const exampleInput = `\
.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = parseMap2d

/**
 * @param {string} point
 * @param {V.Vec2} dir
 */
function getNextDirections(point, dir) {
	const { U, R, D, L } = DIR_TO_VEC
	if (point === "/" && U === dir) return [L]
	if (point === "/" && L === dir) return [U]
	if (point === "/" && D === dir) return [R]
	if (point === "/" && R === dir) return [D]
	if (point == "\\" && U === dir) return [R]
	if (point == "\\" && R === dir) return [U]
	if (point == "\\" && D === dir) return [L]
	if (point == "\\" && L === dir) return [D]
	if (point === "|" && R === dir) return [U, D]
	if (point === "|" && L === dir) return [U, D]
	if (point === "-" && D === dir) return [L, R]
	if (point === "-" && U === dir) return [L, R]
	return [dir]
}

/**
 * @param {InputType} input
 */
export function part1(input, startPos = V.vec(0, 0), startDir = DIR_TO_VEC.R) {
	/** @type {Map2d<Map2d<number>>} */
	const visited = new Map2d()

	const queue = [{ pos: startPos, dir: startDir }]

	let p
	while ((p = queue.pop())) {
		if (visited.get(p.pos)?.has(p.dir)) continue
		visited.set(p.pos, (visited.get(p.pos) ?? new Map2d()).set(p.dir, 1))

		for (const dir of getNextDirections(input.get(p.pos), p.dir)) {
			const pos = V.add(p.pos, dir)
			if (input.has(pos)) queue.push({ pos: pos, dir })
		}
	}

	return it(visited).count()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	return it(input.borders())
		.flatMap((p) => V.DIRS_4.map((dir) => ({ pos: p.pos, dir })))
		.map((p) => part1(input, p.pos, p.dir))
		.max()
}
