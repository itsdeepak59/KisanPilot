import assert from "node:assert/strict";
import test from "node:test";
import { computeHarvestSignal, computeSellHoldSignal, computeWaterSignal } from "../../lib/decision/signals.ts";

const day = (overrides: Record<string, number | string | null> = {}) => ({ date: "2026-11-01", rain_mm: 0, min_temperature_c: 18, max_temperature_c: 30, max_wind_kmh: 10, et0_mm: 4, ...overrides });

test("harvest signal selects forecast days that satisfy its visible rule", () => {
  const result = computeHarvestSignal([day(), day({ date: "2026-11-02", rain_mm: 8 })]);
  assert.equal(result.status, "favorable");
  assert.deepEqual(result.dates, ["2026-11-01"]);
});

test("water signal computes rain minus ET0", () => {
  const result = computeWaterSignal([day({ rain_mm: 2, et0_mm: 5 }), day({ rain_mm: 1, et0_mm: 4 })]);
  assert.equal(result.balance_mm, -6);
  assert.equal(result.status, "deficit");
});

test("sell hold signal refuses insufficient history", () => {
  const result = computeSellHoldSignal([{ modal_price: 100 }, { modal_price: 110 }] as never);
  assert.equal(result.signal, "insufficient_history");
  assert.equal(result.sample_size, 2);
});

test("sell signal compares the latest price with the retained average", () => {
  const result = computeSellHoldSignal([{ modal_price: 100 }, { modal_price: 100 }, { modal_price: 120 }] as never);
  assert.equal(result.signal, "sell");
});
