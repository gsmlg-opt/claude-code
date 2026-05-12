/**
 * Thin subprocess wrapper for ultrareviewCommand.runner.tsx.
 *
 * The runner mocks react and @anthropic/ink to inspect JSX cheaply. Bun module
 * mocks are process-global, so keep those mocks out of the main test process.
 */
import { describe, expect, test } from 'bun:test'
import { relative, resolve } from 'path'

const PROJECT_ROOT = resolve(__dirname, '..', '..', '..', '..')
const RUNNER_ABS = resolve(__dirname, 'ultrareviewCommand.runner.tsx')
const RUNNER_REL = './' + relative(PROJECT_ROOT, RUNNER_ABS).replace(/\\/g, '/')

describe('ultrareviewCommand', () => {
  test('runs all ultrareview command tests in isolated subprocess', async () => {
    const proc = Bun.spawn(['bun', 'test', RUNNER_REL], {
      cwd: PROJECT_ROOT,
      stdout: 'pipe',
      stderr: 'pipe',
    })
    const code = await proc.exited
    if (code !== 0) {
      const stderr = await new Response(proc.stderr).text()
      const stdout = await new Response(proc.stdout).text()
      const output = (stderr + '\n' + stdout).slice(-3000)
      throw new Error(
        `ultrareview command subprocess failed (exit ${code}):\n${output}`,
      )
    }
  }, 60_000)
})
