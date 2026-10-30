import { Application } from 'orkos';
import { startApplication } from '../../src/app/start.ts';

const mode = process.argv[2];
let keepAlive;

if (mode === 'setup-fail' || mode === 'ready-fail') {
    const app = new Application({
        modules: [{
            name: 'test',
            async setup() {
                keepAlive = setInterval(() => {}, 1_000);
            },
            async onReady() {
                if (mode !== 'ready-fail') {
                    return;
                }

                process.send('starting');
                await new Promise((resolve) => {
                    setTimeout(resolve, 50); 
                });

                throw new Error('ready failed');
            },
            async teardown() {
                process.send('teardown');
                clearInterval(keepAlive);
                process.disconnect();
            },
        }, ...(mode === 'setup-fail' ? [{
            name: 'failing',
            dependencies: ['test'],
            async setup() {
                process.send('starting');
                await new Promise((resolve) => {
                    setTimeout(resolve, 50); 
                });

                throw new Error('setup failed');
            },
        }] : [])],
    });

    try {
        await startApplication(app);
    } catch {
        process.exitCode = 1;
    }
} else {
    if (mode === 'timeout' || mode === 'linger') {
        const original = setTimeout;

        globalThis.setTimeout = (callback, delay, ...args) => original(callback, delay === 30_000 ? 100 : delay, ...args);
    }

    await startApplication({
        async setup() {
            if (process.argv[2] !== 'starting') {
                return;
            }

            process.send('starting');
            await new Promise((resolve) => {
                setTimeout(resolve, 50); 
            });
            process.send('setup-finished');
        },
        async teardown() {
            process.send('teardown');

            if (process.argv[2] === 'timeout') {
                await new Promise(() => {});
            }

            await new Promise((resolve) => {
                setTimeout(resolve, 50); 
            });

            if (process.argv[2] === 'fail') {
                clearInterval(keepAlive);
                process.disconnect();

                throw new Error('teardown failed');
            }

            if (mode === 'output') {
                process.stdout.write('x'.repeat(1_000_000));
            }

            await new Promise((resolve) => {
                process.send('finished', resolve);
            });

            if (mode !== 'linger') {
                clearInterval(keepAlive);
            }

            process.disconnect();
        },
    });
    keepAlive = setInterval(() => {}, 1_000);
    process.send('ready');
}

