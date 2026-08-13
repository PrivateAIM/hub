<script lang="ts">
import { defineComponent, ref } from 'vue';
import { APolicyForm, APolicyTypePicker } from '@authup/client-web-kit';
import type { Policy } from '@authup/core-kit';
import { PermissionName } from '@authup/core-kit';
import { navigateTo } from '#app';
import { definePageMeta } from '#imports';
import { LayoutKey } from '../../../../config/layout';

export default defineComponent({
    components: {
        APolicyForm,
        APolicyTypePicker,
    },
    emits: ['failed'],
    setup(props, { emit }) {
        // This route carried NO page meta at all — neither a login requirement
        // nor a permission — while every sibling add page guards itself.
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
            [LayoutKey.REQUIRED_PERMISSIONS]: [
                PermissionName.PERMISSION_CREATE,
            ],
        });

        const type = ref<string | null>(null);
        const handlePicked = (value: string) => {
            type.value = value;
        };

        const handleCreated = (e: Policy) => {
            navigateTo({ path: `/admin/policies/${e.id}` });
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        return {
            handleCreated,
            handleFailed,
            handlePicked,
            type,
        };
    },
});
</script>
<template>
    <div class="flex flex-col gap-2">
        <APolicyTypePicker @pick="handlePicked" />

        <template v-if="type">
            <APolicyForm
                :type="type"
                @failed="handleFailed"
                @created="handleCreated"
            />
        </template>
    </div>
</template>
