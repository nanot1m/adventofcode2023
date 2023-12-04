// @ts-check

import { it } from "../modules/itertools.js"
import { t } from "../modules/parser.js"

export const useExample = false

export const exampleInput = `\
Card 1: 41 48 83 86 17 | 83 86  6 31 17  9 48 53
Card 2: 13 32 20 16 61 | 61 30 68 82 17 32 24 19
Card 3:  1 21 53 59 44 | 69 82 63 72 16 21 14  1
Card 4: 41 92 73 84 69 | 59 84 76 51 58  5 54 83
Card 5: 87 83 26 28 32 | 88 30 70 12 93 22 82 36
Card 6: 31 18 13 56 72 | 74 77 10 23 35 67 36 11`

/** @typedef {ReturnType<typeof parseInput>} InputType */

const cardParser = t.tpl`Card ${"id|int"}:${"wins|str"} |${"hand|str"}`.map(
  (card) => ({
    ...card,
    hand: it(card.hand)
      .groupsOf(3)
      .map((x) => x.join("")),
  }),
)

export const parseInput = t.arr(cardParser).parse

/**
 * @param {InputType} input
 */
export function part1(input) {
  return it(input)
    .map(({ wins, hand }) => hand.filter((c) => wins.includes(c)).count())
    .map((count) => (count === 0 ? 0 : Math.pow(2, count - 1)))
    .sum()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
  /** @type {number[]} */
  const metCounts = Array(input.length).fill(1)

  for (const { id, hand, wins } of input) {
    const count = hand.filter((c) => wins.includes(c)).count()
    for (let i = id; i < id + count; i++) metCounts[i] += metCounts[id - 1]
  }

  return it(metCounts).sum()
}
