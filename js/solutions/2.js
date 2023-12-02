// @ts-check

import { it, multiply } from "../modules/itertools.js"
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
      t.arr(
        t.arr(t.tuple([t.int(), t.enum("red", "green", "blue")]), ", "),
        "; ",
      ),
    ],
    ": ",
  ),
).parse

/**
 * @param {InputType} input
 */
export function part1(input) {
  const limits = { red: 12, green: 13, blue: 14 }

  return it(input)
    .filter(([, ss]) => ss.flat().every(([c, col]) => c <= limits[col]))
    .map(([[, id]]) => id)
    .sum()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
  return it(input)
    .map(([, sets]) => sets.flat())
    .map((pairs) =>
      pairs.reduce(
        (acc, [c, col]) => ({ ...acc, [col]: Math.max(acc[col], c) }),
        { red: 0, green: 0, blue: 0 },
      ),
    )
    .map((p) => p.red * p.green * p.blue)
    .sum()
}
