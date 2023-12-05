// @ts-check

import { it } from "../modules/itertools.js"
import { t } from "../modules/parser.js"
import { Range } from "../modules/range.js"

export const useExample = false

export const exampleInput = `\
seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4`

/** @typedef {ReturnType<typeof parseInput>} InputType */

const seedsParser = t.tpl`seeds: ${"seeds|int[]"}`
const lineParser = t.tpl`${"dRangeStart|int"} ${"sRangeStart|int"} ${"rangeLength|int"}`
const blocksParser = t.arr(t.str())

export const parseInput = (/** @type {string} */ input) => {
  const [seedsBlock, ...blocks] = blocksParser.parse(input)
  const seeds = seedsParser.parse(seedsBlock).seeds
  const maps = blocks.map(blocksParser.parse).map(([, ...lines]) =>
    lines
      .map((line) => lineParser.parse(line))
      .map((r) => ({
        source: new Range(r.sRangeStart, r.sRangeStart + r.rangeLength - 1),
        dest: new Range(r.dRangeStart, r.dRangeStart + r.rangeLength - 1),
      })),
  )

  return { seeds, maps }
}

/**
 * @param {number} value
 * @param {InputType['maps'][number]} ranges
 */
function lookupValueInRanges(value, ranges) {
  for (const { dest, source } of ranges) {
    if (source.includes(value)) return dest.start + (value - source.start)
  }
  return value
}

/**
 * @param {InputType} input
 */
export function part1(input) {
  return it(input.seeds)
    .map((seed) => input.maps.reduce(lookupValueInRanges, seed))
    .min()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
  const seedRanges = it(input.seeds)
    .groupsOf(2)
    .map(([start, length]) => new Range(start, start + length - 1))

  return it(input.maps)
    .reduce(
      (cur, map) =>
        cur.flatMap((seedRange) =>
          map
            .map((line) =>
              seedRange
                .intersection(line.source)
                ?.shiftBy(line.dest.start - line.source.start),
            )
            .filter(Boolean)
            .concat(seedRange.excludeAll(map.map(({ source }) => source))),
        ),
      seedRanges,
    )
    .map((r) => r.start)
    .min()
}
