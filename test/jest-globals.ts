// Pre-define globals that Expo SDK 54 runtime sets up as lazy getters.
// Jest 30 has stricter sandboxing that prevents require() calls inside
// property getters on the global object. By eagerly defining these
// globals before the Expo setup files run, we prevent the lazy getters
// from being installed, avoiding the sandbox error.

/* eslint-disable @typescript-eslint/no-explicit-any */
const g = globalThis as any;

if (!g.__ExpoImportMetaRegistry) {
  g.__ExpoImportMetaRegistry = { url: null };
}

if (typeof g.structuredClone === 'undefined') {
  g.structuredClone = <T>(val: T): T => JSON.parse(JSON.stringify(val));
}
