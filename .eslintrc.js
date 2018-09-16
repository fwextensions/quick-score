module.exports = {
	"env": {
		"browser": true,
		"es6": true
	},
	"extends": "eslint:recommended",
	"parserOptions": {
		"ecmaVersion": 2015,
		"sourceType": "module"
	},
	"rules": {
		"accessor-pairs": "error",
		"array-bracket-newline": "error",
		"array-bracket-spacing": "error",
		"array-callback-return": "error",
		"array-element-newline": [
			"error",
			"consistent"
		],
		"arrow-body-style": "error",
		"arrow-parens": ["error", "as-needed"],
		"arrow-spacing": "error",
		"block-scoped-var": "error",
		"block-spacing": "error",
		"brace-style": "off",
		"callback-return": "error",
		"camelcase": "error",
		"capitalized-comments": [
			"off",
			"never"
		],
		"class-methods-use-this": "off",
		"comma-dangle": "error",
		"comma-spacing": [
			"error",
			{
				"after": true,
				"before": false
			}
		],
		"comma-style": "error",
		"complexity": "off",
		"computed-property-spacing": "error",
		"consistent-return": "error",
		"consistent-this": "error",
		"curly": "error",
		"default-case": "error",
		"dot-location": "error",
		"dot-notation": "error",
		"eol-last": "error",
		"eqeqeq": "off",
		"func-call-spacing": "error",
		"func-name-matching": "error",
		"func-names": "off",
		"func-style": [
			"error",
			"declaration"
		],
		"function-paren-newline": "off",
		"generator-star-spacing": "error",
		"global-require": "error",
		"guard-for-in": "error",
		"handle-callback-err": "error",
		"id-blacklist": "error",
		"id-length": "off",
		"id-match": "error",
		"implicit-arrow-linebreak": "error",
		"indent": "off",
		"indent-legacy": "off",
		"init-declarations": "error",
		"jsx-quotes": "error",
		"key-spacing": "error",
		"keyword-spacing": [
			"error",
			{
				"after": true,
				"before": true
			}
		],
		"line-comment-position": "error",
		"linebreak-style": "off",
		"lines-around-comment": "error",
		"lines-around-directive": "error",
		"lines-between-class-members": [
			"error",
			"always"
		],
		"max-classes-per-file": "off",
		"max-depth": "off",
		"max-len": "off",
		"max-lines": "error",
		"max-lines-per-function": "off",
		"max-nested-callbacks": "error",
		"max-params": "off",
		"max-statements": "off",
		"max-statements-per-line": "error",
		"multiline-comment-style": [
			"error",
			"separate-lines"
		],
		"multiline-ternary": "off",
		"new-cap": "error",
		"new-parens": "error",
		"newline-after-var": [
			"error",
			"always"
		],
		"newline-before-return": "error",
		"newline-per-chained-call": "error",
		"no-alert": "error",
		"no-array-constructor": "error",
		"no-async-promise-executor": "error",
		"no-await-in-loop": "error",
		"no-bitwise": "error",
		"no-buffer-constructor": "error",
		"no-caller": "error",
		"no-catch-shadow": "error",
		"no-confusing-arrow": [
			"error",
			{
				"allowParens": true
			}
		],
		"no-continue": "off",
		"no-div-regex": "error",
		"no-duplicate-imports": [
			"error",
			{
				"includeExports": false
			}
		],
		"no-else-return": "off",
		"no-empty-function": "error",
		"no-eq-null": "error",
		"no-eval": "error",
		"no-extend-native": "error",
		"no-extra-bind": "error",
		"no-extra-label": "error",
		"no-extra-parens": "off",
		"no-floating-decimal": "off",
		"no-global-assign": "error",
		"no-implicit-coercion": "error",
		"no-implicit-globals": "error",
		"no-implied-eval": "error",
		"no-inline-comments": "error",
		"no-invalid-this": "error",
		"no-iterator": "error",
		"no-label-var": "error",
		"no-labels": "error",
		"no-lone-blocks": "error",
		"no-lonely-if": "error",
		"no-loop-func": "error",
		"no-magic-numbers": "off",
		"no-misleading-character-class": "error",
		"no-mixed-operators": [
			"error",
			{
				"allowSamePrecedence": true
			}
		],
		"no-mixed-requires": "error",
		"no-multi-assign": "error",
		"no-multi-spaces": "error",
		"no-multi-str": "error",
		"no-multiple-empty-lines": "error",
		"no-native-reassign": "error",
		"no-negated-condition": "off",
		"no-negated-in-lhs": "error",
		"no-nested-ternary": "error",
		"no-new": "error",
		"no-new-func": "error",
		"no-new-object": "error",
		"no-new-require": "error",
		"no-new-wrappers": "error",
		"no-octal-escape": "error",
		"no-param-reassign": "error",
		"no-path-concat": "error",
		"no-plusplus": "off",
		"no-process-env": "error",
		"no-process-exit": "error",
		"no-proto": "error",
		"no-prototype-builtins": "error",
		"no-restricted-globals": "error",
		"no-restricted-imports": "error",
		"no-restricted-modules": "error",
		"no-restricted-properties": "error",
		"no-restricted-syntax": "error",
		"no-return-assign": "error",
		"no-return-await": "error",
		"no-script-url": "error",
		"no-self-compare": "error",
		"no-sequences": "error",
		"no-shadow": "error",
		"no-shadow-restricted-names": "error",
		"no-spaced-func": "error",
		"no-sync": "error",
		"no-tabs": "off",
		"no-template-curly-in-string": "error",
		"no-ternary": "off",
		"no-throw-literal": "error",
		"no-trailing-spaces": "error",
		"no-undef-init": "error",
		"no-undefined": "error",
		"no-underscore-dangle": "error",
		"no-unmodified-loop-condition": "error",
		"no-unneeded-ternary": "error",
		"no-unused-expressions": "error",
		"no-unused-vars": ["error", {"args": "none"}],
		"no-use-before-define": "off",
		"no-useless-call": "error",
		"no-useless-computed-key": "error",
		"no-useless-concat": "error",
		"no-useless-constructor": "error",
		"no-useless-rename": "error",
		"no-useless-return": "error",
		"no-var": "error",
		"no-void": "error",
		"no-warning-comments": "error",
		"no-whitespace-before-property": "error",
		"no-with": "error",
		"nonblock-statement-body-position": "error",
		"object-curly-newline": "error",
		"object-curly-spacing": [
			"error",
			"never"
		],
		"object-property-newline": "error",
		"object-shorthand": [2, "consistent"],
		"one-var": "off",
		"one-var-declaration-per-line": "error",
		"operator-assignment": [
			"error",
			"always"
		],
		"operator-linebreak": [
			"error",
			"after"
		],
		"padded-blocks": "off",
		"padding-line-between-statements": "error",
		"prefer-arrow-callback": "error",
		"prefer-const": "error",
		"prefer-destructuring": "error",
		"prefer-numeric-literals": "error",
		"prefer-object-spread": "off",
		"prefer-promise-reject-errors": "error",
		"prefer-reflect": "off",
		"prefer-rest-params": "error",
		"prefer-spread": "error",
		"prefer-template": "off",
		"quote-props": "off",
		"quotes": [
			"error",
			"double"
		],
		"radix": "error",
		"require-atomic-updates": "error",
		"require-await": "error",
		"require-jsdoc": "off",
		"require-unicode-regexp": "error",
		"rest-spread-spacing": "error",
		"semi": "error",
		"semi-spacing": [
			"error",
			{
				"after": true,
				"before": false
			}
		],
		"semi-style": [
			"error",
			"last"
		],
		"sort-imports": "off",
		"sort-keys": "off",
		"sort-vars": "off",
		"space-before-blocks": "error",
		"space-before-function-paren": "off",
		"space-in-parens": [
			"error",
			"never"
		],
		"space-infix-ops": "error",
		"space-unary-ops": "error",
		"spaced-comment": "error",
		"strict": "error",
		"switch-colon-spacing": "error",
		"symbol-description": "error",
		"template-curly-spacing": "error",
		"template-tag-spacing": "error",
		"unicode-bom": [
			"error",
			"never"
		],
		"valid-jsdoc": "error",
		"vars-on-top": "error",
		"wrap-regex": "error",
		"yield-star-spacing": "error",
		"yoda": [
			"error",
			"never"
		]
	}
};