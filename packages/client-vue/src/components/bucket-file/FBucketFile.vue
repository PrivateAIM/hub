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
            required: true,
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

        const busy = ref(false);
        const drop = async () => {
            if (busy.value) return;

            try {
                await storage.bucketFile.delete(props.entity.id);

                emit('deleted', props.entity);
            } catch (e) {
                emit('failed', e);
            } finally {
                busy.value = false;
            }
        };

        const marked = computed(() => {
            if (!props.filesSelected) {
                return false;
            }

            return props.filesSelected.findIndex((file) => props.entity && file === props.entity.id) !== -1;
        });

        const mark = () => {
            emit('check', props.entity);
        };

        return {
            drop,
            busy,

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
                {{ entity.name }}
            </span>
        </div>
        <div class="ms-auto d-flex flex-row gap-2">
            <slot
                name="actions"
                v-bind="{ data: entity }"
            >
                <div>
                    <FBucketFileDownload
                        :with-text="false"
                        :with-icon="true"
                        :entity="entity"
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
    </div>
</template>
