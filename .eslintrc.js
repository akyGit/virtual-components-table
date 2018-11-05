module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'import/extensions': {
      vue: 'never',
    },
    'no-param-reassign': 0,
    'func-names': 0,
    'no-nested-ternary': 0,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
