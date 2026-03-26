const { createJiti } = require("jiti");
const jiti = createJiti(__filename);

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
