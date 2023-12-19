// @ts-check

import { it } from "../modules/itertools.js"
import { t } from "../modules/parser.js"
import { Range } from "../modules/range.js"

export const useExample = false

export const exampleInput = `\
px{a<2006:qkq,m>2090:A,rfg}
pv{a>1716:R,A}
lnx{m>1548:A,A}
rfg{s<537:gd,x>2440:R,A}
qs{s>3448:A,lnx}
qkq{x<1416:A,crn}
crn{x>2662:A,R}
in{s<1351:px,qqz}
qqz{s>2770:qs,m<1801:hdj,R}
gd{a>3333:R,R}
hdj{m>838:A,pv}

{x=787,m=2655,a=1222,s=2876}
{x=1679,m=44,a=2067,s=496}
{x=2036,m=264,a=79,s=2244}
{x=2461,m=1339,a=466,s=291}
{x=2127,m=1623,a=2188,s=1013}`

/** @typedef {ReturnType<typeof parseInput>} InputType */

/**
 * @template {string} T
 * @param {T} name
 */
const int = (name) => t.named(name, t.int())

export const parseInput = t.tuple([
	t.arr(t.tpl2`${t.named("id", t.str())}{${t.named("rules", t.arr(t.str(), ","))}}`),
	t.arr(t.tpl2`{x=${int("x")},m=${int("m")},a=${int("a")},s=${int("s")}}`),
]).parse

/**
 *
 * @param {InputType[0][number]['rules']} rules
 */
function getRuleChecker(rules) {
	/** @type {Array<(val: InputType[1][number]) => {done: boolean, result: string}>} */
	const checkers = []

	for (const rule of rules) {
		const [cond, target] = rule.split(":")
		if (!target) {
			checkers.push(() => ({ done: true, result: rule }))
			continue
		}
		const [field, op, ...valueStr] = cond

		if (field !== "x" && field !== "m" && field !== "a" && field !== "s")
			throw new Error(`Unknown field ${field}`)

		const value = Number(valueStr.join(""))
		if (op === "<") {
			checkers.push((val) => ({ done: val[field] < value, result: target }))
		} else {
			checkers.push((val) => ({ done: val[field] > value, result: target }))
		}
	}

	return (/** @type {InputType[1][number]} */ val) => {
		for (const checker of checkers) {
			const { done, result } = checker(val)
			if (done) return result
		}
		throw new Error("No rule matched")
	}
}

/**
 * @param {InputType} input
 */
export function part1([rules, parts]) {
	const rulesMap = it(rules).toMap(
		(r) => r.id,
		(r) => getRuleChecker(r.rules),
	)

	/**
	 * @param {InputType[1][number]} part
	 */
	function checkPart(part) {
		let cur = "in"
		while (cur !== "A" && cur !== "R") {
			cur = rulesMap.get(cur)(part)
		}
		return cur
	}

	return it(parts)
		.filter((part) => checkPart(part) === "A")
		.map((part) => part.x + part.m + part.a + part.s)
		.sum()
}

/**
 * @param {InputType} input
 */
export function part2([rules]) {
	const rulesMap = it(rules).toMap(
		(r) => r.id,
		(r) => r.rules,
	)

	/**
	 * @param {string} ruleId
	 * @param {Readonly<Record<string, Range>>} ranges
	 * @returns {Readonly<Record<string, Range>>[]}
	 */
	function recur(ruleId, ranges) {
		if (ruleId === "A") return [ranges]
		if (ruleId === "R") return []

		const rules = rulesMap.get(ruleId)
		const result = []

		for (const rule of rules) {
			if (!rule.includes(":")) {
				for (const r of recur(rule, ranges)) result.push(r)
				continue
			}

			const [[key, op, ...numberParts], target] = rule.split(":")
			const val = Number(numberParts.join(""))

			const allowRange = op === "<" ? ranges[key].slice(0, val - 1) : ranges[key].slice(val + 1)

			for (const r of recur(target, { ...ranges, [key]: allowRange })) {
				result.push(r)
			}

			ranges = { ...ranges, [key]: op === "<" ? ranges[key].slice(val) : ranges[key].slice(0, val) }
		}

		return result
	}

	const resultRanges = recur("in", {
		x: new Range(1, 4000),
		m: new Range(1, 4000),
		a: new Range(1, 4000),
		s: new Range(1, 4000),
	})

	return it(resultRanges)
		.map((r) => r.x.size() * r.m.size() * r.a.size() * r.s.size())
		.sum()
}
