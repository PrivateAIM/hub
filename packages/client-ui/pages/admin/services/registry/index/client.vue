<!--
  - Copyright (c) 2021-2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { AClientForm, injectHTTPClient } from '@authup/client-web-kit';
import type { Client } from '@authup/core-kit';
import { h, ref } from 'vue';
import { ServiceID } from '@privateaim/core-kit';
import { useToast } from '#imports';
import { createError, defineNuxtComponent, navigateTo } from '#app';
import { updateObjectProperties } from '../../../../../utils';

export default defineNuxtComponent({
    async setup() {
        const toast = useToast();

        const entity = ref<Client | null>(null);

        try {
            const response = await injectHTTPClient().client.getMany({
                filter: {
                    name: ServiceID.REGISTRY,
                },
                fields: ['+secret'],
            });

            const client = response.data.pop();
            if (!client) {
                throw new Error('The client was not found.');
            }

            entity.value = client;
        } catch (e) {
            await navigateTo({ path: '/admin/services' });
            throw createError({});
        }

        const handleUpdated = (item: Client) => {
            if (entity.value) {
                updateObjectProperties(entity.value, item);
            }

            toast.show({ variant: 'success', body: 'The robot was successfully updated.' });
        };

        return () => h(AClientForm, {
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
