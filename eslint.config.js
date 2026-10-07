import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import {defineConfig} from 'eslint/config';
import tseslint from 'typescript-eslint';

/** ESLint requires a default export for its flat configuration. */
export default defineConfig(
    {ignores: ['node_modules/**', 'dist/**', 'coverage/**']},
    {
        files: ['**/*.js'],
        extends: [js.configs.recommended],
    },
    {
        files: ['**/*.ts'],
        extends: [tseslint.configs.recommendedTypeChecked],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/explicit-function-return-type': 'error',
            '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
            '@typescript-eslint/no-unused-vars': [
                'error', {argsIgnorePattern: '^_'},
            ],
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'ExportDefaultDeclaration',
                    message: 'Use named exports in application code.',
                },
                {
                    selector: 'TSEnumDeclaration',
                    message: 'Use unions for Node.js native TypeScript execution.',
                },
            ],
        },
    },
    {
        files: ['**/*.{ts,js}'],
        plugins: {'@stylistic': stylistic},
        rules: {
            'curly': ['error', 'all'],
            'eqeqeq': ['error', 'always'],
            'prefer-const': 'error',
            '@stylistic/indent': ['error', 4, {SwitchCase: 1}],
            '@stylistic/semi': ['error', 'always'],
            '@stylistic/quotes': ['error', 'single', {avoidEscape: true}],
            '@stylistic/comma-dangle': ['error', 'always-multiline'],
            '@stylistic/object-curly-spacing': ['error', 'never'],
            '@stylistic/arrow-parens': ['error', 'always'],
            '@stylistic/eol-last': ['error', 'always'],
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/max-len': ['error', {
                code: 80,
                comments: 80,
                ignoreUrls: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
                ignoreRegExpLiterals: true,
            }],
        },
    },
);
