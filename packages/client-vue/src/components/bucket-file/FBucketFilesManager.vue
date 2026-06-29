<!--
  - Copyright (c) 2024.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { provide } from '@authup/client-web-kit';
import { VCButton } from '@vuecs/button';
import { VCAlert } from '@vuecs/elements';
import { VCFormCheckbox } from '@vuecs/forms';
import { VCIcon } from '@vuecs/icon';
import {
    computed,
    defineComponent,
    ref,
    useTemplateRef,
    watch,
} from 'vue';
import type { BuildInput } from 'rapiq';
import type { BucketFile } from '@privateaim/storage-kit';
import { wrapFnWithBusyState } from '../../core';
import FBucketFile from './FBucketFile.vue';
import FBucketFilesUpload from './FBucketFilesUpload.vue';
import FBucketFiles from './FBucketFiles.vue';

export default defineComponent({
    components: {
        FBucketFiles,
        FBucketFilesUpload,
        FBucketFile,
        VCAlert,
        VCButton,
        VCFormCheckbox,
        VCIcon,
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
        const modal = ref(false);
        const toggleModal = () => {
            modal.value = !modal.value;
        };

        const add = () => toggleModal();

        expose({ add });

        const selected = ref<string[]>([]);
        const allSelected = ref<boolean>(false);
        const busy = ref<boolean>(false);

        provide('files', selected);

        const vNode = useTemplateRef<typeof FBucketFiles>('bucketFiles');
        const query = computed<BuildInput<BucketFile>>(() => ({ filters: { bucket_id: props.entityId } }));

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

        const handleUploaded = (files: BucketFile[]) => {
            emit('uploaded', files);

            toggleModal();

            if (!vNode.value) {
                return;
            }

            for (const file of files) {
                vNode.value.handleCreated(file);
            }
        };

        const selectAll = () => {
            if (!vNode.value) return;

            const ids = (vNode.value.data as unknown as BucketFile[])
                .map((file) => file.id);

            selected.value.push(...ids);
        };

        const unselectAll = () => {
            selected.value.splice(0, selected.value.length);
        };

        const dropSelected = wrapFnWithBusyState(busy, async () => {
            if (selected.value.length === 0 || !vNode.value) return;

            const promises = selected.value.map((item) => vNode.value!.delete(item));

            try {
                await Promise.all(promises);
            } catch (e) {
                emit('failed', e);
            } finally {
                allSelected.value = false;
            }
        });

        watch(allSelected, (value, oldValue) => {
            if (value === oldValue) {
                return;
            }

            unselectAll();

            if (value) {
                selectAll();
            }
        });

        const toggleFile = (file: BucketFile) => {
            const index = selected.value.findIndex((el) => el === file.id);
            if (index === -1) {
                selected.value.push(file.id);
            } else {
                selected.value.splice(index, 1);

                allSelected.value = false;
            }
        };

        return {
            busy,

            selected,
            allSelected,
            dropSelected,

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
        <div class="flex flex-col gap-2">
            <template v-if="!readonly">
                <VCFormCheckbox
                    v-model="allSelected"
                    :disabled="busy"
                    :label="true"
                    :group-class="'inline-flex items-center gap-2 mb-0'"
                >
                    <template #label="props">
                        <label :for="props.id">
                            Select all?
                        </label>
                    </template>
                </VCFormCheckbox>
            </template>

            <hr
                v-if="!readonly"
                class="text-sm"
            >

            <FBucketFiles
                ref="bucketFiles"
                :query="query"
                @deleted="handleDeleted"
            >
                <template #body="{ data, resolved, deleted }">
                    <template v-if="resolved && data.length === 0">
                        <div class="flex flex-col gap-1">
                            <VCAlert
                                color="neutral"
                                variant="soft"
                                size="sm"
                                class="mb-0"
                            >
                                No files found in bucket
                            </VCAlert>
                        </div>
                    </template>
                    <template v-else>
                        <div class="flex flex-col">
                            <template
                                v-for="file in data"
                                :key="file.id"
                            >
                                <FBucketFile
                                    :readonly="readonly"
                                    class="me-1"
                                    :entity="file"
                                    :files-selected="selected"
                                    @toggle="toggleFile"
                                    @deleted="deleted"
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

            <hr
                v-if="!readonly"
                class="text-sm"
            >

            <div
                v-if="!readonly"
                class="flex flex-row"
            >
                <div>
                    <VCButton
                        title="Delete Files"
                        color="error"
                        size="xs"
                        :disabled="busy || selected.length === 0"
                        @click.prevent="dropSelected"
                    >
                        <VCIcon name="fa6-solid:trash" />
                    </VCButton>
                </div>
                <template v-if="!readonly">
                    <div class="ms-auto">
                        <VCButton
                            title="Add File"
                            size="xs"
                            color="neutral"
                            @click.prevent="toggleModal"
                        >
                            <VCIcon name="fa6-solid:plus" />
                        </VCButton>
                    </div>
                </template>
            </div>
        </div>
        <div>
            <VCModal v-model:open="modal">
                <VCModalContent class="modal-lg">
                    <div class="modal-header">
                        <div class="flex flex-row w-full">
                            <div>
                                <h5 class="mb-0">
                                    <VCIcon name="fa6-solid:upload" /> Upload
                                </h5>
                            </div>
                            <div class="ms-auto">
                                <VCButton
                                    size="xs"
                                    color="neutral"
                                    variant="soft"
                                    @click.prevent="modal = false"
                                >
                                    <VCIcon name="fa6-solid:xmark" />
                                </VCButton>
                            </div>
                        </div>
                    </div>
                    <div class="modal-body">
                        <FBucketFilesUpload
                            :bucket-id="entityId"
                            @uploaded="handleUploaded"
                            @failed="handleFailed"
                        />
                    </div>
                </VCModalContent>
            </VCModal>
        </div>
    </div>
</template>
