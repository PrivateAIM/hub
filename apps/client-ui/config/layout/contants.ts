/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NavigationItem } from '@vuecs/navigation';
import { PermissionName } from '@privateaim/kit';
import { PermissionName as AuthupPermissionName } from '@authup/core-kit';
import type { NavigationItemMeta } from './types';

export enum LayoutKey {
    NAVIGATION_ID = 'navigationId',

    REQUIRED_LOGGED_IN = 'requireLoggedIn',
    REQUIRED_LOGGED_OUT = 'requireLoggedOut',

    REQUIRED_PERMISSIONS = 'requirePermissions',
}

export enum LayoutNavigationID {
    ADMIN = 'admin',
    DEFAULT = 'default',
}

/**
 * Display labels of the top-level sections. The sidebar resolver matches
 * the active top item by name to pick the admin vs. default sidebar, so
 * the label is the single source of truth shared by both navs.
 */
export enum LayoutTopNavigationName {
    HOME = 'Home',
    ADMIN = 'Admin',
}

/**
 * Registry id under which the header's top `<VCNavItems registry>`
 * publishes its resolved active trail. The sidebar's `:data` resolver
 * reads this id (via the resolver context's `registry()` accessor) to
 * derive which sidebar to show — see components/layout/sidebar.vue.
 */
export const LayoutTopNavigationRegistryId = 'top';

/**
 * The top items are url-less section switchers: clicking one selects it
 * (the shared navigation registry republishes the active trail) instead
 * of navigating, which is what drives the sidebar. `activeMatch` keeps
 * the section highlighted — and the sidebar in sync — on a fresh load of
 * an `/admin/*` route, where there is no click to seed the selection.
 */
