// @ts-check

import { it, range } from "../modules/itertools.js"
import { t } from "../modules/parser.js"

export const useExample = false

export const exampleInput = `\
`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = t.arr(t.str()).parse

/**
 * @param {InputType} input
 */
export function part1(input) {
  return it(input)
    .map((s) => s.replace(/\D/g, ""))
    .map((x) => x.at(0) + x.at(-1))
    .map(Number)
    .sum()
}

/** @type {any} */
const trie = {
  ...[, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  o: { n: { e: 1 } },
  t: { w: { o: 2 }, h: { r: { e: { e: 3 } } } },
  f: { o: { u: { r: 4 } }, i: { v: { e: 5 } } },
  s: { i: { x: 6 }, e: { v: { e: { n: 7 } } } },
  e: { i: { g: { h: { t: 8 } } } },
  n: { i: { n: { e: 9 } } },
}

/**
 * @param {string} line
 */
function* findNumbersInString(line) {
  for (let left = 0, node = trie; left < line.length; left++, node = trie) {
    for (let right = left; right < line.length; right++) {
      node = node[line[right]]
      if (node === undefined) break
      if (typeof node === "number") yield node
    }
  }
}

/**
 * @param {InputType} input
 */
export function part2(input) {
  return it(input)
    .map(findNumbersInString)
    .map((x) => [...x])
    .map((x) => x.at(0) * 10 + x.at(-1))
    .sum()
}
