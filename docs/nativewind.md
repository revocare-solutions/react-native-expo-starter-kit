# NativeWind Integration Walkthrough

This guide documents how NativeWind v4 was integrated into the **react-native-expo-starter-kit** project.

## 1. Dependencies

The following packages were installed:

```bash
pnpm add nativewind@4.4.1 tailwindcss@3.4.17 react-native-css-interop@0.2.1
```

## 2. Tailwind Configuration

A `tailwind.config.js` file was created in the root directory:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/app/**/*.{js,jsx,ts,tsx}", "./src/components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

## 3. Babel Configuration

The `nativewind/babel` plugin was added to `babel.config.js`:

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // ... other plugins
      "nativewind/babel",
    ]
  };
};
```

## 4. CSS Setup

A `global.css` file was created in the root directory to include Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 5. Root Layout Integration

The `global.css` file is imported in the root layout file `src/app/_layout.tsx`:

```tsx
import '../../global.css';

// ... rest of the layout
```

## 6. Usage

You can now use Tailwind CSS classes in your React Native components:

```tsx
import { Text, View } from 'react-native';

export default function MyComponent() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">
        Hello NativeWind!
      </Text>
    </View>
  );
}
```
