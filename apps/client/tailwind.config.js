const path = require("path");
const jiti = require("jiti")(__filename);

const { generateTailwindTheme } = jiti("../../packages/shared/src/features/theme/utils/generate-tailwind");
const { themeConfig } = jiti("../../packages/shared/src/config/theme.config");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/shared/src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: generateTailwindTheme(themeConfig),
  },
  plugins: [],
};
