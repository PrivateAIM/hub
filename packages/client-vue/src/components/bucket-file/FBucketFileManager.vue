<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { BModal } from 'bootstrap-vue-next';
import {
    computed,
    defineComponent,
    ref,
    useTemplateRef,
} from 'vue';
import type { BuildInput } from 'rapiq';
import type { BucketFile } from '@privateaim/storage-kit';
import { injectStorageHTTPClient, wrapFnWithBusyState } from '../../core';
import FBucketFile from './FBucketFile.vue';
import FBucketFilesUpload from './FBucketFilesUpload.vue';
import FBucketFiles from './FBucketFiles.vue';

export default defineComponent({
    components: {
        FBucketFiles,
        BModal,
        FBucketFilesUpload,
        FBucketFile,
    },
    props: {
        entityId: {
            type: String,
            required: true,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['created', 'updated', 'deleted', 'uploaded', 'failed'],
    setup(props, { emit, expose }) {
        const storageClient = injectStorageHTTPClient();

        const modal = ref(false);
        const toggleModal = () => {
            modal.value = !modal.value;
        };

        const add = () => toggleModal();

        expose({
            add,
        });

        const selected = ref<string[]>([]);
        const selectAll = ref<boolean>(false);
        const busy = ref<boolean>(false);

        const vNode = useTemplateRef<typeof FBucketFiles>('bucketFiles');
        const query = computed<BuildInput<BucketFile>>(() => ({
            filters: {
                bucket_id: props.entityId,
            },
        }));

        const handleCreated = (entity: BucketFile) => {
            emit('created', entity);
        };

        const handleDeleted = (entity: BucketFile) => {
            const selectedIndex = selected.value.indexOf(entity.id);
            if (selectedIndex !== -1) {
                selected.value.splice(selectedIndex, 1);
            }

            emit('deleted', entity);
        };

        const handleUpdated = (entity: BucketFile) => {
            emit('updated', entity);
        };

        const handleFailed = (e: Error) => {
            emit('failed', e);
        };

        const handleUploaded = () => {
            emit('uploaded');

            toggleModal();
        };

        const dropSelected = wrapFnWithBusyState(busy, async () => {
            if (selected.value.length === 0) return;

            try {
                for (let i = 0; i < selected.value.length; i++) {
                    const file = await storageClient.bucketFile.delete(selected.value[i]);
                    handleDeleted(file);
                }
            } catch (e) {
                if (e instanceof Error) {
                    emit('failed', e);
                }
            }
        });

        const selectAllFiles = () => {
            if (selectAll.value) {
                if (vNode.value) {
                    selected.value = (vNode.value.data as unknown as BucketFile[])
                        .map((file) => file.id);
                }
            } else {
                selected.value = [];
            }
        };

        const toggleFile = (file: BucketFile) => {
            const index = selected.value.findIndex((el) => el === file.id);
            if (index === -1) {
                selected.value.push(file.id);
            } else {
                selected.value.splice(index, 1);
            }
        };

        return {
            busy,

            selected,
            selectAll,
            dropSelected,
            selectAllFiles,

            handleCreated,
            handleDeleted,
            handleUpdated,
            handleFailed,
            handleUploaded,

            toggleFile,

            query,

            modal,
            toggleModal,
        };
    },
});
</script>
<template>
    <div>
        <div class="d-flex flex-column gap-1">
            <template v-if="!readonly">
                <div class="form-check mb-0">
                    <input
                        id="selectAllFiles"
                        v-model="selectAll"
                        type="checkbox"
                        class="form-check-input"
                        @change="selectAllFiles"
                    >
                    <label for="selectAllFiles">Select all</label>
                </div>
            </template>

            <FBucketFiles
                ref="bucketFiles"
                :query="query"
            >
                <template #body="{ data, resolved }">
                    <template v-if="resolved && data.length === 0">
                        <div class="d-flex flex-column gap-1">
                            <div>
                                No files in bucket.
                            </div>
                            <template v-if="!readonly">
                                <div>
                                    <button
                                        type="button"
                                        class="btn btn-xs btn-dark"
                                        @click.prevent="toggleModal"
                                    >
                                        <i class="fa fa-add" /> Add
                                    </button>
                                </div>
                            </template>
                        </div>
                    </template>
                    <template v-else>
                        <div class="d-flex flex-column">
                            <template
                                v-for="file in data"
                                :key="file.id"
                            >
                                <FBucketFile
                                    :readonly="readonly"
                                    class="me-1"
                                    :entity="file"
                                    :files-selected="selected"
                                    @check="toggleFile"
                                >
                                    <template #actions="actionProps">
                                        <slot
                                            name="itemActions"
                                            v-bind="actionProps"
                                        />
                                    </template>
                                </FBucketFile>
                            </template>
                        </div>
                    </template>
                </template>
            </FBucketFiles>

            <template v-if="!readonly">
                <div>
                    <button
                        type="button"
                        class="btn btn-warning btn-xs"
                        :disabled="busy || selected.length === 0"
                        @click.prevent="dropSelected"
                    >
                        <i class="fa fa-trash" /> Delete
                    </button>
                </div>
            </template>
        </div>
        <div>
            <BModal
                v-model="modal"
                :no-footer="true"
                :size="'lg'"
            >
                <template #header="props">
                    <div class="d-flex flex-row w-100">
                        <div>
                            <h5 class="mb-0">
                                <i class="fa fa-upload" /> Upload
                            </h5>
                        </div>
                        <div class="ms-auto">
                            <button
                                type="button"
                                class="btn btn-xs btn-secondary"
                                @click.prevent="props.close()"
                            >
                                <i class="fa fa-times" />
                            </button>
                        </div>
                    </div>
                </template>

                <FBucketFilesUpload
                    :bucket-id="entityId"
                    @uploaded="handleUploaded"
                    @failed="handleFailed"
                />
            </BModal>
        </div>
    </div>
</template>
