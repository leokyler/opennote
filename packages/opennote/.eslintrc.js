module.exports = {
  root: true,
  extends: ["@packages/eslint-config"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  ignorePatterns: ["dist", "node_modules", "coverage"],
};
