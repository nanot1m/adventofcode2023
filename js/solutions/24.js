// @ts-check

import { V, V3 } from "../modules/index.js"
import { combinations } from "../modules/lib.js"
import { t } from "../modules/parser.js"
import { init } from "z3-solver"

export const useExample = false

export const exampleInput = `\
19, 13, 30 @ -2,  1, -2
18, 19, 22 @ -1, -1, -2
20, 25, 34 @ -2, -2, -4
12, 31, 28 @ -1, -2, -1
20, 19, 15 @  1, -5, -3`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = t.arr(t.tpl`${"pos|vec3"} @ ${"dir|vec3"}`).parse

/**
 * @param {InputType} input
 */
export function part1(input) {
	/**
	 * @typedef {object} Ray2d
	 * @property {number} a - slope
	 * @property {number} b - y-intercept
	 * @property {V.Vec2} pos - position
	 * @property {V.Vec2} dir - direction
	 */

	/**
	 * @param {InputType[number]} param0
	 * @returns {Ray2d}
	 */
	const toRay2d = ({ pos, dir }) => {
		const a = dir[1] / dir[0]
		const b = pos[1] - a * pos[0]
		return { a, b, pos: V.vec(pos[0], pos[1]), dir: V.vec(dir[0], dir[1]) }
	}

	/**
	 * @param {Ray2d} r1
	 * @param {Ray2d} r2
	 * @returns {V.Vec2}
	 */
	const rayRayIntersection = (r1, r2) => {
		if (r1.a === r2.a) return V.vec(Infinity, Infinity)
		const x = (r2.b - r1.b) / (r1.a - r2.a)
		const y = r1.a * x + r1.b

		// Check if intersected point is on both rays:
		// 	Ray.pos + Ray.dir * t = intersected point;
		// 		If t < 0, then the point is behind the ray;
		// 		If t > 1, then the point is in front of the ray
		if (V.dot(V.sub(V.vec(x, y), r1.pos), r1.dir) < 0) return V.vec(Infinity, Infinity)
		if (V.dot(V.sub(V.vec(x, y), r2.pos), r2.dir) < 0) return V.vec(Infinity, Infinity)

		return V.vec(x, y)
	}

	const lines2d = input.map(toRay2d)

	const minPos = 200000000000000 // 7
	const maxPos = 400000000000000 // 27

	return combinations(lines2d, 2)
		.values()
		.map(([l1, l2]) => rayRayIntersection(l1, l2))
		.count(([x, y]) => x >= minPos && x <= maxPos && y >= minPos && y <= maxPos)
}

/**
 * @param {InputType} input
 */
export async function part2(input) {
	const { Context } = await init()

	const Z3 = Context("aoc24")

	const x = Z3.Real.const("x")
	const y = Z3.Real.const("y")
	const z = Z3.Real.const("z")

	const vx = Z3.Real.const("vx")
	const vy = Z3.Real.const("vy")
	const vz = Z3.Real.const("vz")

	const solver = new Z3.Solver()

	input.forEach(({ pos, dir }, idx) => {
		const [px, py, pz] = pos
		const [dx, dy, dz] = dir

		const t = Z3.Real.const(`t${idx}`)

		solver.add(t.ge(0))
		solver.add(x.add(vx.mul(t)).eq(t.mul(dx).add(px)))
		solver.add(y.add(vy.mul(t)).eq(t.mul(dy).add(py)))
		solver.add(z.add(vz.mul(t)).eq(t.mul(dz).add(pz)))
	})

	await solver.check()
	const model = solver.model()
	const result = V3.vec3(+model.eval(x), +model.eval(y), +model.eval(z))

	return result.values().sum()
}
