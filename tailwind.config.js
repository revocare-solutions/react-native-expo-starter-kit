const path = require("path");
const jiti = require("jiti")(__filename, {
  alias: {
    "@": path.resolve(__dirname, "src"),
  },
});

const { generateTailwindTheme } = jiti("./src/features/theme/utils/generate-tailwind");
const { themeConfig } = jiti("./src/config/theme.config");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: generateTailwindTheme(themeConfig),
  },
  plugins: [],
};
