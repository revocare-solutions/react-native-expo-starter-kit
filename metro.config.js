const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Optional SDKs that may not be installed — Metro should return an empty module
// instead of failing when these packages are missing. Each feature's factory
// handles the missing module gracefully with try/catch + no-op fallback.
const optionalDeps = [
  "@sentry/react-native",
  "expo-notifications",
];

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (optionalDeps.includes(moduleName)) {
    try {
      require.resolve(moduleName);
    } catch {
      // Package not installed — return empty module
      return { type: "empty" };
    }
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
