// @ts-check

import { it } from "../modules/itertools.js"
import { t } from "../modules/parser.js"

export const useExample = false

export const exampleInput = `\
Game 1: 3 blue, 4 red; 1 red, 2 green, 6 blue; 2 green
Game 2: 1 blue, 2 green; 3 green, 4 blue, 1 red; 1 green, 1 blue
Game 3: 8 green, 6 blue, 20 red; 5 blue, 4 red, 13 green; 5 green, 1 red
Game 4: 1 green, 3 red, 6 blue; 3 green, 6 red; 3 green, 15 blue, 14 red
Game 5: 6 red, 1 blue, 3 green; 2 blue, 1 red, 2 green`

/** @typedef {ReturnType<typeof parseInput>} InputType */

const colorParser = t.named("color", t.enum("red", "green", "blue"))
const countParser = t.named("count", t.int())
const pairParser = t.tpl2`${countParser} ${colorParser}`
const setsParser = t.named("sets", t.arr(pairParser, /[,;]\s/g))
const idParser = t.named("id", t.int())
export const parseInput = t.arr(t.tpl2`Game ${idParser}: ${setsParser}`).parse

/**
 * @param {InputType} input
 */
export function part1(input) {
  const limits = { red: 12, green: 13, blue: 14 }

  return it(input)
    .filter((game) => game.sets.every((p) => p.count <= limits[p.color]))
    .map((game) => game.id)
    .sum()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
  return it(input)
    .map(({ sets }) =>
      sets.reduce(
        (acc, p) => ({ ...acc, [p.color]: Math.max(acc[p.color], p.count) }),
        { red: 0, green: 0, blue: 0 },
      ),
    )
    .map((p) => p.red * p.green * p.blue)
    .sum()
}
