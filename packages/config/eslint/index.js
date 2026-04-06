/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    'next/core-web-vitals',
    'next/typescript',
  ],
  rules: {
    // 미사용 변수: 경고 (에러 X — 개발 중 허용)
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // any 타입: 경고
    '@typescript-eslint/no-explicit-any': 'warn',
    // console.log: 경고 (console.error/warn은 허용)
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    // React import 생략 허용 (React 17+)
    'react/react-in-jsx-scope': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'dist/',
    'drizzle/',
  ],
};
