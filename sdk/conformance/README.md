# Cloud SDK conformance

The TypeScript SDK (`sdk/typescript/packages/cloud`) and the Python SDK
(`sdk/python/jamjet/cloud`) evaluate policy and price calls in-process. These
files are the contract both of them test against, so the two cannot drift.

| File | What it pins | Read by |
|---|---|---|
| `policy-decisions.yaml` | Rule order and decisions. Vendored from `jamjet-labs/jamjet-policy`; change it there first. | `tests/conformance-smoke.test.ts`, `tests/cloud/test_conformance.py` |
| `cloud-sdk-vectors.json` | Tool-name glob matching, the price table, cost and cache-read savings. | `tests/conformance-vectors.test.ts`, `tests/cloud/test_conformance.py` |

## Tool-name globs

A rule's pattern is matched against the whole tool name:

- `*` matches any run of characters, including none, `.` and line breaks.
- `?` matches exactly one Unicode code point.
- Every other character is literal. `[`, `]`, `{`, `}`, `!`, `\` and regex
  syntax have no special meaning, so `db.[a-z]*` matches only names that start
  with the literal text `db.[a-z]`.
- Matching is case-sensitive on every platform.

Python's `fnmatch` does not follow this: it treats `[a-z]` as a character class
and is case-insensitive on Windows. The Python SDK therefore uses its own
matcher.

Rules are evaluated in order and the first match wins. No match means allow.

## Prices

`prices.models` lists USD per million tokens. An unknown model is priced at
`prices.fallback`. Cost is `input_tokens * input + output_tokens * output`,
divided by one million. The cache-read saving for a model is
`(input - cache_read)` per million cache-read tokens. It is zero when no
`cache_read` price is listed. Both SDK tables must equal `prices.models`
exactly; the tests compare them entry by entry.
