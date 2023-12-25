// @ts-check

import { mincut } from "@graph-algorithm/minimum-cut"

import { tuple } from "../modules/lib.js"
import { t } from "../modules/parser.js"
import { count, it } from "../modules/itertools.js"
import { Graph } from "../modules/index.js"

export const useExample = false

export const exampleInput = `\
jqt: rhn xhk nvd
rsh: frs pzl lsr
xhk: hfx
cmg: qnr nvd lhk bvb
rhn: xhk bvb hfx
bvb: xhk hfx
pzl: lsr hfx nvd
qnr: nvd
ntq: jqt hfx bvb xhk
nvd: lhk
lsr: lhk
rzs: qnr cmg lsr rsh
frs: qnr lhk lsr`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = t.arr(t.tpl`${"source|str"}: ${"targets|str[]"}`).parse

/**
 * @param {InputType} input
 */
export function part1(input) {
	/** @type {Map<string, Set<string>>} */
	const connections = new Map()

	for (const { source, targets } of input) {
		for (const target of targets) {
			if (!connections.has(source)) connections.set(source, new Set())
			if (!connections.has(target)) connections.set(target, new Set())
			connections.get(source).add(target)
			connections.get(target).add(source)
		}
	}

	// prettier-ignore
	const graphLen = (/** @type {string} */ start) =>
		count(Graph.bfs((p) => connections.get(p), [start], (p) => p))

	const vertices = [...connections.keys()]

	const edges = it(connections)
		.flatMap(([key, value]) => [...value].map((v) => tuple(key, v).sort()))
		.toMap(
			(v) => v.join(),
			(v) => v,
		)
		.values()

	const origSize = graphLen(vertices[0])

	for (const [a, b] of mincut(edges)) {
		connections.get(a).delete(b)
		connections.get(b).delete(a)
	}

	const curSize = graphLen(vertices[0])
	return curSize * (origSize - curSize)
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	return 0
}
