// @ts-check

import { t } from "../modules/parser.js"

export const useExample = false

export const exampleInput = `\
Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = t.arr(
  t.tuple(
    [
      t.tuple([t.str(), t.int()]),
      t.arr(t.arr(t.tuple([t.int(), t.str()], " "), ", "), "; "),
    ],
    ": ",
  ),
).parse

/**
 * @param {InputType} input
 */
export function part1(input) {
  /** @type {Record<string, number>} */
  const limits = { red: 12, green: 13, blue: 14 }

  let sum = 0
  for (const line of input) {
    const [[, id], sets] = line
    let lineValid = true
    outer: for (const set of sets) {
      for (const [count, color] of set) {
        if (count > limits[color]) {
          lineValid = false
          break outer
        }
      }
    }
    if (lineValid) sum += id
  }

  return sum
}

/**
 * @param {InputType} input
 */
export function part2(input) {
  let sum = 0
  for (const line of input) {
    const [, sets] = line
    /** @type {Record<string, number>} */
    const limits = { red: 0, green: 0, blue: 0 }
    for (const set of sets) {
      for (const [count, color] of set) {
        limits[color] = Math.max(limits[color], count)
      }
    }
    sum += limits.red * limits.green * limits.blue
  }
  return sum
}
