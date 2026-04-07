#!/usr/bin/env bun
/**
 * Dev entrypoint — launches cli.tsx with MACRO.* defines injected
 * via Bun's -d flag (bunfig.toml [define] doesn't propagate to
 * dynamically imported modules at runtime).
 */
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getMacroDefines } from "./defines.ts";

// Resolve project root from this script's location
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");
const cliPath = join(projectRoot, "src/entrypoints/cli.tsx");

const defines = getMacroDefines();

const defineArgs = Object.entries(defines).flatMap(([k, v]) => [
    "-d",
    `${k}:${v}`,
]);

// Feature flags: enable feature() gates at runtime via FEATURE_<NAME>=1 env vars.
// The bun:bundle polyfill (--preload) reads these at call time.
const DEFAULT_FEATURES = [
  "BUDDY", "TRANSCRIPT_CLASSIFIER", "BRIDGE_MODE",
  "AGENT_TRIGGERS_REMOTE", "CHICAGO_MCP", "VOICE_MODE",
  "SHOT_STATS", "PROMPT_CACHE_BREAK_DETECTION", "TOKEN_BUDGET",
  // P0: local features
  "AGENT_TRIGGERS",
  "ULTRATHINK",
  "BUILTIN_EXPLORE_PLAN_AGENTS",
  "LODESTONE",
  // P1: API-dependent features
  "EXTRACT_MEMORIES", "VERIFICATION_AGENT",
  "KAIROS_BRIEF", "AWAY_SUMMARY", "ULTRAPLAN",
];

// Build feature env vars: merge defaults with any FEATURE_<NAME>=1 from env
const featureEnv: Record<string, string> = {};
for (const name of DEFAULT_FEATURES) {
    featureEnv[`FEATURE_${name}`] = "1";
}
// Preserve any FEATURE_* vars already in environment
for (const [k, v] of Object.entries(process.env)) {
    if (k.startsWith("FEATURE_") && v) {
        featureEnv[k] = v;
    }
}

// If BUN_INSPECT is set, pass --inspect-wait to the child process
const inspectArgs = process.env.BUN_INSPECT
    ? ["--inspect-wait=" + process.env.BUN_INSPECT]
    : [];

const result = Bun.spawnSync(
    ["bun", ...inspectArgs, "run", ...defineArgs, cliPath, ...process.argv.slice(2)],
    {
        stdio: ["inherit", "inherit", "inherit"],
        cwd: projectRoot,
        env: { ...process.env, ...featureEnv },
    },
);

process.exit(result.exitCode ?? 0);
