// @ts-check

/**
 * @typedef {[x: number, y: number, z: number]} Vec3
 */

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {Vec3}
 */
export const vec3 = (x, y, z) => [x, y, z]

/** @param {Vec3} vec */
export const x = (vec) => vec[0]
/** @param {Vec3} vec */
export const y = (vec) => vec[1]
/** @param {Vec3} vec */
export const z = (vec) => vec[2]

/**
 *
 * @returns {Vec3}
 */
export const zero3 = () => [0, 0, 0]

/**
 * @param {Vec3} vecA
 * @param {Vec3} vecB
 * @returns {Vec3}
 */
export const add = (vecA, vecB) => [vecA[0] + vecB[0], vecA[1] + vecB[1], vecA[2] + vecB[2]]

/**
 * @param {Vec3} vecA
 * @param {Vec3} vecB
 * @returns {Vec3}
 */
export const sub = (vecA, vecB) => [vecA[0] - vecB[0], vecA[1] - vecB[1], vecA[2] - vecB[2]]

/**
 *
 * @param {Vec3} vec
 * @param {number[][]} rot
 * @returns {Vec3}
 */
export const rot = (vec, rot) => {
	const [x, y, z] = vec
	const [xRot, yRot, zRot] = rot
	return [
		x * xRot[0] + y * xRot[1] + z * xRot[2],
		x * yRot[0] + y * yRot[1] + z * yRot[2],
		x * zRot[0] + y * zRot[1] + z * zRot[2],
	]
}

/**
 * @param {Vec3} vecA
 * @param {Vec3} vecB
 * @returns {Vec3}
 */
export const min = (vecA, vecB) => [
	Math.min(vecA[0], vecB[0]),
	Math.min(vecA[1], vecB[1]),
	Math.min(vecA[2], vecB[2]),
]

/**
 * @param {Vec3} vecA
 * @param {Vec3} vecB
 * @returns {Vec3}
 */
export const max = (vecA, vecB) => [
	Math.max(vecA[0], vecB[0]),
	Math.max(vecA[1], vecB[1]),
	Math.max(vecA[2], vecB[2]),
]

/**
 *
 * @param {Vec3} vecA
 * @param {Vec3} vecB
 * @returns
 */
export const mLen = (vecA, vecB = zero3()) =>
	Math.abs(vecA[0] - vecB[0]) + Math.abs(vecA[1] - vecB[1]) + Math.abs(vecA[2] - vecB[2])

/**
 *
 * @param {Vec3} start
 * @param {Vec3} end
 */
export function* line(start, end) {
	const delta = vec3(
		Math.sign(end[0] - start[0]),
		Math.sign(end[1] - start[1]),
		Math.sign(end[2] - start[2]),
	)

	let current = start
	while (mLen(current, end) > 0) {
		yield current
		current = add(current, delta)
	}
	yield end
}

/**
 * @param {Vec3} vecA
 * @param {Vec3} vecB
 * @returns {number}
 */
export const dot = (vecA, vecB) => vecA[0] * vecB[0] + vecA[1] * vecB[1] + vecA[2] * vecB[2]

/**
 * @param {Vec3} vec
 * @returns {Vec3}
 */
export const normalized = (vec) => {
	const len = Math.sqrt(dot(vec, vec))
	return [vec[0] / len, vec[1] / len, vec[2] / len]
}

/**
 * @param {Vec3} vecA
 * @param {Vec3} vecB
 * @returns {Vec3}
 */
export const cross = (vecA, vecB) => [
	vecA[1] * vecB[2] - vecA[2] * vecB[1],
	vecA[2] * vecB[0] - vecA[0] * vecB[2],
	vecA[0] * vecB[1] - vecA[1] * vecB[0],
]

/**
 * @param {Vec3} vec
 * @returns {boolean}
 */
export const isZero = (vec) => vec[0] === 0 && vec[1] === 0 && vec[2] === 0

/**
 * @param {Vec3} vec
 * @param {number} factor
 * @returns {Vec3}
 */
export const scale = (vec, factor) => [vec[0] * factor, vec[1] * factor, vec[2] * factor]

/**
 * @param {Vec3} vec
 * @returns {number}
 */
export const magnitudeSquared = (vec) => dot(vec, vec)
