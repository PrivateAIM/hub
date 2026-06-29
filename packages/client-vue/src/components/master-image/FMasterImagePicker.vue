<!--
  - Copyright (c) 2025.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import type { MasterImage } from '@privateaim/core-kit';
import { DomainType } from '@privateaim/core-kit';
import { IFieldValidation } from '@ilingo/validup-vue';
import { useValidup } from '@validup/vue';
import { createValidator } from '@validup/zod';
import { Container } from 'validup';
import { z } from 'zod';
import {
    type PropType,
    computed,
    defineComponent,
    nextTick,
    reactive,
    ref,
    toRef,
    useTemplateRef,
    watch,
} from 'vue';
import FMasterImageGroups from '../master-image-group/FMasterImageGroups';
import FMasterImages from './FMasterImages';
import { createEntityManager, defineEntityManagerEvents } from '../../core';

class MasterImagePickerValidator extends Container<{
    group_virtual_path: string;
    master_image_id: string;
}> {
    protected override initialize() {
        super.initialize();
        this.mount('group_virtual_path', createValidator(z.string().min(1)));
        this.mount('master_image_id', createValidator(z.string().min(1)));
    }
}

export default defineComponent({
    components: {
        FMasterImages,
        FMasterImageGroups,
        IFieldValidation,
    },
    props: {
        entityId: { type: String },
        entity: { type: Object as PropType<MasterImage> },
        readonly: {
            type: Boolean,
            default: false,
        },
    },
    emits: { ...defineEntityManagerEvents<MasterImage>() },
    setup(props, setup) {
        const entityId = toRef(props, 'entityId');
        const vMasterImages = useTemplateRef<typeof FMasterImages | null>('masterImages');

        const form = reactive({
            group_virtual_path: '',
            master_image_id: '',
        });

        const imageQuery = computed(() => ({ filters: { ...(form.group_virtual_path !== '' ? { group_virtual_path: form.group_virtual_path } : {}) } }));

        const resolved = ref(false);

        const manager = createEntityManager({
            type: DomainType.MASTER_IMAGE,
            props,
            setup,
            onResolved: (entity) => {
                if (entity) {
                    form.group_virtual_path = entity.group_virtual_path;
                    form.master_image_id = entity.id;
                } else {
                    form.group_virtual_path = '';
                    form.master_image_id = '';
                }

                resolved.value = true;

                setup.emit('resolved', entity);
            },
        });

        if (props.entityId) {
            form.master_image_id = props.entityId;
        }

        if (props.entity) {
            form.master_image_id = props.entity.id;
        }

        Promise.resolve()
            .then(() => manager.resolve());

        const v = useValidup(new MasterImagePickerValidator(), form, { detached: true });

        const isVirtualGroupPathDefined = computed(() => !!form.group_virtual_path &&
            form.group_virtual_path.length > 0);

        watch(entityId, (val, oldValue) => {
            if (
                val &&
                val !== oldValue &&
                manager.data.value?.id !== val
            ) {
                manager.resolveByRest({ id: val, reset: true });
            }
        });

        watch(imageQuery, (val, oldValue) => {
            if (val && val !== oldValue) {
                nextTick(async () => {
                    if (vMasterImages.value) {
                        await vMasterImages.value.load();
                    }
                });
            }
        });

        const selectGroup = (input: string | null) => {
            if (!input) {
                form.master_image_id = '';
                form.group_virtual_path = '';
                return;
            }
            form.group_virtual_path = input;

            form.master_image_id = '';
        };

        const selectImage = (id: string | null) => {
            manager.data.value = null;

            manager.resolveByRest({ reset: true, id });
        };

        return {
            isVirtualGroupPathDefined,

            imageQuery,

            selectImage,
            selectGroup,

            v,

            busy: manager.busy,
            data: manager.data,

            resolved,
        };
    },
});
</script>
<template>
    <div class="flex flex-wrap -mx-2">
        <div class="flex-1 basis-0 px-2">
            <FMasterImageGroups>
                <template #default=" { data }">
                    <IFieldValidation
                        v-slot="{ value }"
                        :field="v.fields.group_virtual_path"
                    >
                        <VCFormGroup :validation="value">
                            <template #label>
                                Group
                                <template v-if="isVirtualGroupPathDefined">
                                    <VCIcon
                                        name="fa6-solid:check"
                                        class="text-success-600"
                                    />
                                </template>
                            </template>
                            <template #default>
                                <VCFormSelect
                                    v-model="v.fields.group_virtual_path.$model.value"
                                    :options="data.map((el) => {
                                        return {
                                            value: el.virtual_path,
                                            label: el.virtual_path
                                        }
                                    })"
                                    :disabled="readonly || busy"

                                    @update:model-value="selectGroup"
                                />
                            </template>
                        </VCFormGroup>
                    </IFieldValidation>
                </template>
            </FMasterImageGroups>
        </div>
        <div class="flex-1 basis-0 px-2">
            <FMasterImages
                v-if="isVirtualGroupPathDefined"
                ref="masterImages"
                :query="imageQuery"
            >
                <template #default="{ data }">
                    <IFieldValidation
                        v-slot="{ value }"
                        :field="v.fields.master_image_id"
                    >
                        <VCFormGroup :validation="value">
                            <template #label>
                                Image
                                <template v-if="v.fields.master_image_id.$model.value">
                                    <VCIcon
                                        name="fa6-solid:check"
                                        class="text-success-600"
                                    />
                                </template>
                            </template>
                            <template #default>
                                <VCFormSelect
                                    v-model="v.fields.master_image_id.$model.value"
                                    :options="data.map((el) => {
                                        return {
                                            value: el.id,
                                            label: el.name,
                                            disabled: el.build_status !== 'executed',
                                        }
                                    })"
                                    :disabled="readonly || busy"
                                    @update:model-value="selectImage"
                                />
                            </template>
                        </VCFormGroup>
                    </IFieldValidation>
                </template>
            </FMasterImages>
        </div>
    </div>
</template>
