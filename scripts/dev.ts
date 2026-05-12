#!/usr/bin/env bun
/**
 * Dev entrypoint — launches cli.tsx with MACRO.* defines injected
 * via Bun's -d flag (bunfig.toml [define] doesn't propagate to
 * dynamically imported modules at runtime).
 */
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getMacroDefines, DEFAULT_BUILD_FEATURES } from './defines.ts'

// Resolve project root from this script's location
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
const cliPath = join(projectRoot, 'src/entrypoints/cli.tsx')

const defines = {
  ...getMacroDefines(),
  // React production mode — prevents 6,889+ _debugStack Error objects
  // (12MB) from accumulating during long-running sessions.
  // dev 模式使用 development 模式
  'process.env.NODE_ENV': JSON.stringify('production'),
}

const defineArgs = Object.entries(defines).flatMap(([k, v]) => [
  '-d',
  `${k}:${v}`,
])

// Feature flags are evaluated by src/shims/bun-bundle.ts via FEATURE_* env vars.
const featureEnv: Record<string, string> = {}
for (const name of DEFAULT_BUILD_FEATURES) {
  featureEnv[`FEATURE_${name}`] = '1'
}
for (const [key, value] of Object.entries(process.env)) {
  if (key.startsWith('FEATURE_') && value) {
    featureEnv[key] = value
  }
}

// If BUN_INSPECT is set, pass --inspect-wait to the child process
const inspectArgs = process.env.BUN_INSPECT
  ? ['--inspect-wait=' + process.env.BUN_INSPECT]
  : []

const result = Bun.spawnSync(
  [
    'bun',
    ...inspectArgs,
    'run',
    ...defineArgs,
    cliPath,
    ...process.argv.slice(2),
  ],
  {
    stdio: ['inherit', 'inherit', 'inherit'],
    cwd: projectRoot,
    env: { ...process.env, ...featureEnv },
  },
)

process.exit(result.exitCode ?? 0)
