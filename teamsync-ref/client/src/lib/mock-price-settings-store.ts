import { defaultPriceSettings } from "./mock-data-ets";

type SettingsMap = Record<string, number>;

const _store: SettingsMap = {};
for (const s of defaultPriceSettings) _store[s.key] = s.value;

export const mockPriceSettingsStore = {
  get(): SettingsMap { return { ..._store }; },
  save(updates: SettingsMap) {
    for (const [k, v] of Object.entries(updates)) _store[k] = v;
  },
  reset() {
    for (const s of defaultPriceSettings) _store[s.key] = s.value;
  },
};
