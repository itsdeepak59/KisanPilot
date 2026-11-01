# Demo edge-case matrix

This matrix records checks that do not invent business data. Live rows use an operator-supplied Preview URL and real credentials/data; the warm command requires the operator to supply the real place, state, district, and crop.

| Case | Check | Expected behavior | Status / evidence |
| --- | --- | --- | --- |
| Empty question | `npm run test:edge` | HTTP 400 with a required-question error | PASS — deployed `improve` check on 2026-10-31 |
| Very long question | `npm run test:edge` | HTTP 400; no model call | PASS — deployed `improve` check on 2026-10-31 |
| Unknown alert device | `npm run test:edge` | HTTP 404; no Telegram message | PASS — deployed `improve` check on 2026-10-31 |
| Cron without secret | `npm run test:edge` | HTTP 401 | PASS — deployed `improve` check on 2026-10-31 |
| Telegram without webhook secret | `npm run test:edge` | HTTP 401 when Preview secret is configured | PASS — deployed `improve` check on 2026-10-31 |
| Unknown place | Ask using a real unknown place supplied during the demo | Tool returns an unavailable/no-location result; no location is invented | DOCUMENTED — existing geocode unavailable path and tool trace from T10/T17 |
| Ambiguous place | Ask using a real ambiguous place supplied during the demo | Geocoder result is shown; ask for clarification if the location is missing | DOCUMENTED — bounded geocode result and clarification rule in agent prompt |
| Crop with no mandi data | Ask using a real crop supplied during the demo | Explicit no-data result or timestamped cache; no price is invented | DOCUMENTED — typed no-data/cache path in mandi tool |
| Mixed language | Submit a real Hindi or Telugu question | Answer uses the selected language and retains source trace | PASS — Hindi and Telugu Preview checks recorded in T15/T17 |
| SoilGrids unavailable | Run when provider returns non-JSON/5xx | Explicit unavailable state; no soil value is synthesized | PASS — provider-unavailable path recorded in T8/T17 |
| Gemini rate limit | Exceed chat limit from one IP/device | Friendly HTTP 429 with `Retry-After` | PASS — bounded 429 check recorded in T19 |
| Telegram not linked | Run alert check on a saved profile without chat link | Compare live forecast to thresholds; do not send a Telegram message | PASS — below-threshold Preview check recorded in T23 |

## Parameterized cache warm

```text
npm run warm -- --base-url <preview-url> --place <real-place> --state <real-state> --district <real-district> --crop <real-crop>
```

The command makes one real chat request that asks the live tools for weather, soil, mandi, and official-advisory data. It does not contain a built-in place, crop, price, weather value, or sample business record.
