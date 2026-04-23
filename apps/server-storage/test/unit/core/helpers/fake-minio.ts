/*
 * Copyright (c) 2025.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

type MakeBucketCall = {
    name: string;
    region?: string;
};

export class FakeMinioClient {
    private buckets: Set<string> = new Set();

    private makeBucketCalls: MakeBucketCall[] = [];

    async bucketExists(name: string): Promise<boolean> {
        return this.buckets.has(name);
    }

    async makeBucket(name: string, region?: string): Promise<void> {
        this.makeBucketCalls.push({ name, region });
        this.buckets.add(name);
    }

    // --- Test helpers ---

    getBuckets(): string[] {
        return [...this.buckets];
    }

    getMakeBucketCalls(): MakeBucketCall[] {
        return [...this.makeBucketCalls];
    }

    addBucket(name: string): void {
        this.buckets.add(name);
    }
}
