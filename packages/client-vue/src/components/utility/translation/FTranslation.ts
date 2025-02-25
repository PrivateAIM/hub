/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import { SlotName } from '@vuecs/list-controls';
import { defineComponent } from 'vue';
import { useTranslation } from '@authup/client-web-kit';
import { hasNormalizedSlot, normalizeSlot } from '../../../core';

export const FTranslation = defineComponent({
    props: {
        group: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
    },
    setup(props, { slots }) {
        const translation = useTranslation({
            group: props.group,
            key: props.name,
        });

        return () => {
            if (hasNormalizedSlot(SlotName.DEFAULT, slots)) {
                return normalizeSlot(SlotName.DEFAULT, { data: translation.value }, slots);
            }

            return [
                translation.value,
            ];
        };
    },
});
