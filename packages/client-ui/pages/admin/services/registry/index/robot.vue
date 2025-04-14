<!--
  - Copyright (c) 2021-2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { ARobotForm, injectHTTPClient } from '@authup/client-web-kit';
import type { Robot } from '@authup/core-kit';
import { h, ref } from 'vue';
import { ServiceID } from '@privateaim/core-kit';
import { useToast } from '#imports';
import { createError, defineNuxtComponent, navigateTo } from '#app';
import { updateObjectProperties } from '../../../../../utils';

export default defineNuxtComponent({
    async setup() {
        const toast = useToast();

        const entity = ref<Robot | null>(null);

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

            entity.value = robot;
        } catch (e) {
            await navigateTo({ path: '/admin/services' });
            throw createError({});
        }

        const handleUpdated = (item: Robot) => {
            if (entity.value) {
                updateObjectProperties(entity.value, item);
            }

            toast.show({ variant: 'success', body: 'The robot was successfully updated.' });
        };

        return () => h(ARobotForm, {
            name: ServiceID.REGISTRY,
            realmId: entity.value?.realm_id,
            entity: entity.value,
            onUpdated: (item) => {
                handleUpdated(item);
            },
        });
    },
});
</script>
