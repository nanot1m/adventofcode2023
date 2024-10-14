// @ts-check
import "../modules/iterator-extensions.js"
import { access, readdir } from "node:fs/promises"
import { join } from "node:path"
import { config } from "../infra/config.js"
import { solution } from "../infra/solution.js"
import { cachedFetchFromAoC } from "../infra/input.js"

const day = parseInt(process.argv[2], 10)

/**
 * @param {unknown} err
 */
function handleError(err) {
	if (err instanceof Error) {
		if (err.stack) {
			console.error(err.stack)
		} else {
			console.error(err.message)
		}
		return
	}
	console.error(err)
}

if (day) {
	execDay(day).then(() => {
		process.exit(0)
	}, handleError)
} else {
	readdir(config.solutionsDir)
		.then((dir) => dir.filter((x) => /^\d+\.js$/.test(x)))
		.then((xs) => xs.map((x) => x.split(".")[0]))
		.then((xs) => xs.sort((a, b) => Number(a) - Number(b)))
		.then((files) =>
			files.reduce(
				(acc, file) => acc.then(() => execDay(file).catch(handleError)),
				Promise.resolve(),
			),
		)
}

/**
 * @param {string | number} day
 */
async function execDay(day) {
	const name = join(config.solutionsDir, `${day}.js`)

	try {
		await access(name)
	} catch (err) {
		const messages = [`Day ${day} is not implemented`, `Can not read ${name}`]

		throw new Error(messages.join("\n"), { cause: err })
	}

	const module = await import(name)
	if (!module.solve && !(module.part1 || module.part2)) {
		const messages = [
			`Day ${day} is not implemented`,
			`Expected a ${name} to export a function named "solve"`,
			`or a function named "part1" or/and a function named "part2"`,
		]

		throw new Error(messages.join("\n"))
	}

	if (module.useExample) {
		if (module.exampleInput === undefined) {
			const messages = [
				`Example input for day ${day} is not provided`,
				`Expected a ${name} to export a string named "exampleInput"`,
			]

			throw new Error(messages.join("\n"))
		}
	}

	/**
	 * @param {string} input
	 */
	const solver = (input) => {
		if (!module.disableInputTrim) {
			input = input.trimEnd()
		}
		const parse = () => (module.parseInput ? module.parseInput(input) : input)
		return module.solve
			? module.solve(parse())
			: // We don't want to share parsed input between parts
			  // because solution can possibly mutate it
			  [() => module.part1?.(parse()), () => module.part2?.(parse())]
	}

	await solution({
		solve: solver,
		day,
		input: module.useExample ? () => module.exampleInput : cachedFetchFromAoC,
	})
}
