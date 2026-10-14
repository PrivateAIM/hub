import config from '@tada5hi/eslint-config';
import globals from 'globals';

export default [
    ...await config(),
    {
        ignores: [
            '**/dist/**',
            '**/*.d.ts',
            '**/node_modules/**',
            '**/.nuxt/**',
            '**/.nx/**',
            '**/writable/**',
            '**/.output/**',
            // VitePress dev-server dependency cache — generated, gitignored,
            // and only present once the docs dev server has run locally. Without
            // this, `npm run lint` is red locally but green on a fresh CI checkout.
            '**/.vitepress/cache/**',
            // Local agent state, including stale git worktrees under
            // .claude/worktrees/ — untracked and never present on a CI
            // checkout, but a full local `npm run lint` globs into them.
            '**/.claude/**',
        ],
    },
    {
        // rapiq filters that need an operator are built with the typed helpers
        // from `@rapiq/core` (`contains`, `not`, `lt`, `inArray`, …), never with a
        // hand-built wire-marker string (`'~' + q`, `'!' + s`, `` `<${t}` ``).
        // See .agents/conventions.md#query-filters.
        rules: {
            'no-restricted-syntax': [
                'error',
                ...[
                    'Property[key.name="filters"] Property > Literal.value[value=/^[~!<>]/]',
                    'Property[key.name="filters"] Property > BinaryExpression[operator="+"] > Literal.left[value=/^[~!<>]/]',
                    'Property[key.name="filters"] Property > TemplateLiteral > TemplateElement:first-child[value.raw=/^[~!<>]/]',
                ].map((selector) => ({
                    selector,
                    message: 'Build operator filters with the rapiq helpers (contains, not, lt, inArray, …) from @rapiq/core instead of wire-marker strings.',
                })),
            ],
        },
    },
    {
        // SFCs are browser/SSR code — the shared config only registers Node
        // globals for `.vue` files, so DOM-only globals (DragEvent, FileList,
        // HTMLInputElement, …) otherwise trip `no-undef`.
        files: ['**/*.vue'],
        languageOptions: { globals: { ...globals.browser } },
        rules: { '@typescript-eslint/no-explicit-any': 'off' },
    },
];
