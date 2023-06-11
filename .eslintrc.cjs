module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'vue',
  ],
  overrides: [
    {
      files: ['main.js'],
      rules: {
        'import/no-unresolved': 'off',
      },
    },
  ],
  rules: {
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', './src/'],
        ],
      },
    },
  },
};
