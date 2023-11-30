// @ts-check

import { it, sum } from "../modules/itertools.js"
import { t } from "../modules/parser.js"

export const useExample = true

export const exampleInput = `\
`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = t.arr(t.int()).parse

/**
 * @param {InputType} input
 */
export function part1(input) {
  return it(input).groupsOf(3).map(sum).max()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
  return it(input).groupsOf(3).map(sum).max()
}
