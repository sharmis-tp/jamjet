// Shared vectors with the Python SDK; see sdk/conformance/README.md.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { PRICES_PER_MTOK, cacheReadSavingsUsd, estimateCost } from '../src/cost.js'
import { PolicyEvaluator } from '../src/policy.js'

const vectors = JSON.parse(
  readFileSync(fileURLToPath(new URL('../../../../conformance/cloud-sdk-vectors.json', import.meta.url)), 'utf-8'),
) as {
  glob: Array<{ pattern: string; name: string; match: boolean }>
  prices: { fallback: { input: number; output: number }; models: Record<string, { input: number; output: number; cache_read?: number }> }
  cost: Array<{ model: string; input_tokens: number; output_tokens: number; usd: number }>
  cache_read_savings: Array<{ model: string; cache_read_tokens: number; usd: number }>
}

describe('glob vectors', () => {
  for (const v of vectors.glob) {
    it(`${JSON.stringify(v.pattern)} ${v.match ? 'matches' : 'does not match'} ${JSON.stringify(v.name)}`, () => {
      const ev = new PolicyEvaluator()
      ev.add('block', v.pattern)
      expect(ev.evaluate(v.name).blocked).toBe(v.match)
    })
  }
})

describe('price table', () => {
  it('equals the shared table entry by entry', () => {
    const shared = Object.fromEntries(
      Object.entries(vectors.prices.models).map(([m, p]) => [
        m,
        p.cache_read === undefined ? [p.input, p.output] : [p.input, p.output, p.cache_read],
      ]),
    )
    expect(PRICES_PER_MTOK).toEqual(shared)
  })

  for (const v of vectors.cost) {
    it(`cost of ${v.model} ${v.input_tokens}/${v.output_tokens}`, () => {
      expect(estimateCost(v.model, v.input_tokens, v.output_tokens)).toBeCloseTo(v.usd, 12)
    })
  }

  for (const v of vectors.cache_read_savings) {
    it(`cache-read savings for ${v.model}`, () => {
      expect(cacheReadSavingsUsd(v.model, v.cache_read_tokens)).toBeCloseTo(v.usd, 12)
    })
  }
})
