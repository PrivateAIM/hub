/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Tool } from './types';

export const TOOLS: Tool[] = [
    {
        name: 'authup',
        description: 'Authentication & authorization framework — the platform\'s identity provider.',
        website: 'https://authup.org',
        repository: 'https://github.com/authup/authup',
    },
    {
        name: 'vuecs',
        description: 'Vue component system powering the interface.',
        website: 'https://vuecs.dev',
        repository: 'https://github.com/tada5hi/vuecs',
    },
    {
        name: 'routup',
        description: 'HTTP routing framework behind the platform APIs.',
        website: 'https://routup.dev',
        repository: 'https://github.com/routup/routup',
    },
    {
        name: 'validup',
        description: 'Validation framework for inputs & domain models.',
        website: 'https://validup.tada5hi.net',
        repository: 'https://github.com/tada5hi/validup',
    },
    {
        name: 'ilingo',
        description: 'Internationalization library for translations.',
        website: 'https://ilingo.tada5hi.net',
        repository: 'https://github.com/tada5hi/ilingo',
    },
];
