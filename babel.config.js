module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@assets": "./assets"
          },
          extensions: [".tsx", ".ts", ".js", ".json"]
        }
      ],
      "react-native-reanimated/plugin",
    ]
  };
};
