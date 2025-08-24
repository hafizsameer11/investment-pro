module.exports = {
  root: true,
  extends: ['eslint:recommended','plugin:react/recommended','plugin:react-hooks/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint','react','react-hooks'],
  settings: { react: { version: 'detect' } },
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'error'
  }
};

