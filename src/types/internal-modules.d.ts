/**
 * Type declarations for internal Anthropic packages that cannot be installed
 * from public npm. All exports are typed as `any` to suppress errors while
 * still allowing IDE navigation for the actual source code.
 */

// ============================================================================
// bun:bundle — compile-time macros (replaced by src/shims/bun-bundle.ts)
// ============================================================================

declare module "bun:ffi" {
    export function dlopen<T extends Record<string, { args: readonly string[]; returns: string }>>(path: string, symbols: T): { symbols: { [K in keyof T]: (...args: unknown[]) => unknown }; close(): void };
}

//
