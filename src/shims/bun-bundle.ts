/**
 * Shim for the `bun:bundle` built-in module (Anthropic's custom Bun fork).
 *
 * In standard Bun, `bun:bundle` doesn't exist. This shim provides the
 * `feature(name)` function which checks `process.env.FEATURE_<NAME>`.
 *
 * All `import { feature } from 'bun:bundle'` references across the codebase
 * have been replaced with `import { feature } from 'src/shims/bun-bundle.js'`.
 */
export function feature(name: string): boolean {
	const val = process.env[`FEATURE_${name}`];
	return val === "1" || val === "true" || val === "yes";
}