export const LayoutTopNavigation: NavigationItem<NavigationItemMeta>[] = [
    {
        name: LayoutTopNavigationName.HOME,
        icon: 'fa6-solid:house',
    },
    {
        name: LayoutTopNavigationName.ADMIN,
        icon: 'fa6-solid:gear',
        activeMatch: '/admin',
        meta: {
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [],
        },
    },
];
export const LayoutSideDefaultNavigation: NavigationItem<NavigationItemMeta>[] = [
    {
        name: 'Info',
        type: 'link',
        url: '/',
        icon: 'fa6-solid:info',
        meta: { [LayoutKey.REQUIRED_LOGGED_IN]: true },
    },
    {
        name: 'Projects',
        type: 'link',
        url: '/projects',
        icon: 'fa6-solid:diagram-project',
        meta: {
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.PROJECT_CREATE,
                PermissionName.PROJECT_DELETE,
                PermissionName.PROJECT_UPDATE,
                PermissionName.PROJECT_APPROVE,

                PermissionName.ANALYSIS_CREATE,
                PermissionName.ANALYSIS_DELETE,
                PermissionName.ANALYSIS_UPDATE,
                PermissionName.ANALYSIS_APPROVE,

                PermissionName.ANALYSIS_RESULT_READ,
                PermissionName.ANALYSIS_EXECUTION_START,
                PermissionName.ANALYSIS_EXECUTION_STOP,
            ],
        },
    },
    {
        name: 'Analyses',
        type: 'link',
        url: '/analyses',
        icon: 'fa6-solid:microscope',
        meta: {
            requireLoggedIn: true,
            requirePermissions: [
                PermissionName.ANALYSIS_CREATE,
                PermissionName.ANALYSIS_DELETE,
                PermissionName.ANALYSIS_UPDATE,
                PermissionName.ANALYSIS_APPROVE,

                PermissionName.ANALYSIS_EXECUTION_START,
                PermissionName.ANALYSIS_EXECUTION_STOP,
            ],
        },
    },
    {
        name: 'Others',
        type: 'separator',
    },
    {
        name: 'Login',
        type: 'link',
        url: '/login',
        icon: 'fa6-solid:right-to-bracket',
        meta: { [LayoutKey.REQUIRED_LOGGED_OUT]: true },
    },
    {
        name: 'Settings',
        type: 'link',
        url: '/settings',
        icon: 'fa6-solid:gear',
        meta: { [LayoutKey.REQUIRED_LOGGED_IN]: true },
    },
];
export const LayoutSideAdminNavigation: NavigationItem<NavigationItemMeta>[] = [
    {
        name: 'Auth',
        type: 'link',
        icon: 'fa6-solid:lock',
        meta: {
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                AuthupPermissionName.REALM_CREATE,
                AuthupPermissionName.REALM_UPDATE,
                AuthupPermissionName.REALM_DELETE,

                AuthupPermissionName.IDENTITY_PROVIDER_CREATE,
                AuthupPermissionName.IDENTITY_PROVIDER_UPDATE,
                AuthupPermissionName.IDENTITY_PROVIDER_DELETE,

                AuthupPermissionName.USER_CREATE,
                AuthupPermissionName.USER_UPDATE,
                AuthupPermissionName.USER_DELETE,

                AuthupPermissionName.ROLE_CREATE,
                AuthupPermissionName.ROLE_UPDATE,
                AuthupPermissionName.ROLE_DELETE,
                AuthupPermissionName.ROLE_PERMISSION_CREATE,
                AuthupPermissionName.ROLE_PERMISSION_DELETE,

                AuthupPermissionName.PERMISSION_CREATE,
                AuthupPermissionName.PERMISSION_UPDATE,
                AuthupPermissionName.PERMISSION_DELETE,
            ],
        },
        children: [
            {
                name: 'Realms',
                type: 'link',
                url: '/admin/realms',
                icon: 'fa6-solid:building-columns',
                meta: {
                    [LayoutKey.REQUIRED_LOGGED_IN]: true,
                    [LayoutKey.REQUIRED_PERMISSIONS]: [
                        AuthupPermissionName.REALM_CREATE,
                        AuthupPermissionName.REALM_UPDATE,
                        AuthupPermissionName.REALM_DELETE,

                        AuthupPermissionName.IDENTITY_PROVIDER_CREATE,
                        AuthupPermissionName.IDENTITY_PROVIDER_DELETE,
                    ],
                },
            },
            {
                name: 'Clients',
                type: 'link',
                url: '/admin/clients',
                icon: 'fa6-solid:ghost',
                meta: {
                    [LayoutKey.REQUIRED_LOGGED_IN]: true,
                    [LayoutKey.REQUIRED_PERMISSIONS]: [
                        AuthupPermissionName.CLIENT_READ,
                        AuthupPermissionName.CLIENT_CREATE,
                        AuthupPermissionName.CLIENT_UPDATE,
                        AuthupPermissionName.CLIENT_DELETE,
                    ],
                },
            },
            {
                name: 'Identity Providers',
                type: 'link',
                url: '/admin/identity-providers',
                icon: 'fa6-solid:atom',
                meta: {
                    [LayoutKey.REQUIRED_LOGGED_IN]: true,
                    [LayoutKey.REQUIRED_PERMISSIONS]: [
                        AuthupPermissionName.IDENTITY_PROVIDER_CREATE,
                        AuthupPermissionName.IDENTITY_PROVIDER_UPDATE,
                        AuthupPermissionName.IDENTITY_PROVIDER_DELETE,
                    ],
                },
            },
            {
                name: 'Users',
                type: 'link',
                url: '/admin/users',
                icon: 'fa6-solid:user',
                meta: {
                    [LayoutKey.REQUIRED_LOGGED_IN]: true,
                    [LayoutKey.REQUIRED_PERMISSIONS]: [
                        AuthupPermissionName.USER_CREATE,
                        AuthupPermissionName.USER_UPDATE,
                        AuthupPermissionName.USER_DELETE,
                    ],
                },
            },
            {
                name: 'Roles',
                type: 'link',
                url: '/admin/roles',
                icon: 'fa6-solid:users',
                meta: {
                    [LayoutKey.REQUIRED_LOGGED_IN]: true,
                    [LayoutKey.REQUIRED_PERMISSIONS]: [
                        AuthupPermissionName.ROLE_CREATE,
                        AuthupPermissionName.ROLE_UPDATE,
                        AuthupPermissionName.ROLE_DELETE,

                        AuthupPermissionName.ROLE_PERMISSION_CREATE,
                        AuthupPermissionName.ROLE_PERMISSION_DELETE,
                    ],
                },
            },
            {
                name: 'Policies',
                type: 'link',
                url: '/admin/policies',
                icon: 'fa6-solid:scale-balanced',
                meta: {
                    [LayoutKey.REQUIRED_LOGGED_IN]: true,
                    [LayoutKey.REQUIRED_PERMISSIONS]: [
                        AuthupPermissionName.PERMISSION_READ,
                        AuthupPermissionName.PERMISSION_CREATE,
                        AuthupPermissionName.PERMISSION_UPDATE,
                        AuthupPermissionName.PERMISSION_DELETE,
                    ],
                },
            },
            {
                name: 'Permissions',
                type: 'link',
                url: '/admin/permissions',
                icon: 'fa6-solid:key',
                meta: {
                    [LayoutKey.REQUIRED_LOGGED_IN]: true,
                    [LayoutKey.REQUIRED_PERMISSIONS]: [
                        AuthupPermissionName.PERMISSION_CREATE,
                        AuthupPermissionName.PERMISSION_UPDATE,
                        AuthupPermissionName.PERMISSION_DELETE,
                    ],
                },
            },
        ],
    },
    {
        name: 'General',
        type: 'link',
        icon: 'fa6-solid:globe',
        meta: {
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.NODE_CREATE,
                PermissionName.NODE_DELETE,
                PermissionName.NODE_UPDATE,

                PermissionName.SERVICE_MANAGE,
            ],
        },
        children: [
            {
                name: 'Events',
                type: 'link',
                url: '/admin/events',
                icon: 'fa6-solid:bullhorn',
                meta: {
                    [LayoutKey.REQUIRED_LOGGED_IN]: true,
                    [LayoutKey.REQUIRED_PERMISSIONS]: [
                        PermissionName.EVENT_DELETE,
                        PermissionName.EVENT_READ,
                    ],
                },
            },
            {
                name: 'Nodes',
                type: 'link',
                url: '/admin/nodes',
                icon: 'fa6-solid:server',
                meta: {
                    [LayoutKey.REQUIRED_LOGGED_IN]: true,
                    [LayoutKey.REQUIRED_PERMISSIONS]: [
                        PermissionName.NODE_CREATE,
                        PermissionName.NODE_DELETE,
                        PermissionName.NODE_UPDATE,
                    ],
                },
            },
            {
                name: 'Services',
                type: 'link',
                url: '/admin/services',
                icon: 'fa6-solid:signs-post',
                meta: {
                    [LayoutKey.REQUIRED_LOGGED_IN]: true,
                    [LayoutKey.REQUIRED_PERMISSIONS]: [
                        PermissionName.SERVICE_MANAGE,
                    ],
                },
            },
        ],
    },

];
