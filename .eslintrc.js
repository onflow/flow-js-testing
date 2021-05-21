module.exports = {
  extends: ["eslint:recommended", "plugin:jest/recommended"],
  env: {
    node: true,
    es6: true
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {},
  plugins: ["jest"],
};
