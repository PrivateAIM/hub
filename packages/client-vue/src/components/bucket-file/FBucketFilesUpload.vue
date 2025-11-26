<!--
  - Copyright (c) 2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import { hasOwnProperty } from '@privateaim/kit';
import { defineComponent, ref } from 'vue';
import { injectStorageHTTPClient, wrapFnWithBusyState } from '../../core';
import FBucketFileForm from './FBucketFileForm.vue';

export default defineComponent({
    components: { FBucketFileForm },
    props: {
        bucketId: {
            type: String,
            required: true,
        },
    },
    emits: ['uploaded', 'failed'],
    setup(props, { emit }) {
        const storageClient = injectStorageHTTPClient();

        const busy = ref(false);
        const tempFiles = ref<File[]>([]);
        const directoryMode = ref<boolean>(true);
        const vNode = ref<null | string>(null);

        const checkTempFiles = ($event: any) => {
            $event.preventDefault();

            for (let i = 0; i < $event.target.files.length; i++) {
                tempFiles.value.push($event.target.files[i]);
            }

            if (vNode.value) {
                vNode.value = '';
            }

            $event.target.value = '';
        };

        const dropTempFile = ($event: any) => {
            const index = tempFiles.value.findIndex((file) => {
                if (
                    hasOwnProperty(file, 'webkitRelativePath') &&
                    hasOwnProperty($event, 'webkitRelativePath')
                ) {
                    return file.webkitRelativePath === $event.webkitRelativePath;
                }
                return file.name === $event.name;
            });

            if (index !== -1) {
                tempFiles.value.splice(index, 1);
            }
        };

        const upload = wrapFnWithBusyState(busy, async () => {
            if (tempFiles.value.length === 0) return;

            try {
                const formData = new FormData();
                for (let i = 0; i < tempFiles.value.length; i++) {
                    formData.append(`files[${i}]`, tempFiles.value[i]);
                }

                const {
                    data: bucketFiles,
                } = await storageClient.bucket.upload(
                    props.bucketId,
                    formData,
                );

                tempFiles.value = [];

                emit('uploaded', bucketFiles);
            } catch (e) {
                emit('failed', e);
            }
        });

        return {
            directoryMode,
            busy,
            vNode,
            tempFiles,
            checkTempFiles,
            dropTempFile,
            upload,
        };
    },
});
</script>
<template>
    <div class="d-flex flex-column">
        <div>
            <div class="form-group">
                <label class="form-label">{{ directoryMode ? 'Directories' : 'Files' }}</label>
                <input
                    id="files"
                    ref="vNode"
                    type="file"
                    :webkitdirectory="directoryMode"
                    class="form-control"
                    multiple
                    :disbaled="busy"
                    @change="checkTempFiles"
                >
            </div>
            <div class="form-group mb-0">
                <div class="form-check form-switch">
                    <input
                        id="train-file-manager-switch"
                        v-model="directoryMode"
                        class="form-check-input"
                        type="checkbox"
                    >
                    <label
                        class="form-check-label"
                        for="train-file-manager-switch"
                    >Directory Mode</label>
                </div>
            </div>
        </div>
        <div>
            <div
                v-if="tempFiles.length === 0"
                class="alert alert-info alert-sm m-t-10"
            >
                You have not selected any {{ directoryMode ? 'directories' : 'files' }} to upload.
            </div>

            <div class="d-flex flex-column">
                <template
                    v-for="(file,key) in tempFiles"
                    :key="key"
                >
                    <FBucketFileForm
                        class="me-1"
                        :file="file"
                        @drop="dropTempFile"
                    />
                </template>
            </div>

            <div class="form-group">
                <button
                    type="button"
                    class="btn btn-sm btn-primary btn-block"
                    :disabled="busy || tempFiles.length === 0"
                    @click.prevent="upload"
                >
                    <i class="fa fa-upload" /> Upload
                </button>
            </div>
        </div>
    </div>
</template>
