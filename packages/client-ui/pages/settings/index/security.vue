<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { storeToRefs } from 'pinia';
import { AUserPasswordForm, useStore } from '@authup/client-web-kit';
import { definePageMeta, useToast } from '#imports';
import { defineNuxtComponent } from '#app';
import { LayoutKey } from '~/config/layout';

export default defineNuxtComponent({
    components: {
        AUserPasswordForm,
    },
    setup() {
        definePageMeta({
            [LayoutKey.REQUIRED_LOGGED_IN]: true,
        });

        const toast = useToast();

        const store = useStore();
        const { userId } = storeToRefs(store);

        const handleUpdated = () => {
            toast.show({ variant: 'success', body: 'The account was successfully updated.' });
        };

        const handleFailed = (e: Error) => {
            toast.show({ variant: 'warning', body: e.message });
        };

        return {
            id: userId,
            handleUpdated,
            handleFailed,
        };
    },
});
</script>
<template>
    <div>
        <h6 class="title">
            Password
        </h6>
        <AUserPasswordForm
            :id="id"
            @updated="handleUpdated"
            @failed="handleFailed"
        />
    </div>
</template>
