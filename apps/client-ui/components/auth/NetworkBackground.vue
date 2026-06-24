<!--
  - Copyright (c) 2026.
  - Author Peter Placzek (tada5hi)
  - For the full copyright and license information,
  - view the LICENSE file that was distributed with this source code.
  -->
<script lang="ts">
import {
    defineComponent,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from 'vue';

type Point = [number, number];

// Landmass blobs in normalized equirectangular coords (x: lon 0..1, y: lat 0..1).
// A coarse approximation of the continents — enough to read as a world map once
// rendered as a dot field, without shipping real geo data.
const LAND: [number, number, number, number][] = [
    [0.20, 0.34, 0.085, 0.13], 
    [0.255, 0.50, 0.028, 0.06], 
    [0.30, 0.66, 0.055, 0.15], // Americas
    [0.495, 0.30, 0.05, 0.06], 
    [0.52, 0.58, 0.07, 0.14], // Europe, Africa
    [0.68, 0.33, 0.155, 0.13], 
    [0.66, 0.48, 0.035, 0.05], // Asia, India
    [0.78, 0.55, 0.06, 0.035], 
    [0.84, 0.70, 0.06, 0.05], // SE Asia, Australia
];

const isLand = (x: number, y: number): boolean => LAND.some(([cx, cy, rx, ry]) => {
    const dx = (x - cx) / rx;
    const dy = (y - cy) / ry;
    return dx * dx + dy * dy <= 1;
});

// Index 0 is the central FLAME Hub; the rest are distributed data nodes — the
// real platform topology. A pure hub-and-spoke star: every data node links to
// the central hub (and streams its packets there), never to another node.
const NODES: Point[] = [
    [0.515, 0.275], // 0 central hub  (Europe / DE)
    [0.27, 0.36], // 1 data node    (US east)
    [0.485, 0.285], // 2 data node    (UK)
    [0.33, 0.68], // 3 data node    (South America)
    [0.50, 0.55], // 4 data node    (Africa)
    [0.66, 0.47], // 5 data node    (India)
    [0.86, 0.36], // 6 data node    (Japan)
    [0.85, 0.72], // 7 data node    (Australia)
    [0.78, 0.56], // 8 data node    (SE Asia)
    [0.20, 0.31], // 9 data node    (US west)
];

const EDGES: [number, number][] = [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
    [0, 6],
    [0, 7],
    [0, 8],
    [0, 9],
];

export default defineComponent({
    name: 'NetworkBackground',
    props: {
        // Re-read the palette whenever the color mode flips so the canvas
        // colors track the active theme (the parent owns the dark ref).
        dark: {
            type: Boolean,
            default: true,
        },
    },
    setup(props) {
        const canvas = ref<HTMLCanvasElement | null>(null);

        let ctx: CanvasRenderingContext2D | null = null;
        let raf = 0;
        let observer: ResizeObserver | null = null;
        let dpr = 1;
        let last = 0;
        let reduced = false;
        // Detached element used to let the browser normalize arbitrary color
        // tokens (oklch()/hsl()/named) to rgb when resolving the palette.
        let probe: HTMLSpanElement | null = null;

        // Packets transit THROUGH the hub: each rides from its source data node
        // into the hub, then most continue out to a *different* node
        // (node → hub → node) while a few terminate at the hub. This keeps every
        // spoke carrying traffic in both directions. A packet's path is a list of
        // legs; each leg is a [from, to] pair of node indices (0 = hub).
        const DATA_NODES = NODES.length - 1; // node indices 1..DATA_NODES
        const randNode = () => 1 + Math.floor(Math.random() * DATA_NODES);

        const makePath = (): number[][] => {
            const src = randNode();
            // ~82% route on through the hub to another node; the rest stop there.
            if (Math.random() < 0.82) {
                let dst = randNode();
                while (dst === src) {
                    dst = randNode();
                }
                return [[src, 0], [0, dst]];
            }
            return [[src, 0]];
        };

        const makePacket = () => {
            const path = makePath();
            return {
                path,
                t: Math.random() * path.length, // spread so packets never bunch up
                speed: 0.16 + Math.random() * 0.12,
            };
        };

        const packets = Array.from({ length: 12 }, makePacket);

        // Colors resolved from the theme's CSS custom properties so a palette /
        // light-dark switch flows straight through to the canvas.
        const palette = {
            continent: [128, 128, 128] as number[],
            link: [39, 118, 220] as number[], // --privateaim-brand-blue
            packet: [78, 205, 196] as number[], // --privateaim-brand-teal
            node: [78, 205, 196] as number[], // --privateaim-brand-teal
            hub: [255, 91, 91] as number[], // --privateaim-brand-coral
        };

        const parseRGB = (input: string): number[] | null => {
            const match = input.match(/rgba?\(([^)]+)\)/);
            if (!match) {
                return null;
            }
            // Handles both legacy "r, g, b" and modern "r g b / a" syntaxes.
            const parts = match[1].split(/[\s,/]+/).map((s) => Number.parseFloat(s));
            if (parts.length >= 3 && parts.slice(0, 3).every((p) => !Number.isNaN(p))) {
                return [parts[0], parts[1], parts[2]];
            }
            return null;
        };

        const toRGB = (input: string, fallback: number[]): number[] => {
            const value = input.trim();
            if (!value) {
                return fallback;
            }
            if (value.startsWith('#')) {
                let hex = value.slice(1);
                if (hex.length === 3) {
                    hex = hex.split('').map((c) => c + c).join('');
                }
                const n = Number.parseInt(hex, 16);
                if (hex.length === 6 && !Number.isNaN(n)) {
                    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
                }
                return fallback;
            }
            const direct = parseRGB(value);
            if (direct) {
                return direct;
            }
            // General path: the theme's neutrals resolve to oklch() (Tailwind v4),
            // which neither the hex nor the rgb() branch can read. Let the browser
            // compute it on the probe — getComputedStyle always reports rgb().
            if (probe && typeof window !== 'undefined') {
                probe.style.color = '';
                probe.style.color = value;
                const computed = parseRGB(window.getComputedStyle(probe).color);
                if (computed) {
                    return computed;
                }
            }
            return fallback;
        };

        const readPalette = () => {
            if (typeof window === 'undefined') {
                return;
            }
            const styles = window.getComputedStyle(document.documentElement);
            const read = (name: string, fallback: number[]) => toRGB(styles.getPropertyValue(name), fallback);
            palette.continent = read('--vc-color-fg-muted', [150, 158, 170]);
            palette.link = read('--privateaim-brand-blue', [39, 118, 220]);
            palette.packet = read('--privateaim-brand-teal', [78, 205, 196]);
            palette.node = read('--privateaim-brand-teal', [78, 205, 196]);
            palette.hub = read('--privateaim-brand-coral', [255, 91, 91]);
        };

        const rgba = (c: number[], a: number) => `rgba(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0}, ${a})`;

        const resize = () => {
            const el = canvas.value;
            if (!el) {
                return;
            }
            // Re-sample DPR on every resize (not just at mount) so browser zoom
            // or a move to a higher-density display re-scales the backbuffer.
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = el.getBoundingClientRect();
            el.width = Math.max(1, Math.round(rect.width * dpr));
            el.height = Math.max(1, Math.round(rect.height * dpr));
        };

        const draw = (now: number) => {
            const el = canvas.value;
            if (!el || !ctx) {
                return;
            }

            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;

            const w = el.width;
            const h = el.height;
            const continentAlpha = props.dark ? 0.2 : 0.36;
            const linkAlpha = props.dark ? 0.32 : 0.3;

            ctx.clearRect(0, 0, w, h);

            const padX = w * 0.06;
            const padY = h * 0.1;
            const mapW = w - padX * 2;
            const mapH = h - padY * 2;
            const toPx = (nx: number, ny: number): Point => [padX + nx * mapW, padY + ny * mapH];

            // dotted continents (faint, behind the network)
            const step = Math.max(8 * dpr, mapW / 100);
            for (let py = 0; py <= mapH; py += step) {
                for (let px = 0; px <= mapW; px += step) {
                    if (!isLand(px / mapW, py / mapH)) {
                        continue;
                    }
                    ctx.beginPath();
                    ctx.arc(padX + px, padY + py, 1.05 * dpr, 0, Math.PI * 2);
                    ctx.fillStyle = rgba(palette.continent, continentAlpha);
                    ctx.fill();
                }
            }

            const ctrl = (a: Point, b: Point) => {
                const [x1, y1] = toPx(a[0], a[1]);
                const [x2, y2] = toPx(b[0], b[1]);
                const mx = (x1 + x2) / 2;
                const my = (y1 + y2) / 2;
                const d = Math.hypot(x2 - x1, y2 - y1);
                return {
                    x1, 
                    y1, 
                    x2, 
                    y2, 
                    cx: mx, 
                    cy: my - d * 0.32,
                };
            };
            const bez = (c: ReturnType<typeof ctrl>, t: number): Point => {
                const mt = 1 - t;
                return [
                    mt * mt * c.x1 + 2 * mt * t * c.cx + t * t * c.x2,
                    mt * mt * c.y1 + 2 * mt * t * c.cy + t * t * c.y2,
                ];
            };

            // 1) persistent links — always visible, so connectivity is explicit
            for (const [i, j] of EDGES) {
                const c = ctrl(NODES[i], NODES[j]);
                ctx.beginPath();
                ctx.moveTo(c.x1, c.y1);
                ctx.quadraticCurveTo(c.cx, c.cy, c.x2, c.y2);
                ctx.strokeStyle = rgba(palette.link, linkAlpha);
                ctx.lineWidth = 1 * dpr;
                ctx.stroke();
            }

            // 2) data packets flowing along the links (skipped when reduced-motion)
            for (const pk of packets) {
                if (!reduced) {
                    pk.t += dt * pk.speed;
                    if (pk.t >= pk.path.length) {
                        // Journey complete — pick a fresh source / destination.
                        pk.path = makePath();
                        pk.t = 0;
                        pk.speed = 0.16 + Math.random() * 0.12;
                    }
                }
                // Current leg and the position (0..1) within it.
                const legIndex = Math.min(Math.floor(pk.t), pk.path.length - 1);
                const localT = pk.t - legIndex;
                const leg = pk.path[legIndex];
                const c = ctrl(NODES[leg[0]], NODES[leg[1]]);
                const tail = 9;
                for (let k = 0; k < tail; k++) {
                    const tt = localT - k * 0.02;
                    if (tt < 0) {
                        continue;
                    }
                    const [x, y] = bez(c, tt);
                    ctx.beginPath();
                    ctx.arc(x, y, (2.3 - k * 0.18) * dpr, 0, Math.PI * 2);
                    ctx.fillStyle = rgba(palette.packet, (1 - k / tail) * 0.95);
                    ctx.fill();
                }
            }

            // 3) nodes — central hub distinct (coral), data nodes ringed (teal)
            NODES.forEach((n, idx) => {
                const [x, y] = toPx(n[0], n[1]);
                const central = idx === 0;
                const color = central ? palette.hub : palette.node;
                const pulse = reduced ? 0.5 : Math.sin(now * 0.0018 + idx) * 0.5 + 0.5;
                ctx.beginPath();
                ctx.arc(x, y, ((central ? 9 : 5) + pulse * 4) * dpr, 0, Math.PI * 2);
                ctx.fillStyle = rgba(color, 0.12);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x, y, (central ? 6 : 4) * dpr, 0, Math.PI * 2);
                ctx.strokeStyle = rgba(color, 0.85);
                ctx.lineWidth = 1.4 * dpr;
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(x, y, (central ? 3 : 2) * dpr, 0, Math.PI * 2);
                ctx.fillStyle = rgba(color, 1);
                ctx.fill();
            });

            if (!reduced) {
                raf = window.requestAnimationFrame(draw);
            }
        };

        // Browser zoom changes devicePixelRatio without always resizing the
        // canvas box, so refresh the backbuffer on window resize as well.
        const onWindowResize = () => {
            resize();
            if (reduced) {
                draw(last);
            }
        };

        onMounted(() => {
            const el = canvas.value;
            if (!el) {
                return;
            }
            ctx = el.getContext('2d');
            reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            probe = document.createElement('span');
            probe.setAttribute('aria-hidden', 'true');
            probe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:0;height:0;pointer-events:none;';
            document.body.appendChild(probe);

            readPalette();
            resize();
            window.addEventListener('resize', onWindowResize);

            observer = new ResizeObserver(() => {
                resize();
                if (reduced) {
                    draw(0); // repaint the static frame at the new size
                }
            });
            observer.observe(el);

            last = window.performance.now();
            if (reduced) {
                draw(last); // one static frame, no loop
            } else {
                raf = window.requestAnimationFrame(draw);
            }
        });

        onBeforeUnmount(() => {
            if (raf) {
                window.cancelAnimationFrame(raf);
            }
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            window.removeEventListener('resize', onWindowResize);
            if (probe) {
                probe.remove();
                probe = null;
            }
            ctx = null;
        });

        watch(() => props.dark, () => {
            readPalette();
            if (reduced) {
                draw(last);
            }
        });

        return { canvas };
    },
});
</script>
<template>
    <canvas
        ref="canvas"
        class="network-bg"
        aria-hidden="true"
    />
</template>
<style scoped>
.network-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    /* Decorative, aria-hidden layer — never intercept pointer events. */
    pointer-events: none;
}
</style>
