// @ts-check

import { it } from "../modules/itertools.js"
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

const nums = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
]

/**
 *
 * @param {string} s
 * @returns
 */
function findNumbersInString(s) {
  let left = 0

  const result = []

  while (left < s.length) {
    if (/\d/.test(s[left])) {
      result.push(Number(s[left]))
      left++
      continue
    }

    let cur = s[left]
    let right = left + 1
    while (right < s.length && right - left < 6) {
      cur += s[right]
      const idx = nums.indexOf(cur)
      if (idx >= 0) {
        result.push(idx + 1)
        left = right - 1
        break
      }
      right++
    }
    left++
  }

  return result
}

/**
 * @param {InputType} input
 */
export function part2(input) {
  return it(input)
    .map(findNumbersInString)
    .map((x) => Number(`${x.at(0)}${x.at(-1)}`))
    .sum()
}
