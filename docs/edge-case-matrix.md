# Demo edge-case matrix

This matrix records the product's real-data failure behavior. It contains no test farm, forecast, price, soil, or advisory values. Run the verification commands with a real saved profile and configured credentials before a demo.

| Case | Expected behavior | Verification command or flow | Result |
| --- | --- | --- | --- |
| Unknown place | Geocoding returns a typed `Location was not found` result; no location is invented. | Ask the live chat about a deliberately unknown location. | Pending T24 live verification |
| Ambiguous place | Open-Meteo's selected result and administrative fields remain visible in the trace; ask for clarification if the farmer needs a different place. | Ask using an ambiguous place name and inspect the geocode trace. | Pending T24 live verification |
| Crop with no mandi data | The mandi tool returns typed no-data state, never a price. | Ask using a real profile and a commodity with no matching record. | Pending T24 live verification |
| Mixed language | The selected profile language controls the reply while live-source trace fields remain intact. | Send a mixed-language question from each supported profile language. | Pending T24 live verification |
| Empty or very long question | The API rejects invalid input with a clear JSON error before invoking Gemini. | Submit an empty question, then one longer than the route limit. | Pending T24 live verification |
| SoilGrids unavailable | The trace identifies SoilGrids as unavailable or labels a cache with age; it never invents soil values. | Ask a soil question while the provider is unavailable, or inspect its explicit unavailable result. | Pending provider-state verification |
| Gemini rate limit | The API returns a clear upstream failure; the UI shows it without a fabricated advisory. | Make a real request only if the provider rate limit occurs; do not force quota exhaustion. | Pending provider-state verification |
| Telegram not linked | Alert check reports that delivery was skipped because no chat is linked, without creating a fake delivery. | Save a real profile without Telegram, then use Check alerts now. | Pending T24 live verification |

## Cache warmer

Use only the farm context chosen for the demo. The command invokes the existing typed geocode, weather, soil, and mandi tools, which write successful live results to the configured cache and retain successful mandi observations.

```bash
npm run warm -- --place "<place>" --state "<state>" --district "<district>" --crop "<crop>"
```

Repeat `--crop` for each real crop. A tool failure makes the command exit nonzero and prints its source, timestamp, and error without substituting data.
