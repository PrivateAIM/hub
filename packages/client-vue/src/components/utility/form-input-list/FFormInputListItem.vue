/*
* Copyright (c) 2022.
* Author Peter Placzek (tada5hi)
* For the full copyright and license information,
* view the LICENSE file that was distributed with this source code.
*/

<!--
  - Copyright (c) 2025.
  -  Author Peter Placzek (tada5hi)
  -  For the full copyright and license information,
  -  view the LICENSE file that was distributed with this source code.
  -->

<script lang="ts">
import { IFieldValidation } from '@ilingo/validup-vue';
import { useValidup } from '@validup/vue';
import { createValidator } from '@validup/zod';
import { Container } from 'validup';
import { z } from 'zod';
import { VCFormGroup, VCFormInput } from '@vuecs/forms';
import {
    defineComponent,
    reactive,
} from 'vue';

class FormInputListItemValidator extends Container<{ name: string }> {
    protected override initialize() {
        super.initialize();
        this.mount('name', createValidator(z.string().min(2).max(512)));
    }
}

export default defineComponent({
    components: {
        IFieldValidation,
        VCFormInput,
        VCFormGroup,
    },
    props: {
        name: {
            type: String,
            default: undefined,
        },
        canDrop: {
            type: Boolean,
            default: false,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['updated', 'deleted'],
    setup(props, ctx) {
        const form = reactive({ name: props.name ?? '' });

        const v = useValidup(new FormInputListItemValidator(), form);

        const handleUpdated = () => {
            ctx.emit('updated', v.fields.name.$model.value);
        };

        const handleDeleted = () => {
            ctx.emit('deleted');
        };

        return {
            handleUpdated,
            handleDeleted,
            v,
        };
    },
});
</script>
<template>
    <IFieldValidation
        v-slot="{ value }"
        :field="v.fields.name"
    >
        <VCFormGroup :validation="value">
            <VCFormInput
                v-model="v.fields.name.$model.value"
                :disabled="readonly"
                @change="handleUpdated"
            >
                <template #groupAppend>
                    <button
                        :disabled="!canDrop || readonly"
                        type="button"
                        class="btn btn-xs btn-dark"
                        @click.prevent="handleDeleted"
                    >
                        <VCIcon name="fa6-solid:minus" />
                    </button>
                </template>
            </VCFormInput>
        </VCFormGroup>
    </IFieldValidation>
</template>
