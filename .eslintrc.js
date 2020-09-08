module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'linebreak-style': 'off', // handled by git
    'global-require': 'off', // lazy imports are useful for serverless
    'no-underscore-dangle': 'off', // preference, sometimes like private variables (pythonic)
    camelcase: 'warn', // underscore delimination used for some database variables
    'no-use-before-define': 'warn',
    'no-unused-vars': 'warn',
    'nonblock-statement-body-position': ['error', 'below'],
    curly: ['error', 'multi', 'consistent'],
    'no-warning-comments': [2, { terms: ['FIXME', 'TODO'], location: 'anywhere' }], // useful for tracking errors
    'react/prefer-stateless-function': 'off', // too much legacy :(
    'react/jsx-filename-extension':'off', // this is just stupid
    'react/no-array-index-key': 'warn', // annoying
    'import/no-unresolved': 'off', // objective imports from src don't work correctly
    'react/forbid-prop-types': 'warn', // way too opioniated 
    'no-plusplus': 'warn', // there's a use for this
  },
};
