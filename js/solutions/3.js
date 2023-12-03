// @ts-check

import { V } from "../modules/index.js"
import { it, multiply } from "../modules/itertools.js"
import { Map2d, parseMap2d } from "../modules/map2d.js"

export const useExample = false

export const exampleInput = `\
467..114..
...*......
..35..633.
......#...
617*......
.....+.58.
..592.....
......755.
...$.*....
.664.598..`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = parseMap2d

/**
 * @param {InputType} map2d
 */
function createNumsMap(map2d) {
  /** @type {Map2d<{val: number}>}  */
  const numsMap = new Map2d()

  let curNum = { val: 0 }

  for (let y = 0; y < map2d.height; y++)
    for (let x = 0; x < map2d.width; x++) {
      const pos = V.vec(x, y)
      const char = map2d.get(pos)
      if (/\d/.test(char)) {
        curNum.val = curNum.val * 10 + parseInt(char, 10)
        numsMap.set(pos, curNum)
      } else {
        curNum = { val: 0 }
      }
    }

  return numsMap
}

/**
 * @param {InputType} input
 */
export function part1(input) {
  const numsMap = createNumsMap(input)
  return it(input)
    .filter((p) => /\D/.test(p.value) && p.value !== ".")
    .flatMap((p) => numsMap.around8(p.pos))
    .distinct((p) => p.value)
    .map((p) => p.value.val)
    .sum()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
  const numsMap = createNumsMap(input)

  return it(input)
    .filter((p) => p.value === "*")
    .map((p) =>
      it(numsMap.around8(p.pos))
        .distinct((p) => p.value)
        .map((x) => x.value.val)
        .toArray(),
    )
    .filter((p) => p.length === 2)
    .map((p) => multiply(p))
    .sum()
}
