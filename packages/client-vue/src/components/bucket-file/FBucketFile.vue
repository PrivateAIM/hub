<!--
  - Copyright (c) 2021-2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { inject } from '@authup/client-web-kit';
import { VCFormInputCheckbox } from '@vuecs/form-controls';
import type { PropType, Ref } from 'vue';
import {
    computed,
    defineComponent,
    ref,
    watch,
} from 'vue';
import type { BucketFile } from '@privateaim/storage-kit';
import { injectStorageHTTPClient } from '../../core';
import { FBucketFileDownload } from './FBucketFileDownload';

export default defineComponent({
    components: { FBucketFileDownload, VCFormInputCheckbox },
    props: {
        entity: {
            type: Object as PropType<BucketFile>,
        },
        entityId: {
            type: String,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['toggle', 'deleted', 'failed'],
    setup(props, { emit, expose }) {
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

        expose({
            data: data.value,
            delete: drop,
        });

        const isActive = ref(false);

        const files = inject<Ref<string[]>>('files');
        const isInFileList = computed(() => {
            if (!data.value || !files) {
                return false;
            }

            return files.value.findIndex(
                (file) => file === data.value!.id,
            ) !== -1;
        });

        watch(isInFileList, (val, oldValue) => {
            if (val === oldValue) {
                return;
            }

            setTimeout(() => {
                isActive.value = val;
            });
        });

        const toggleIsActive = () => {
            isActive.value = !isActive.value;
            emit('toggle', data.value);
        };

        return {
            data,

            drop,
            busy,
            resolved,

            toggleIsActive,
            isActive,

            isInFileList,
        };
    },
});
</script>
<template>
    <div
        class="bucket-file d-flex flex-row align-items-center gap-1 p-2"
        :class="{'checked': isActive}"
    >
        <div class="d-flex align-items-center">
            <VCFormInputCheckbox
                :model-value="isActive"
                @change="toggleIsActive"
            />
        </div>
        <div
            class="d-flex align-items-center bucket-file-text"
            @click.prevent="toggleIsActive"
        >
            <span>
                <template v-if="data">
                    {{ data.name }}
                </template>
                <template v-else>
                    ...
                </template>
            </span>
        </div>
        <template v-if="data">
            <div class="bucket-file-size">
                {{ data.size }} Bytes
            </div>
        </template>
        <template v-if="data">
            <div class="ms-auto d-flex flex-row gap-1">
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
<style scoped>
.bucket-file {
    display: flex;
    align-items: center;
}

.bucket-file.checked {
    background: #c5d7e7;
}

.form-check-input {
    margin-top: -2px;
}

.bucket-file-text {
    font-weight: bold;
}

.bucket-file-size {
    font-size: 0.75rem;
}

.bucket-file-text {
    cursor: pointer;
    font-size: 0.85rem;
    line-height: 0.85rem;
}
</style>
