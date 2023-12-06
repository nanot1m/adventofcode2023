// @ts-check

import { it } from "../modules/itertools.js"
import { t } from "../modules/parser.js"

export const useExample = false

export const exampleInput = `\
Time:      7  15   30
Distance:  9  40  200`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = t.str().parse

/**
 * @param {InputType} input
 */
export function part1(input) {
	const template = t.tpl`Time: ${"times|int[]"}\nDistance: ${"distances|int[]"}`
	const { times, distances } = template.parse(input)

	const results = []
	for (let i = 0; i < times.length; i++) {
		let count = 0
		for (let speed = 0; speed < times[i]; speed++) {
			const distance = speed * (times[i] - speed)
			if (distance > distances[i]) {
				count++
			}
		}
		results.push(count)
	}

	return it(results).multiply()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	const template = t.tpl`Time:${"time|int"}\nDistance:${"distance|int"}`
	const { time, distance } = template.parse(input.replaceAll(" ", ""))

	let minSpeed = 0
	let maxSpeed = time

	// find min speed
	for (let speed = 0; speed < time; speed++) {
		const d = speed * (time - speed)
		if (d > distance) {
			minSpeed = speed
			break
		}
	}

	// find max speed
	for (let speed = time; speed >= 0; speed--) {
		const d = speed * (time - speed)
		if (d > distance) {
			maxSpeed = speed
			break
		}
	}

	return maxSpeed - minSpeed + 1
}
