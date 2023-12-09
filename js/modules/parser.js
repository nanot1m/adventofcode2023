// @ts-check

import { V, V3 } from "./index.js"

/**
 * @param {string} strVal
 */
function tryGetSeparator(strVal) {
	const separators = ["\n\n", "\n", " -> ", ", ", ",", " - ", " ", "-"]
	for (const separator of separators) {
		if (strVal.includes(separator)) {
			return separator
		}
	}
	return null
}

/**
 * @template T
 *
 * @typedef {Object} ParserRegistryItem
 * @property {(input: string) => boolean} check
 * @property {(input: string, key?: string) => T} parse
 *
 */

/**
 * @template {ParserRegistryItem<unknown>} T
 *
 * @typedef {T & {withSeparator: (separator: string) => T}} WithSeparator
 */

/**
 * @template {Record<string, ParserRegistryItem<unknown>>} T
 *
 * @param {T} parsers
 * @returns {T}
 */
function registerParsers(parsers) {
	return parsers
}

const PARSERS = registerParsers({
	int: /** @type {const} */ ({
		name: "int",
		check: (key) => key === "int",
		parse: (strVal) => parseInt(strVal, 10),
	}),
	str: /** @type {const} */ ({
		name: "str",
		check: (key) => key === "str",
		parse: (strVal) => strVal,
	}),
	vec: /** @type {const} */ ({
		name: "vec",
		check: (key) => key === "vec",
		parse: (strVal) => {
			const separator = tryGetSeparator(strVal)
			if (!separator) {
				throw new Error(`Invalid vec: ${strVal}`)
			}
			const [x, y] = strVal.split(separator).map(Number)
			return V.vec(x, y)
		},
	}),
	vec3: /** @type {const} */ ({
		name: "vec3",
		check: (key) => key === "vec3",
		parse: (strVal) => {
			const separator = tryGetSeparator(strVal)
			if (!separator) {
				throw new Error(`Invalid vec3: ${strVal}`)
			}
			const [x, y, z] = strVal.split(separator).map(Number)
			return V3.vec3(x, y, z)
		},
	}),
	arr: /** @type {const} */ ({
		name: "arr",
		check: (key) => key.endsWith("[]"),
		parse: (strVal, key = "") => {
			const type = key.slice(0, -2)
			const parser = getParserByType(type)
			if (!parser) {
				throw new Error(`Invalid array type "${type}" in "${key}"`)
			}
			const separator = tryGetSeparator(strVal) ?? ","
			return strVal
				.split(separator)
				.filter((x) => x !== "")
				.map((x) => parser.parse(x.trim(), type))
		},
	}),
	tuple: /** @type {const} */ ({
		name: "tuple",
		check: (key) => key.startsWith("(") && key.endsWith(")"),
		parse: (strVal, key = "") => {
			const types = key.slice(1, -1).split(",")
			const separator = tryGetSeparator(strVal) ?? ","
			return strVal.split(separator).map((x, i) => {
				const parser = getParserByType(types[i])
				if (!parser) {
					throw new Error(`Invalid tuple type "${types[i]}" in "${key}"`)
				}
				return parser.parse(x, types[i])
			})
		},
	}),
})

/**
 * @param {string} type
 * @returns {ParserRegistryItem<unknown> | null}
 */
function getParserByType(type) {
	for (const key in PARSERS) {
		if (PARSERS[/** @type {keyof typeof PARSERS} */ (key)].check(type)) {
			return PARSERS[/** @type {keyof typeof PARSERS} */ (key)]
		}
	}
	return null
}

/**
 * @template T
 *
 * @param {string} strVal
 * @param {string} type
 * @returns {T}
 */
function parse(strVal, type) {
	const parser = getParserByType(type)
	if (!parser) {
		throw new Error(`Invalid type "${type}"`)
	}
	return /** @type {T} */ (parser.parse(strVal, type))
}

/**
 * @template T
 *
 * @typedef {Object} Parser
 * @property {(strVal: string) => T} parse
 */

