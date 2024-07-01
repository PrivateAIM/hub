/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { NavigationItem } from '@vuecs/navigation';
import { PermissionName } from '@privateaim/kit';
import { PermissionName as AuthupPermissionName } from '@authup/core-kit';

export enum LayoutKey {
    NAVIGATION_ID = 'navigationId',
    NAVIGATION_SIDE_ID = 'navigationSideId',

    REQUIRED_LOGGED_IN = 'requireLoggedIn',
    REQUIRED_LOGGED_OUT = 'requireLoggedOut',

    REQUIRED_PERMISSIONS = 'requirePermissions',
}

export enum LayoutNavigationID {
    ADMIN = 'admin',
    DEFAULT = 'default',
}

export const LayoutTopNavigation: NavigationItem[] = [
    {
        id: LayoutNavigationID.DEFAULT,
        name: 'Home',
        icon: 'fa fa-home',
    },
    {
        id: LayoutNavigationID.ADMIN,
        name: 'Admin',
        icon: 'fas fa-cog',
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [

        ],
    },
];
export const LayoutSideDefaultNavigation: NavigationItem[] = [
    {
        name: 'Info',
        type: 'link',
        url: '/',
        icon: 'fas fa-info',
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        rootLink: true,
    },
    {
        name: 'Projects',
        type: 'link',
        url: '/projects',
        icon: 'fas fa-tasks',
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
    {
        name: 'Analyses',
        type: 'link',
        url: '/analyses',
        icon: 'fa fa-bar-chart',
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
    {
        name: 'Others',
        type: 'separator',
    },
    {
        name: 'Login',
        type: 'link',
        url: '/login',
        icon: 'fas fa-sign',
        [LayoutKey.REQUIRED_LOGGED_OUT]: true,
    },
    {
        name: 'Settings',
        type: 'link',
        url: '/settings',
        icon: 'fas fa-cog',
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
    },
];
export const LayoutSideAdminNavigation: NavigationItem[] = [
    {
        name: 'Auth',
        type: 'link',
        icon: 'fas fa-lock',
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
        children: [
            {
                name: 'Realms',
                type: 'link',
                url: '/admin/realms',
                icon: 'fas fa-university',
                [LayoutKey.REQUIRED_LOGGED_IN]: true,
                [LayoutKey.REQUIRED_PERMISSIONS]: [
                    AuthupPermissionName.REALM_CREATE,
                    AuthupPermissionName.REALM_UPDATE,
                    AuthupPermissionName.REALM_DELETE,

                    AuthupPermissionName.IDENTITY_PROVIDER_CREATE,
                    AuthupPermissionName.IDENTITY_PROVIDER_DELETE,
                    PermissionName.PROJECT_UPDATE,
                ],
            },
            {
                name: 'Identity Providers',
                type: 'link',
                url: '/admin/identity-providers',
                icon: 'fas fa-atom',
                [LayoutKey.REQUIRED_LOGGED_IN]: true,
                [LayoutKey.REQUIRED_PERMISSIONS]: [
                    AuthupPermissionName.IDENTITY_PROVIDER_CREATE,
                    AuthupPermissionName.IDENTITY_PROVIDER_UPDATE,
                    AuthupPermissionName.IDENTITY_PROVIDER_DELETE,
                ],
            },
            {
                name: 'Robots',
                type: 'link',
                url: '/admin/robots',
                icon: 'fas fa-robot',
                [LayoutKey.REQUIRED_LOGGED_IN]: true,
                [LayoutKey.REQUIRED_PERMISSIONS]: [
                    AuthupPermissionName.ROBOT_CREATE,
                    AuthupPermissionName.ROBOT_UPDATE,
                    AuthupPermissionName.ROBOT_DELETE,
                ],
            },
            {
                name: 'Users',
                type: 'link',
                url: '/admin/users',
                icon: 'fas fa-user',
                [LayoutKey.REQUIRED_LOGGED_IN]: true,
                [LayoutKey.REQUIRED_PERMISSIONS]: [
                    AuthupPermissionName.USER_CREATE,
                    AuthupPermissionName.USER_UPDATE,
                    AuthupPermissionName.USER_DELETE,
                ],
            },
            {
                name: 'Roles',
                type: 'link',
                url: '/admin/roles',
                icon: 'fas fa-users',
                [LayoutKey.REQUIRED_LOGGED_IN]: true,
                [LayoutKey.REQUIRED_PERMISSIONS]: [
                    AuthupPermissionName.ROLE_CREATE,
                    AuthupPermissionName.ROLE_UPDATE,
                    AuthupPermissionName.ROLE_DELETE,

                    AuthupPermissionName.ROLE_PERMISSION_CREATE,
                    AuthupPermissionName.ROLE_PERMISSION_DELETE,
                ],
            },
            {
                name: 'Permissions',
                type: 'link',
                url: '/admin/permissions',
                icon: 'fas fa-key',
                [LayoutKey.REQUIRED_LOGGED_IN]: true,
                [LayoutKey.REQUIRED_PERMISSIONS]: [
                    AuthupPermissionName.PERMISSION_CREATE,
                    AuthupPermissionName.PERMISSION_UPDATE,
                    AuthupPermissionName.PERMISSION_DELETE,
                ],
            },
        ],
    },
    {
        name: 'General',
        type: 'link',
        icon: 'fas fa-globe',
        [LayoutKey.REQUIRED_LOGGED_IN]: true,
        [LayoutKey.REQUIRED_PERMISSIONS]: [
            PermissionName.NODE_CREATE,
            PermissionName.NODE_DELETE,
            PermissionName.NODE_UPDATE,

            PermissionName.SERVICE_MANAGE,
        ],
        children: [
            {
                name: 'Nodes',
                type: 'link',
                url: '/admin/nodes',
                icon: 'fa-solid fa-server',
                [LayoutKey.REQUIRED_LOGGED_IN]: true,
                [LayoutKey.REQUIRED_PERMISSIONS]: [
                    PermissionName.NODE_CREATE,
                    PermissionName.NODE_DELETE,
                    PermissionName.NODE_UPDATE,
                ],
            },
            {
                name: 'Services',
                type: 'link',
                url: '/admin/services',
                icon: 'fa fa-map-signs',
                [LayoutKey.REQUIRED_LOGGED_IN]: true,
                [LayoutKey.REQUIRED_PERMISSIONS]: [
                    PermissionName.SERVICE_MANAGE,
                ],
            },
        ],
    },

];
