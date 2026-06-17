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
            "@": "../../packages/shared/src",
            "@app": "./src",
            "@assets": "./assets"
          },
          extensions: [".tsx", ".ts", ".js", ".json"]
        }
      ],
      "react-native-reanimated/plugin",
    ]
  };
};
