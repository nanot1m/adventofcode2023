// @ts-check

import { it, iterate } from "../modules/itertools.js"
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
	t.arr(t.tpl`${"from|str"} = (${"L|str"}, ${"R|str"})`).map((lines) =>
		it(lines).toMap(
			(line) => line.from,
			(line) => line,
		),
	),
]).parse

/**
 * @param {InputType} input
 */
export function part1([moves, map]) {
	return it(iterate("AAA", (cur, i) => map.get(cur)[moves[i % moves.length]]))
		.takeWhile((cur) => cur !== "ZZZ")
		.count()
}

/**
 * @param {InputType} input
 */
export function part2([moves, map]) {
	return map
		.keys()
		.filter((line) => line.endsWith("A"))
		.map((line) =>
			it(iterate(line, (cur, i) => map.get(cur)[moves[i % moves.length]]))
				.takeWhile((cur) => cur[2] !== "Z")
				.count(),
		)
		.lcm()
}
