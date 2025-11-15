import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import jestPlugin from 'eslint-plugin-jest';
import tseslint from 'typescript-eslint';

export default defineConfig([
	{
		ignores: ['**/node_modules', '**/dist', 'eslint.config.mjs']
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	eslintPluginPrettierRecommended,
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.es2024
			},
			parserOptions: {
				project: ['./tsconfig.json'],
				tsconfigRootDir: import.meta.dirname,
				sourceType: 'module'
			}
		}
	},
	{
		plugins: { jest: jestPlugin },
		files: ['**/*.spec.{ts,js}', '**/*.test.{ts,js}', '**/jest.*'],
		languageOptions: {
			globals: {
				...globals.node,
				...jestPlugin.environments.globals.globals
			}
		},
		rules: {
			...jestPlugin.configs.recommended.rules,
			'@typescript-eslint/no-require-imports': 'off'
		}
	},
	{
		rules: {
			'no-const-assign': 'error',
			curly: 'error',
			eqeqeq: 'error',
			'no-console': 'error',
			'no-empty': 'error',
			'no-else-return': 'error',
			'no-extend-native': 'error',
			'no-param-reassign': 'error',
			'no-self-compare': 'error',
			'no-undef-init': 'error',
			'no-use-before-define': 'error',
			'no-eval': 'error',
			'no-new-func': 'error',
			'no-implied-eval': 'error',
			'no-script-url': 'error',
			'no-template-curly-in-string': 'error',
			'no-throw-literal': 'error',
			'no-unused-expressions': 'error',
			'no-useless-call': 'error',
			'no-useless-catch': 'error',
			'no-void': 'error',
			'prefer-const': 'error',
			radix: 'error',
			'no-caller': 'error',
			'no-sequences': 'error',
			'no-floating-decimal': 'error',
			'no-new-wrappers': 'error',
			'no-restricted-globals': ['error', 'event', 'fdescribe'],
			'no-unsafe-negation': 'error',
			'func-names': ['error', 'as-needed'],
			'no-underscore-dangle': ['error', { allow: ['_id', '__v'] }],
			'consistent-return': 'error',
			'padding-line-between-statements': [
				'error',
				{ blankLine: 'always', prev: 'directive', next: '*' },
				{ blankLine: 'any', prev: 'directive', next: 'directive' },
				{ blankLine: 'always', prev: 'import', next: '*' },
				{ blankLine: 'any', prev: 'import', next: 'import' },
				{ blankLine: 'always', prev: '*', next: ['const', 'let', 'var'] },
				{ blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
				{ blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
				{ blankLine: 'always', prev: '*', next: ['class', 'if', 'while', 'switch', 'try'] },
				{ blankLine: 'always', prev: ['class', 'if', 'while', 'switch', 'try'], next: '*' },
				{ blankLine: 'always', prev: '*', next: 'return' }
			],

			'@typescript-eslint/no-require-imports': 'error',
			'@typescript-eslint/no-empty-interface': ['error', { allowSingleExtends: true }],
			'@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
			'@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: true }],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_'
				}
			]
		}
	}
]);
