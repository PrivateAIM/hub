<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { ARobotForm, injectHTTPClient, useStore } from '@authup/client-web-kit';
import type { Robot } from '@authup/core-kit';
import { storeToRefs } from 'pinia';
import type { Ref } from 'vue';
import { h, ref } from 'vue';
import { ServiceID } from '@privateaim/core';
import { useToast } from '#imports';
import { createError, defineNuxtComponent, navigateTo } from '#app';
import { updateObjectProperties } from '../../../../utils';

export default defineNuxtComponent({
    async setup() {
        const toast = useToast();

        let entity : Ref<Robot>;

        try {
            const response = await injectHTTPClient().robot.getMany({
                filter: {
                    name: ServiceID.REGISTRY,
                },
                fields: ['+secret'],
            });

            const robot = response.data.pop();
            if (!robot) {
                throw new Error('The robot was not found.');
            }

            entity = ref(robot);
        } catch (e) {
            await navigateTo({ path: '/admin/services' });
            throw createError({});
        }

        const handleUpdated = (item: Robot) => {
            updateObjectProperties(entity, item);

            toast.show({ variant: 'success', body: 'The robot was successfully updated.' });
        };

        const store = useStore();
        const { realmId } = storeToRefs(store);

        return () => h(ARobotForm, {
            name: ServiceID.REGISTRY,
            realmId: realmId.value,
            entity: entity.value,
            onUpdated(item) {
                handleUpdated(item);
            },
        });
    },
});
</script>
