import { defineConfig } from 'vitepress';

export default defineConfig({
    title: 'PrivateAIM Hub',
    description: 'Privacy-preserving analytics infrastructure — central services documentation',
    base: '/',
    srcDir: '.',
    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Getting Started', link: '/getting-started/' },
            {
                text: 'Guide',
                items: [
                    { text: 'User', link: '/guide/user/' },
                    { text: 'Deployment', link: '/guide/deployment/' },
                    { text: 'Development', link: '/guide/development/' },
                ],
            },
            { text: 'Reference', link: '/reference/' },
            { text: 'Team', link: '/about/team' },
        ],
        sidebar: {
            '/getting-started/': [
                {
                    text: 'Getting Started',
                    items: [
                        { text: 'Overview', link: '/getting-started/' },
                        { text: 'Architecture', link: '/getting-started/architecture' },
                    ],
                },
            ],
            '/guide/user/': [
                {
                    text: 'User',
                    items: [
                        { text: 'Overview', link: '/guide/user/' },
                        { text: 'Projects', link: '/guide/user/projects' },
                        { text: 'Analyses', link: '/guide/user/analyses' },
                    ],
                },
                {
                    text: 'Administration',
                    items: [
                        { text: 'Realms', link: '/guide/user/realms' },
                        { text: 'Nodes', link: '/guide/user/nodes' },
                        { text: 'Approval Workflows', link: '/guide/user/approval' },
                    ],
                },
            ],
            '/guide/deployment/': [
                {
                    text: 'Deployment',
                    items: [
                        { text: 'Overview', link: '/guide/deployment/' },
                        { text: 'Configuration', link: '/guide/deployment/configuration' },
                        { text: 'Docker Image', link: '/guide/deployment/docker' },
                        { text: 'Docker Compose', link: '/guide/deployment/docker-compose' },
                        { text: 'Kubernetes (Helm)', link: '/guide/deployment/kubernetes' },
                        { text: 'Reverse Proxy', link: '/guide/deployment/reverse-proxy' },
                    ],
                },
            ],
            '/guide/development/': [
                {
                    text: 'Development',
                    items: [
                        { text: 'Contributing', link: '/guide/development/' },
                        { text: 'Local Setup', link: '/guide/development/setup' },
                        { text: 'Repository Structure', link: '/guide/development/repository-structure' },
                        { text: 'API Reference', link: '/guide/development/api' },
                    ],
                },
            ],
            '/reference/': [
                {
                    text: 'Reference',
                    items: [
                        { text: 'Overview', link: '/reference/' },
                    ],
                },
                {
                    text: 'Shared',
                    collapsed: false,
                    items: [
                        { text: 'kit', link: '/reference/shared/kit' },
                        { text: 'server-kit', link: '/reference/shared/server-kit' },
                        { text: 'server-db-kit', link: '/reference/shared/server-db-kit' },
                        { text: 'server-http-kit', link: '/reference/shared/server-http-kit' },
                    ],
                },
                {
                    text: 'Core',
                    collapsed: false,
                    items: [
                        { text: 'Service', link: '/reference/core/' },
                        { text: 'core-kit', link: '/reference/core/core-kit' },
                        { text: 'core-http-kit', link: '/reference/core/core-http-kit' },
                        { text: 'core-realtime-kit', link: '/reference/core/core-realtime-kit' },
                    ],
                },
                {
                    text: 'Worker',
                    collapsed: false,
                    items: [
                        { text: 'Service', link: '/reference/worker/' },
                        { text: 'server-core-worker-kit', link: '/reference/worker/server-core-worker-kit' },
                    ],
                },
                {
                    text: 'Storage',
                    collapsed: false,
                    items: [
                        { text: 'Service', link: '/reference/storage/' },
                        { text: 'storage-kit', link: '/reference/storage/storage-kit' },
                        { text: 'server-storage-kit', link: '/reference/storage/server-storage-kit' },
                    ],
                },
                {
                    text: 'Telemetry',
                    collapsed: false,
                    items: [
                        { text: 'Service', link: '/reference/telemetry/' },
                        { text: 'telemetry-kit', link: '/reference/telemetry/telemetry-kit' },
                        { text: 'server-telemetry-kit', link: '/reference/telemetry/server-telemetry-kit' },
                    ],
                },
                {
                    text: 'Messenger',
                    collapsed: false,
                    items: [
                        { text: 'Service', link: '/reference/messenger/' },
                        { text: 'messenger-kit', link: '/reference/messenger/messenger-kit' },
                        { text: 'server-realtime-kit', link: '/reference/messenger/server-realtime-kit' },
                    ],
                },
                {
                    text: 'Frontend',
                    collapsed: false,
                    items: [
                        { text: 'Application', link: '/reference/frontend/' },
                        { text: 'client-vue', link: '/reference/frontend/client-vue' },
                    ],
                },
            ],
        },
        socialLinks: [
            { icon: 'github', link: 'https://github.com/PrivateAIM/hub' },
        ],
        editLink: {
            pattern: 'https://github.com/PrivateAIM/hub/edit/master/docs/src/:path',
            text: 'Edit this page on GitHub',
        },
        footer: {
            message: 'Released under the Apache-2.0 License.',
            copyright: 'Copyright 2024-present PrivateAIM',
        },
    },
});
