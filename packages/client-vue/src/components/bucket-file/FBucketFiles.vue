<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type {
    BucketFile,
} from '@privateaim/storage-kit';
import type { BuildInput } from 'rapiq';
import type { PropType } from 'vue';
import {
    defineComponent,
    ref,
} from 'vue';
import type { ListMeta } from '../../core';
import { injectStorageHTTPClient } from '../../core';

export default defineComponent({
    props: {
        query: {
            type: Object as PropType<BuildInput<BucketFile>>,
        },
    },
    setup(props) {
        const httpClient = injectStorageHTTPClient();

        const meta = ref<ListMeta<BucketFile>>({
            pagination: {
                limit: 50,
                offset: 0,
            },
        });
        const busy = ref(false);
        const resolved = ref(false);

        const data = ref<BucketFile[]>([]);

        const resolve = async (query?: BuildInput<BucketFile>) => {
            busy.value = true;

            const response = await httpClient.bucketFile.getMany(query);

            data.value = response.data;
            meta.value = {
                ...meta.value,
                pagination: {
                    ...meta.value.pagination,
                    ...response.meta,
                },
            };

            busy.value = false;
            resolved.value = true;
        };

        const load = (input: ListMeta<BucketFile>) => resolve({
            ...props.query,
            pagination: {
                ...(props.query?.pagination || {}),
                ...(input.pagination || {}),
            },
            filters: {
                ...(props.query?.filters || {}),
                ...(input.filters || {}),
            },
        });

        const handleDeleted = (input: BucketFile) => {
            const index = data.value.findIndex((el) => el.id === input.id);
            if (index !== -1) {
                data.value.splice(index, 1);
            }
        };

        Promise.resolve()
            .then(() => resolve(props.query));

        return {
            handleDeleted,
            busy,
            data,
            meta,
            load,
            resolved,
        };
    },
});
</script>
<template>
    <div class="d-flex flex-column gap-1">
        <slot name="default">
            <slot
                name="header"
                v-bind="{ resolved, busy, data, meta, load, deleted: handleDeleted }"
            />
            <slot
                name="body"
                v-bind="{ resolved, busy, data, meta, load, deleted: handleDeleted }"
            >
                <div class="d-flex flex-column gap-2">
                    <template
                        v-for="(item, key) in data"
                        :key="key"
                    >
                        {{ item.name }}
                    </template>
                </div>
            </slot>
            <slot
                name="footer"
                v-bind="{ resolved, busy, data, meta, load, deleted: handleDeleted }"
            />
        </slot>
    </div>
</template>
