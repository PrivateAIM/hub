/*
 * Copyright (c) 2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { useDocker } from './instance';
import { findErrorInDockerModemResponse } from './modem-response';

export type DockerActionStreamWaitOptions = {
    onError?: (error: Error) => any;
    onCompleted?: () => any,
    onProgress?: (res: any) => any
};
export async function waitForDockerActionStream(
    stream: NodeJS.ReadableStream,
    options: DockerActionStreamWaitOptions = {},
) {
    return new Promise<unknown>((resolve, reject) => {
        useDocker().modem.followProgress(stream as any, (error: Error, output: any[]) => {
            error = error || findErrorInDockerModemResponse(output);
            if (error) {
                if (options.onError) {
                    options.onError(error);
                }

                reject(error);
                return;
            }

            if (options.onCompleted) {
                options.onCompleted();
            }

            resolve(output);
        }, (res) => {
            if (options.onProgress) {
                options.onProgress(res);
            }
        });
    });
}