const commonTypes = {
	int: () => mappableParser(PARSERS.int),

	str: () => mappableParser(PARSERS.str),

	vec: () => mappableParser(PARSERS.vec),

	vec3: () => mappableParser(PARSERS.vec3),

	/**
	 * @template T
	 *
	 * @param {Parser<T>} type
	 * @param {string | RegExp} [separator]
	 */
	arr: (type, separator) =>
		mappableParser({
			parse: (strVal) => {
				return strVal
					.split(separator ?? tryGetSeparator(strVal) ?? ",")
					.map((x) => x.trim())
					.filter((x) => x !== "")
					.map((x) => type.parse(x))
			},
		}),

	/**
	 * @template {Parser<unknown>[]} T
	 *
	 * @param {import("ts-toolbelt").F.Narrow<T>} types
	 * @param {string} [separator]
	 */
	tuple: (types, separator) =>
		mappableParser({
			/**
			 * @param {string} strVal
			 * @returns {{[K in keyof T]: T[K] extends Parser<infer U> ? U : never}}
			 */
			parse: (strVal) => {
				// @ts-ignore
				return strVal
					.split(separator ?? tryGetSeparator(strVal) ?? ",")
					.map((x, i) => types[i].parse(x))
			},
		}),

	/**
	 * @template {readonly string[]} T
	 *
	 * @param {T} values
	 */
	enum: (...values) =>
		mappableParser({
			/**
			 * @param {string} strVal
			 * @returns {T[number]}
			 */
			parse: (strVal) => {
				// @ts-ignore
				if (!values.includes(strVal)) {
					throw new Error(`Invalid enum value "${strVal}"`)
				}
				return strVal
			},
		}),
}

/**
 * @template T
 * @param {Parser<T>} parser
 */
function mappableParser(parser) {
	return {
		...parser,
		/**
		 * @template U
		 * @param {(val: T) => U} fn
		 */
		map: (fn) => mappableParser({ ...parser, parse: (x) => fn(parser.parse(x)) }),
	}
}

/**
 * @template {(string)[]} T
 *
 * @param {TemplateStringsArray} strings
 * @param {T} keys
 */
function tpl(strings, ...keys) {
	/**
	 * @param {string} input
	 * @returns {{[P in T[number] as import("./types.js").TemplateKey<P>]: import("./types.js").TemplateValue<P> }}
	 */
	function parseInternal(input) {
		/** @type {Record<string, any>} */
		const model = {}
		let lastIndex = 0
		for (let i = 0; i < keys.length; i++) {
			const start = strings[i].length + lastIndex
			const end = strings[i + 1] ? input.indexOf(strings[i + 1], start) : input.length
			const strVal = input.slice(start, end)
			const [key, type] = keys[i].split("|")
			model[key] = parse(strVal, type)
			lastIndex = end
		}
		return /** @type {any} */ (model)
	}

	return mappableParser({ parse: parseInternal })
}

/**
 * @template {string} K
 * @template T
 *
 * @param {K} name
 * @param {Parser<T>} parser
 * @returns {NamedParser<K, T>}
 */
function named(name, parser) {
	return {
		...parser,
		name,
	}
}

/**
 * @template {string} K
 * @template T
 *
 * @typedef {object} NamedParser
 *
 * @property {(strVal: string) => T} parse
 * @property {K} name
 */

/**
 * @template {NamedParser<any, any>[]} T
 *
 * @param {TemplateStringsArray} strings
 * @param  {T} keys
 */
function tpl2(strings, ...keys) {
	/**
	 * @param {string} input
	 * @returns {{[P in T[number] as P['name']]: ReturnType<P['parse']> }}
	 */
	function parseInternal(input) {
		/** @type {Record<string, any>} */
		const model = {}
		let lastIndex = 0
		for (let i = 0; i < keys.length; i++) {
			const start = strings[i].length + lastIndex
			const end = strings[i + 1] ? input.indexOf(strings[i + 1], start) : input.length
			const strVal = input.slice(start, end)
			const namedParser = keys[i]
			model[namedParser.name] = namedParser.parse(strVal)
			lastIndex = end
		}
		return /** @type {any} */ (model)
	}

	return mappableParser({ parse: parseInternal })
}

export const t = {
	...commonTypes,
	named,
	tpl,
	tpl2,
}
