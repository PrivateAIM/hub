<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { AIdentityProviderForm, injectStore, storeToRefs } from '@authup/client-web-kit';
import type { IdentityProvider } from '@authup/core-kit';
import { IdentityProviderProtocol, PermissionName } from '@authup/core-kit';
import { ref } from 'vue';
import { defineNuxtComponent, navigateTo } from '#app';
import { definePageMeta } from '#imports';
import { LayoutKey, LayoutNavigationID } from '../../../../config/layout';

export default defineNuxtComponent({
    components: {
        AIdentityProviderForm,
    },
    emits: ['failed', 'created'],
    setup(props, { emit }) {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.IDENTITY_PROVIDER_CREATE,
            ],
        });

        const handleCreated = (e: IdentityProvider) => {
            navigateTo({ path: `/admin/identity-providers/${e.id}` });
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const protocol = ref<null | string>(null);

        const options = [
            { id: IdentityProviderProtocol.OAUTH2, value: 'OAuth2' },
            { id: IdentityProviderProtocol.OIDC, value: 'OIDC' },
            { id: IdentityProviderProtocol.LDAP, value: 'LDAP' },
        ];

        const store = injectStore();
        const { realmManagementId } = storeToRefs(store);

        return {
            options,
            protocol,
            realmManagementId,
            handleCreated,
            handleFailed,
        };
    },
});
</script>
<template>
    <div>
        <AIdentityProviderForm
            @created="handleCreated"
            @failed="handleFailed"
        />
    </div>
</template>
