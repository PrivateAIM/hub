/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { defineComponent, h } from 'vue';
import Logo from './Logo.svg';

export default defineComponent({
    props: {
        height: {
            type: [Number, String],
            default: 32,
        },
    },
    setup(props) {
        return () => {
            // Size via inline style, not the `height` attribute —
            // Tailwind preflight sets `img { height: auto }`, which
            // overrides the attribute and lets the SVG render at its
            // intrinsic size.
            const height = typeof props.height === 'number' ?
                `${props.height}px` :
                props.height;

            return h('img', {
                src: Logo,
                alt: 'FLAME logo',
                style: {
                    height, 
                    width: 'auto', 
                    maxWidth: '100%', 
                },
            });
        };
    },
});
