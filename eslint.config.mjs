export default [
  {
    ignores: ["node_modules", ".next", "dist", "build", "__tests__", "*.config.js"],
  },
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
]
