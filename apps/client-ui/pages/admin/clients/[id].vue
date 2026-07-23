<script lang="ts">
import { injectHTTPClient } from '@authup/client-web-kit';
import type { Client } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';
import { FDisplayName } from '@privateaim/client-vue';
import { extendObject } from '@authup/kit';
import { VCIcon } from '@vuecs/icon';
import type { NavigationItem } from '@vuecs/navigation';
import { type Ref, defineComponent } from 'vue';
import { computed, ref } from 'vue';
import {
    createError,
    definePageMeta,
    navigateTo,
    useRoute,
    useToast,
} from '#imports';
import { LayoutKey } from '../../../config/layout';

export default defineComponent({
    components: { FDisplayName, VCIcon },
    async setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.CLIENT_UPDATE,
            ],
        });

        const toast = useToast();
        const route = useRoute();

        const entity: Ref<Client> = ref(null) as any;

        try {
            entity.value = await injectHTTPClient()
                .client
                .getOne(route.params.id as string, { fields: ['+secret'] });
        } catch {
            await navigateTo({ path: '/admin/clients' });
            throw createError({});
        }

        const items = computed<NavigationItem[]>(() => {
            const base = `/admin/clients/${entity.value?.id}`;
            return [
                {
                    name: '', 
                    icon: 'fa6-solid:arrow-left', 
                    url: '/admin/clients', 
                },
                {
                    name: 'General', 
                    icon: 'fa6-solid:bars', 
                    url: base, 
                },
                {
                    name: 'Scopes', 
                    icon: 'fa6-solid:meteor', 
                    url: `${base}/scopes`, 
                },
                {
                    name: 'URL', 
                    icon: 'fa6-solid:link', 
                    url: `${base}/url`, 
                },
                {
                    name: 'Permissions', 
                    icon: 'fa6-solid:user-secret', 
                    url: `${base}/permissions`, 
                },
                {
                    name: 'Roles', 
                    icon: 'fa6-solid:user-group', 
                    url: `${base}/roles`, 
                },
            ];
        });

        const handleUpdated = (e: Client) => {
            if (toast) {
                toast.show({ variant: 'success', body: 'The client was successfully updated.' });
            }

            extendObject(entity.value, e);
        };

        const handleFailed = (e: Error) => {
            if (toast) {
                toast.show({ variant: 'success', body: e.message });
            }
        };

        return {
            entity,
            items,
            handleUpdated,
            handleFailed,
        };
    },
});
</script>
<template>
    <div>
        <h1 class="title no-border mb-3">
            <VCIcon
                name="fa6-solid:ghost"
                class="me-1"
            /> <FDisplayName
                :name="entity.name"
                :display-name="entity.displayName"
            />
            <span class="sub-title ms-1">Details</span>
        </h1>
        <div class="mb-2">
            <VCNavItems
                :data="items"
                variant="pills"
            />
        </div>
        <div>
            <NuxtPage
                :entity="entity"
                @updated="handleUpdated"
                @failed="handleFailed"
            />
        </div>
    </div>
</template>
