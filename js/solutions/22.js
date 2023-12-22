// @ts-check

import { V3 } from "../modules/index.js"
import { it } from "../modules/itertools.js"
import { tuple } from "../modules/lib.js"
import { t } from "../modules/parser.js"

export const useExample = false

export const exampleInput = `\
1,0,1~1,2,1
0,0,2~2,0,2
0,2,3~2,2,3
0,0,4~0,2,4
2,0,5~2,2,5
0,1,6~2,1,6
1,1,8~1,1,9`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = t.arr(t.tpl`${"start|vec3"}~${"end|vec3"}`).parse

/** @typedef {InputType[number]} Brick */

/**
 * @param {InputType} input
 */
export function part1(input) {
	const brickSuppportMap = getBrickSupportMap(input)

	return it(brickSuppportMap.keys()).count((brick) =>
		it(brickSuppportMap.values())
			.filter((b) => b.supportedBy.has(brick))
			.every((b) => b.supportedBy.size > 1),
	)
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	const brickSuppportMap = getBrickSupportMap(input)

	/**
	 * @param {Brick} brick
	 * @returns {number}
	 */
	function whatIfRemoveBrick(brick, removedBricks = new Set([brick])) {
		it(brickSuppportMap.get(brick).supports)
			.filter((s) => it(brickSuppportMap.get(s).supportedBy).every((b) => removedBricks.has(b)))
			.forEach((s) => {
				removedBricks.add(s)
				whatIfRemoveBrick(s, removedBricks)
			})
		return removedBricks.size - 1
	}

	return it(input)
		.map((brick) => whatIfRemoveBrick(brick))
		.sum()
}

/**
 * @param {InputType} input
 */
function getBrickSupportMap(input) {
	input.sort((a, b) => a.start[2] - b.start[2])

	/** @type {Record<number, Record<number, Record<number, Brick | undefined>>>} */
	const map3d = {}

	/**
	 * @param {V3.Vec3} vec
	 * @param {Brick | undefined} value
	 */
	const mapSet = ([x, y, z], value) => {
		if (!map3d[x]) map3d[x] = {}
		if (!map3d[x][y]) map3d[x][y] = {}
		map3d[x][y][z] = value
	}

	/**
	 * @param {V3.Vec3} pos
	 * @returns {Brick | undefined}
	 */
	const mapGet = ([x, y, z]) => {
		return map3d[x]?.[y]?.[z]
	}

	/**
	 * @param {Brick} brick
	 *
	 * @returns {V3.Vec3[]}
	 */
	const getIntersectedPoints = (brick) => {
		const points = []

		for (const point of V3.line(brick.start, brick.end)) {
			if (mapGet(point)) points.push(point)
		}

		return points
	}

	const DIR_Z_BOT = V3.vec3(0, 0, -1)

	const brickSuppportMap = new Map(
		input.map((brick) => tuple(brick, { supports: new Set(), supportedBy: new Set() })),
	)

	for (const brick of input) {
		let prevBrick = brick
		let currentBrick = brick
		let intersectedPoints = getIntersectedPoints(currentBrick)

		while (intersectedPoints.length === 0 && currentBrick.start[2] > 0) {
			prevBrick = currentBrick
			currentBrick = {
				start: V3.add(currentBrick.start, DIR_Z_BOT),
				end: V3.add(currentBrick.end, DIR_Z_BOT),
			}
			intersectedPoints = getIntersectedPoints(currentBrick)
		}

		for (const point of V3.line(prevBrick.start, prevBrick.end)) {
			mapSet(point, brick)
		}

		for (const point of intersectedPoints) {
			const pBrick = mapGet(point)
			brickSuppportMap.get(pBrick).supports.add(brick)
			brickSuppportMap.get(brick).supportedBy.add(pBrick)
		}
	}

	return brickSuppportMap
}
