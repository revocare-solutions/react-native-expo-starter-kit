module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
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
    ]
  };
};
