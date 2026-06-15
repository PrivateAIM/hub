<script lang="ts">
import { injectHTTPClient } from '@authup/client-web-kit';
import type { Policy } from '@authup/core-kit';
import { PermissionName as AuthupPermissionName } from '@authup/core-kit';
import { FDisplayName } from '@privateaim/client-vue';
import { computed, defineComponent, ref } from 'vue';
import type { Ref } from 'vue';
import type { NavigationItem } from '@vuecs/navigation';
import { useRoute } from 'vue-router';
import { createError, definePageMeta, navigateTo } from '#imports';
import { useToast } from '../../../composables/toast';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';
import { updateObjectProperties } from '../../../utils';

export default defineComponent({
    components: { FDisplayName },
    async setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                AuthupPermissionName.PERMISSION_UPDATE,
            ],
        });

        const toast = useToast();
        const route = useRoute();

        const entity : Ref<Policy> = ref(null) as any;

        try {
            entity.value = await injectHTTPClient()
                .policy
                .getOne(route.params.id as string);
        } catch {
            await navigateTo({ path: '/admin/policies' });
            throw createError({});
        }

        const items = computed<NavigationItem[]>(() => {
            const base = `/admin/policies/${entity.value?.id}`;
            return [
                {
                    name: '', 
                    icon: 'fa6-solid:arrow-left', 
                    url: '/admin/policies', 
                },
                {
                    name: 'General', 
                    icon: 'fa6-solid:bars', 
                    url: base, 
                },
            ];
        });

        const handleUpdated = (e: Policy) => {
            if (toast) {
                toast.show({ variant: 'success', body: 'The policy was successfully updated.' });
            }

            updateObjectProperties(entity, e);
        };

        const handleFailed = (e: Error) => {
            if (toast) {
                toast.show({ variant: 'warning', body: e.message });
            }
        };

        return {
            items,
            entity,
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
                name="fa6-solid:scale-balanced"
                class="me-1"
            />
            <FDisplayName
                :name="entity.name"
                :display-name="entity.display_name"
            />
            <span class="sub-title ms-1">
                Details
            </span>
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
