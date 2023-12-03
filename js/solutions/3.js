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
function createAdjacentsMap(map2d) {
  /** @type {Map2d<{char: string, values: number[]}>}  */
  const adjacents = new Map2d()

  let curNum = ""
  let adjacentSymbol = ""
  let symbolPos = V.vec(0, 0)

  for (let y = 0; y < map2d.height; y++) {
    for (let x = 0; x < map2d.width; x++) {
      const char = map2d.get([x, y])

      if (/\d/.test(char)) {
        curNum += char
        if (adjacentSymbol === "") {
          for (const dir of V.DIRS_8) {
            const pos = V.add([x, y], dir)
            const value = map2d.get(pos)
            if (value && /\D/.test(value) && value !== ".") {
              symbolPos = pos
              adjacentSymbol = value
            }
          }
        }
        continue
      }

      if (adjacentSymbol) {
        const ap = adjacents.get(symbolPos)
        if (ap) {
          ap.values.push(Number(curNum))
        } else {
          adjacents.set(symbolPos, {
            char: adjacentSymbol,
            values: [Number(curNum)],
          })
        }
      }
      curNum = ""
      adjacentSymbol = ""
    }
  }

  return adjacents
}

/**
 * @param {InputType} input
 */
export function part1(input) {
  return it(createAdjacentsMap(input))
    .flatMap((p) => p.value.values)
    .sum()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
  return it(createAdjacentsMap(input))
    .filter((p) => p.value.char === "*" && p.value.values.length === 2)
    .map((p) => multiply(p.value.values))
    .sum()
}
