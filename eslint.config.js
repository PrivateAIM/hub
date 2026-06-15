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
        ],
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
