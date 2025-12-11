<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import type { PropType } from 'vue';
import {
    computed,
    defineComponent,
    ref,
} from 'vue';
import type { BucketFile } from '@privateaim/storage-kit';
import { injectStorageHTTPClient } from '../../core';
import { FBucketFileDownload } from './FBucketFileDownload';

export default defineComponent({
    components: { FBucketFileDownload },
    props: {
        entity: {
            type: Object as PropType<BucketFile>,
        },
        entityId: {
            type: String,
        },
        filesSelected: {
            type: Array,
            required: true,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['check', 'deleted', 'failed'],
    setup(props, { emit }) {
        const storage = injectStorageHTTPClient();

        const data = ref<BucketFile | null>(null);

        const resolved = ref(false);
        const busy = ref(false);

        const resolve = async () => {
            busy.value = true;

            try {
                if (props.entity) {
                    data.value = props.entity;
                    return;
                }

                if (props.entityId) {
                    data.value = await storage.bucketFile.getOne(props.entityId);
                }
            } catch (e) {
                emit('failed', e);
            } finally {
                busy.value = false;
                resolved.value = true;
            }
        };

        Promise.resolve()
            .then(() => resolve());

        const drop = async () => {
            if (busy.value || !data.value) return;

            try {
                await storage.bucketFile.delete(data.value.id);

                emit('deleted', data.value);
            } catch (e) {
                emit('failed', e);
            } finally {
                busy.value = false;
            }
        };

        const marked = computed(() => {
            if (!props.filesSelected || !data.value) {
                return false;
            }

            return props.filesSelected.findIndex(
                (file) => file === data.value!.id,
            ) !== -1;
        });

        const mark = () => {
            if (!data.value) {
                return;
            }

            emit('check', data.value);
        };

        return {
            data,

            drop,
            busy,
            resolved,

            mark,
            marked,
        };
    },
});
</script>
<template>
    <div
        class="card card-file d-flex flex-row align-items-center p-1"
        :class="{'checked': marked}"
    >
        <div
            class="card-heading align-items-center d-flex flex-row"
            @click.prevent="mark"
        >
            <span class="title">
                <template v-if="data">
                    {{ data.name }}
                </template>
                <template v-else>
                    ...
                </template>
            </span>
        </div>
        <template v-if="data">
            <div class="ms-auto d-flex flex-row gap-2">
                <slot
                    name="actions"
                    v-bind="{ data }"
                >
                    <div>
                        <FBucketFileDownload
                            :with-text="false"
                            :with-icon="true"
                            :entity="data"
                        />
                    </div>
                    <template v-if="!readonly">
                        <div>
                            <button
                                v-b-tooltip.hover.top
                                title="Delete"
                                type="button"
                                class="btn btn-danger btn-xs"
                                :disabled="busy"
                                @click.prevent="drop"
                            >
                                <i class="fa fa-trash" />
                            </button>
                        </div>
                    </template>
                </slot>
            </div>
        </template>
    </div>
</template>
