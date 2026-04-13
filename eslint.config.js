import config from '@tada5hi/eslint-config';

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
        files: ['**/*.vue'],
        rules: { '@typescript-eslint/no-explicit-any': 'off' },
    },
];
