<script lang="ts">
import { injectHTTPClient } from '@authup/client-web-kit';
import type { Policy } from '@authup/core-kit';
import { PermissionName as AuthupPermissionName } from '@authup/core-kit';
import { defineComponent, ref } from 'vue';
import type { Ref } from 'vue';
import { useRoute } from 'vue-router';
import { createError, definePageMeta, navigateTo } from '#imports';
import { useToast } from '../../../composables/toast';
import { LayoutKey, LayoutNavigationID } from '../../../config/layout';
import { updateObjectProperties } from '../../../utils';

export default defineComponent({
    async setup() {
        definePageMeta({
            [LayoutKey.NAVIGATION_ID]: LayoutNavigationID.ADMIN,
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                AuthupPermissionName.PERMISSION_UPDATE,
            ],
        });

        const items = [
            {
                name: 'General',
                icon: 'fas fa-bars',
                path: '',
            },
        ];

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
            <i class="fa fa-balance-scale me-1" />
            {{ entity.name }}
            <span class="sub-title ms-1">
                Details
            </span>
        </h1>
        <div class="mb-2">
            <DomainEntityNav
                :items="items"
                :path="`/admin/policies/${entity.id}`"
                :prev-link="true"
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
