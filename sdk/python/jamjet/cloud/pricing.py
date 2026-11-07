"""Model prices for cost estimates and budget enforcement.

USD per million tokens: (input, output, cache_read). Must equal
``sdk/conformance/cloud-sdk-vectors.json`` ``prices.models`` (the tests
compare them, and the TypeScript SDK's table, entry by entry); that file also
records where the prices come from. ``cache_read`` is None where no price is
published.
"""

from __future__ import annotations

PRICES_PER_MTOK: dict[str, tuple[float, float, float | None]] = {
    "gpt-4o": (2.5, 10.0, None),
    "gpt-4o-mini": (0.15, 0.6, None),
    "gpt-4-turbo": (10.0, 30.0, None),
    "gpt-4": (30.0, 60.0, None),
    "gpt-3.5-turbo": (0.5, 1.5, None),
    "claude-fable-5-1": (10.0, 50.0, 0.25),
    "claude-fable-5": (10.0, 50.0, None),
    "claude-opus-5-5": (4.0, 20.0, 0.2),
    "claude-opus-5": (5.0, 25.0, None),
    "claude-opus-4-8": (5.0, 25.0, None),
    "claude-opus-4-7": (5.0, 25.0, 0.5),
    "claude-opus-4-6": (5.0, 25.0, 0.5),
    "claude-opus-4-20250514": (15.0, 75.0, None),
    "claude-sonnet-5-5": (2.0, 10.0, 0.2),
    "claude-sonnet-5": (2.0, 10.0, None),
    "claude-sonnet-4-6": (3.0, 15.0, 0.3),
    "claude-sonnet-4-20250514": (3.0, 15.0, None),
    "claude-haiku-4-5": (1.0, 5.0, 0.1),
    "claude-haiku-4-5-20251001": (1.0, 5.0, 0.1),
    "claude-3-5-haiku-20241022": (0.8, 4.0, None),
    "claude-3-haiku-20240307": (0.25, 1.25, None),
}

# Rate for a model missing from the table.
FALLBACK_PER_MTOK: tuple[float, float] = (3.0, 15.0)


def estimate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    """Estimated USD for a call."""
    prices = PRICES_PER_MTOK.get(model)
    input_rate, output_rate = (prices[0], prices[1]) if prices else FALLBACK_PER_MTOK
    return (input_tokens * input_rate + output_tokens * output_rate) / 1_000_000


def cache_read_savings_usd(model: str, cache_read_tokens: int) -> float:
    """USD saved by reading tokens from the prompt cache instead of as fresh input."""
    prices = PRICES_PER_MTOK.get(model)
    if prices is None or prices[2] is None:
        return 0.0
    return cache_read_tokens * (prices[0] - prices[2]) / 1_000_000
