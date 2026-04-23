/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

export class FakeMinioClient {
    private buckets: Set<string> = new Set();

    async bucketExists(name: string): Promise<boolean> {
        return this.buckets.has(name);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async makeBucket(name: string, region?: string): Promise<void> {
        this.buckets.add(name);
    }

    getBuckets(): string[] {
        return [...this.buckets];
    }

    addBucket(name: string): void {
        this.buckets.add(name);
    }
}
