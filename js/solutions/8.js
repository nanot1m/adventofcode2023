// @ts-check

import { it, iterate } from "../modules/itertools.js"
import { tuple } from "../modules/lib.js"
import { t } from "../modules/parser.js"

export const useExample = false

export const exampleInput = `\
RL

AAA = (BBB, CCC)
BBB = (DDD, EEE)
CCC = (ZZZ, GGG)
DDD = (DDD, DDD)
EEE = (EEE, EEE)
GGG = (GGG, GGG)
ZZZ = (ZZZ, ZZZ)`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = t.tuple([
	t.arr(t.enum("L", "R"), ""),
	t.arr(t.tpl`${"from|str"} = (${"L|str"}, ${"R|str"})`),
]).parse

/**
 * @param {InputType} input
 */
export function part1(input) {
	const [moves, lines] = input

	const lineMap = it(lines).toMap(
		(line) => line.from,
		(line) => line,
	)

	return it(iterate("AAA", (cur, i) => lineMap.get(cur)[moves[i % moves.length]]))
		.takeWhile((cur) => cur !== "ZZZ")
		.count()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	const [moves, lines] = input

	const lineMap = it(lines).toMap(
		(line) => line.from,
		(line) => line,
	)

	return it(lines)
		.filter((line) => line.from.endsWith("A"))
		.map((line) =>
			it(iterate(line.from, (cur, i) => lineMap.get(cur)[moves[i % moves.length]]))
				.takeWhile((cur) => cur[2] !== "Z")
				.count(),
		)
		.lcm()
}
