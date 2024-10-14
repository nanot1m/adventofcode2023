// @ts-check

import { mincut } from "@graph-algorithm/minimum-cut"

import { tuple } from "../modules/lib.js"
import { t } from "../modules/parser.js"
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
		Graph.bfs((p) => connections.get(p).values(), [start], (p) => p).count()

	const vertices = connections.keys()

	// const stats = new Map()

	// for (let i = 0; i < 10_000; i++) {
	// 	const v1 = vertices[Math.floor(Math.random() * vertices.length)]
	// 	const v2 = vertices[Math.floor(Math.random() * vertices.length)]
	// 	const v1_to_v2 = it(
	// 		Graph.bfs(
	// 			(p) => connections.get(p),
	// 			[v1],
	// 			(p) => p,
	// 		),
	// 	)
	// 		.filter((v) => v.value === v2)
	// 		.first()

	// 	// edges between v1 and v2
	// 	const path = it(iterate(v1_to_v2, (v) => v.parent))
	// 		.takeWhile((v) => v != null)
	// 		.map((v) => v.value)
	// 		.windowed(2)

	// 	for (const [v11, v22] of path) {
	// 		const key = [v11, v22].sort().join(" <-> ")
	// 		if (!stats.has(key)) stats.set(key, 0)
	// 		stats.set(key, stats.get(key) + 1)
	// 	}
	// }

	// const cut = [...stats.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k.split(" <-> "))
	// console.log(cut.slice(0, 3))

	const edges = connections
		.entries()
		.flatMap(([key, value]) => value.values().map((v) => tuple(key, v)))
		.distinct((v) => v.sort().join())

	const origSize = graphLen(vertices.first())

	for (const [a, b] of mincut(edges)) {
		connections.get(a).delete(b)
		connections.get(b).delete(a)
	}

	const curSize = graphLen(vertices.first())
	return curSize * (origSize - curSize)
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	return 0
}
