/*
 * Copyright (c) 2025.
 *  Author Peter Placzek (tada5hi)
 *  For the full copyright and license information,
 *  view the LICENSE file that was distributed with this source code.
 */

import type { PropType } from 'vue';
import { defineComponent, h } from 'vue';
import type { TranslatorTranslationDefaultKey } from '@authup/client-web-kit';
import { TranslatorTranslationGroup } from '@authup/client-web-kit';
import { FTranslation } from './FTranslation';

export const FTranslationDefault = defineComponent({
    props: {
        name: {
            type: String as PropType<`${TranslatorTranslationDefaultKey}`>,
            required: true,
        },
    },
    setup(props) {
        return () => h(FTranslation, {
            group: TranslatorTranslationGroup.DEFAULT,
            name: props.name,
        });
    },
});
