// @ts-check

import { Graph, V } from "../modules/index.js"
import { count, find, it } from "../modules/itertools.js"
import { Map2d, parseMap2d } from "../modules/map2d.js"
import { DIR_TO_VEC } from "../modules/vec.js"

export const useExample = false

export const exampleInput = `\
FF7FSF7F7F7F7F7F---7
L|LJ||||||||||||F--J
FL-7LJLJ||||||LJL-77
F--JF--7||LJLJ7F7FJ-
L---JF-JLJ.||-FJLJJ7
|F|F-JF---7F7-L7L|7|
|FFJF7L7F-JF7|JL---7
7-L-JL7||F7|L7F-7F7|
L.L7LFJ|||||FJL7||LJ
L7JLJL-JLJLJL--JLJ.L`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = parseMap2d

/*
| is a vertical pipe connecting north and south.
- is a horizontal pipe connecting east and west.
L is a 90-degree bend connecting north and east.
J is a 90-degree bend connecting north and west.
7 is a 90-degree bend connecting south and west.
F is a 90-degree bend connecting south and east.
. is ground; there is no pipe in this tile.
S is the starting position of the animal; there is a pipe on this tile, but your sketch doesn't show what shape the pipe has.
*/

/** @type {Record<string, V.Vec2[]>} */
const PIPE_DIRECTIONS = {
	"|": [DIR_TO_VEC.D, DIR_TO_VEC.U],
	"-": [DIR_TO_VEC.L, DIR_TO_VEC.R],
	L: [DIR_TO_VEC.U, DIR_TO_VEC.R],
	J: [DIR_TO_VEC.U, DIR_TO_VEC.L],
	7: [DIR_TO_VEC.D, DIR_TO_VEC.L],
	F: [DIR_TO_VEC.D, DIR_TO_VEC.R],
	S: V.DIRS_4,
}

/**
 * @param {V.Vec2} pos
 * @param {V.Vec2[]} exits
 */
function getSReplacer(pos, [exitA, exitB]) {
	const outDir = V.sub(exitA, pos)
	const inDir = V.sub(exitB, pos)

	for (const pipe in PIPE_DIRECTIONS) {
		if (pipe === "S") continue
		const hasInPipe = PIPE_DIRECTIONS[pipe].find((d) => V.eq(d, inDir))
		const hasOutPipe = PIPE_DIRECTIONS[pipe].find((d) => V.eq(d, outDir))
		if (hasInPipe && hasOutPipe) return pipe
	}

	throw new Error(`No pipe found for ${outDir} -> ${inDir}`)
}

/**
 *
 * @param {V.Vec2} pos
 * @param {Map2d<string>} inputMap
 * @returns
 */
function getPipeDirs(pos, inputMap) {
	return PIPE_DIRECTIONS[inputMap.get(pos)] ?? []
}

/**
 * @param {V.Vec2} pos
 * @param {InputType} inputMap
 * @returns {V.Vec2[]}
 */
function getNeighbors(pos, inputMap) {
	return getPipeDirs(pos, inputMap)
		.filter((d) => getPipeDirs(V.add(pos, d), inputMap).find((t) => V.eq(t, V.neg(d))))
		.map((d) => V.add(pos, d))
}

/**
 * @param {InputType} input
 */
export function part1(input) {
	const dfsIter = Graph.dfs(
		(p) => getNeighbors(p, input),
		find(input, (p) => p.value === "S").pos,
		(p) => p.join(),
	)
	return count(dfsIter) / 2
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	const startPos = it(input).find((p) => p.value === "S").pos
	const pipeLoop = Array.from(
		Graph.dfs(
			(p) => getNeighbors(p, input),
			it(input).find((p) => p.value === "S").pos,
			(p) => p.join(),
		),
	)
	const pipesMap = it(pipeLoop)
		.map((p) => p.value)
		.reduce((acc, p) => acc.set(p, true), new Map2d())

	// replace trash pipes with '.'
	const map = it(input).reduce(
		(acc, p) => acc.set(p.pos, pipesMap.has(p.pos) ? p.value : "."),
		new Map2d(),
	)

	map.set(startPos, getSReplacer(startPos, [pipeLoop[1].value, pipeLoop.at(-1).value]))

	const insideMap = new Map2d()

	const verticalPipes = "|LJ7FS"
	const angleStartPipes = "LF"

	for (let y = map.bounds.minY; y <= map.bounds.maxY; y++) {
		let isInside = false
		for (let x = map.bounds.minX - 1; x <= map.bounds.maxX; x++) {
			const pipe = map.get([x, y])
			if (pipe === ".") {
				insideMap.set([x, y], isInside)
			}
			if (angleStartPipes.includes(pipe)) {
				while (map.get([x + 1, y]) === "-") x++
			}
			if (verticalPipes.includes(pipe)) {
				isInside = !isInside
				if (pipe === "L" && map.get([x + 1, y]) === "7") x++
				if (pipe === "F" && map.get([x + 1, y]) === "J") x++
			}
		}
	}

	return it(map)
		.filter((p) => insideMap.get(p.pos))
		.count()
}
