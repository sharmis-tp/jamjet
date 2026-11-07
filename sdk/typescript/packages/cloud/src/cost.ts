// USD per million tokens: [input, output, cacheRead?]. Must equal
// sdk/conformance/cloud-sdk-vectors.json `prices.models` (tests compare them),
// which also records where the prices come from. cacheRead is present only
// where the price is published.
export const PRICES_PER_MTOK: Readonly<Record<string, readonly [number, number, number?]>> = {
  'gpt-4o': [2.5, 10],
  'gpt-4o-mini': [0.15, 0.6],
  'gpt-4-turbo': [10, 30],
  'gpt-4': [30, 60],
  'gpt-3.5-turbo': [0.5, 1.5],
  'claude-fable-5-1': [10, 50, 0.25],
  'claude-fable-5': [10, 50],
  'claude-opus-5-5': [4, 20, 0.2],
  'claude-opus-5': [5, 25],
  'claude-opus-4-8': [5, 25],
  'claude-opus-4-7': [5, 25, 0.5],
  'claude-opus-4-6': [5, 25, 0.5],
  'claude-opus-4-20250514': [15, 75],
  'claude-sonnet-5-5': [2, 10, 0.2],
  'claude-sonnet-5': [2, 10],
  'claude-sonnet-4-6': [3, 15, 0.3],
  'claude-sonnet-4-20250514': [3, 15],
  'claude-haiku-4-5': [1, 5, 0.1],
  'claude-haiku-4-5-20251001': [1, 5, 0.1],
  'claude-3-5-haiku-20241022': [0.8, 4],
  'claude-3-haiku-20240307': [0.25, 1.25],
}

const FALLBACK_PER_MTOK: readonly [number, number] = [3, 15]

export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const [input, output] = PRICES_PER_MTOK[model] ?? FALLBACK_PER_MTOK
  return (inputTokens * input + outputTokens * output) / 1_000_000
}

/** USD saved by reading `cacheReadTokens` from the prompt cache instead of as fresh input. */
export function cacheReadSavingsUsd(model: string, cacheReadTokens: number): number {
  const prices = PRICES_PER_MTOK[model]
  if (prices === undefined || prices[2] === undefined) return 0
  return (cacheReadTokens * (prices[0] - prices[2])) / 1_000_000
}
