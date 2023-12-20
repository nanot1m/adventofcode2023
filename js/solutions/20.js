// @ts-check

import { t } from "../modules/parser.js"
import { Graph } from "../modules/index.js"
import { it } from "../modules/itertools.js"
import { CyclicSeq } from "../modules/cyclic-map.js"
import { tuple } from "../modules/lib.js"

export const useExample = false

export const exampleInput = `\
broadcaster -> a
%a -> inv, con
&inv -> b
%b -> con
&con -> output`

/**
 * @typedef {{type: 'conjuction', id: string, inputs: Record<string, boolean>, outputs: string[]}} Conjuction
 */

/**
 * @typedef {{type: 'flip-flop', id: string, inputs: Record<string, boolean>, outputs: string[], on: boolean}} FlipFlop
 */

/**
 * @typedef {{type: 'broadcast', id: string, inputs: Record<string, boolean>, outputs: string[]}} Broadcast
 */

/**
 * @typedef { Broadcast | FlipFlop | Conjuction} Module
 */

/** @typedef {ReturnType<typeof parseInput>} InputType */

const Signal = {
	Low: false,
	High: true,
}

const BROADCAST_ID = "broadcaster"

export const parseInput = t.arr(t.tuple([t.str(), t.str()])).map((lines) =>
	lines.map(
		/** @returns {Module} */
		([from, to]) => {
			if (from === BROADCAST_ID) {
				return { type: "broadcast", id: BROADCAST_ID, outputs: to.split(", "), inputs: {} }
			}
			if (from.startsWith("%")) {
				const id = from.slice(1)
				return { type: "flip-flop", id, outputs: to.split(", "), inputs: {}, on: false }
			}
			if (from.startsWith("&")) {
				const id = from.slice(1)
				return { type: "conjuction", id, outputs: to.split(", "), inputs: {} }
			}
			throw new Error("invalid input")
		},
	),
).parse

/**
 * @param {boolean} signal
 * @param {string} target
 * @param {string} from
 * @param {Map<string, Module>} moduleMap
 * @returns {{id: string, from: string, signal: boolean}[]}
 */
function broadcastSignal(signal, target, from, moduleMap) {
	const m = moduleMap.get(target)

	if (m === undefined) return []

	if (m.type === "broadcast") {
		return m.outputs.map((id) => ({ id, signal, from: target }))
	}

	if (m.type === "flip-flop") {
		if (signal === Signal.High) return []
		m.on = !m.on
		return m.outputs.map((id) => ({ id, signal: m.on ? Signal.High : Signal.Low, from: target }))
	}

	if (m.type === "conjuction") {
		m.inputs[from] = signal

		const keys = Object.keys(m.inputs)

		let total = 0
		for (const key of keys) {
			if (m.inputs[key]) total++
		}

		if (total === keys.length) {
			return m.outputs.map((id) => ({ id, signal: Signal.Low, from: target }))
		}

		return m.outputs.map((id) => ({ id, signal: Signal.High, from: target }))
	}
}

/**
 * @param {Module[]} input
 * @param {Map<string, Module>} moduleMap
 */
function attachInputsToModules(input, moduleMap) {
	for (const m of input) {
		for (const outputId of m.outputs) {
			const output = moduleMap.get(outputId)
			if (!output) continue
			output.inputs[m.id] = false
		}
	}
}

/**
 * @param {InputType} input
 */
export function part1(input) {
	const moduleMap = new Map(input.map((m) => [m.id, m]))
	attachInputsToModules(input, moduleMap)

	function* buttonPressGenerator() {
		while (true) {
			yield it(
				Graph.bfs(
					({ id, signal, from }) => broadcastSignal(signal, id, from, moduleMap),
					[{ id: BROADCAST_ID, signal: Signal.Low, from: "button" }],
				),
			).reduce(
				(acc, v) => {
					acc[v.value.signal ? "high" : "low"]++
					return acc
				},
				{ low: 0, high: 0 },
			)
		}
	}

	const total = it(buttonPressGenerator())
		.take(1_000)
		.reduce(
			(acc, v) => {
				acc.low += v.low
				acc.high += v.high
				return acc
			},
			{ low: 0, high: 0 },
		)

	return total.low * total.high
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	const moduleMap = new Map(input.map((m) => [m.id, m]))
	attachInputsToModules(input, moduleMap)

	// This nodes were found by visualizing and analyzing the graph
	const cyclicNodes = ["mf", "kb", "fd", "nh"]

	/**
	 * @param {string} node
	 */
	function findButtonPressPeriodForNode(node) {
		const moduleMapClone = structuredClone(moduleMap)

		const firstNLowSignals = it(buttonPressGenerator(moduleMapClone))
			.map((_, i) => tuple(Object.values(moduleMapClone.get(node).inputs), i))
			.filter(([inputs]) => inputs.every((v) => !v))
			.map(([, i]) => i)
			.take(100)
			.toArray()

		const diffs = firstNLowSignals.slice(1).map((v, i) => v - firstNLowSignals[i])

		return diffs
	}

	/**
	 * @param {Map<string, Module>} moduleMap
	 */
	function* buttonPressGenerator(moduleMap) {
		while (true) {
			yield it(
				Graph.bfs(
					({ id, signal, from }) => broadcastSignal(signal, id, from, moduleMap),
					[{ id: BROADCAST_ID, signal: Signal.Low, from: "button" }],
				),
			).last()
		}
	}

	// To get this numbers i've printed findButtonPressPeriodForNode to console
	// for every node from cyclicNodes and manually found the period for each node
	// [3797,4021,4093,3907]

	return it([3797, 4021, 4093, 3907]).lcm()
}
