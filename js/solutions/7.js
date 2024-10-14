// @ts-check

import { t } from "../modules/parser.js"

export const useExample = false

export const exampleInput = `\
32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483`

/** @typedef {ReturnType<typeof parseInput>} InputType */

export const parseInput = t.arr(t.tpl`${"hand|str"} ${"bid|int"}`).parse

/**
 * @param {Map<string, number>} scoreByHand
 * @param {string} cardsOrder
 * @returns
 */
function sortByScoreAndCardsOrder(scoreByHand, cardsOrder) {
	/**
	 * @param {InputType[number]} a
	 * @param {InputType[number]} b
	 */
	return (a, b) => {
		const typeDiff = scoreByHand.get(a.hand) - scoreByHand.get(b.hand)
		if (typeDiff !== 0) return typeDiff
		for (let i = 0; i < a.hand.length; i++) {
			const ai = cardsOrder.indexOf(a.hand[i])
			const bi = cardsOrder.indexOf(b.hand[i])
			if (ai !== bi) return bi - ai
		}
		return 0
	}
}

/**
 * @param {Iterable<number>} values
 */
function getCardType([fst, snd]) {
	switch (fst) {
		case 5:
			return 6
		case 4:
			return 5
		case 3:
			return snd === 2 ? 4 : 3
		case 2:
			return snd === 2 ? 2 : 1
		case 1:
			return 0
		default:
			throw new Error("Invalid cards count: " + fst)
	}
}

/**
 * @param {InputType} input
 */
export function part1(input) {
	const scoreByHand = input
		.values()
		.map(({ hand }) => ({
			hand,
			values: Iterator.from(hand)
				.countFrequencies()
				.values()
				.toArray()
				.sort((a, b) => b - a),
		}))
		.toMap(
			({ hand }) => hand,
			({ values }) => getCardType(values),
		)

	return input
		.sort(sortByScoreAndCardsOrder(scoreByHand, "AKQJT98765432"))
		.values()
		.map(({ bid }, i) => bid * (i + 1))
		.sum()
}

/**
 * @param {InputType} input
 */
export function part2(input) {
	const scoreByHand = input
		.values()
		.map(({ hand }) => ({
			hand,
			values: Iterator.from(hand)
				.filter((card) => card !== "J")
				.countFrequencies()
				.values()
				.toArray()
				.sort((a, b) => b - a),
			jokers: Iterator.from(hand)
				.filter((card) => card === "J")
				.count(),
		}))
		.map(({ hand, values: [fst = 0, ...rest], jokers }) => ({
			hand,
			values: [fst + jokers, ...rest],
		}))
		.toMap(
			({ hand }) => hand,
			({ values }) => getCardType(values),
		)

	return input
		.sort(sortByScoreAndCardsOrder(scoreByHand, "AKQT98765432J"))
		.values()
		.map(({ bid }, i) => bid * (i + 1))
		.sum()
}
