/*
 * Opens or updates the release pull request with every package at ONE version.
 *
 * release-please's linked-versions plugin is inert under
 * `include-component-in-tag: false` (googleapis/release-please#1750): it
 * collects its group through getComponent(), which returns '' there, so every
 * package would bump on its own commits. The `lockstep` plugin below is the
 * same preconfigure step, grouped by package PATH instead: it forces the
 * highest proposed version onto every package and gives a package without
 * commits a synthetic Release-As commit, so a package that is only a
 * dependent (node-workspace's patch bump) is not left behind either.
 *
 * The plugin is appended through the manifest option overrides, not the
 * config file: release-please-action builds every configured plugin when it
 * creates releases and would reject an unknown type.
 *
 * Env: GITHUB_TOKEN, GITHUB_REPOSITORY (owner/repo), RELEASE_PLEASE_PATH
 * (directory release-please is installed in), DRY_RUN=true to only print,
 * TARGET_BRANCH to run against another branch than the default (testing).
 */

const fs = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');

const requireReleasePlease = createRequire(path.join(process.env.RELEASE_PLEASE_PATH || process.cwd(), 'package.json'));
const {
    GitHub,
    Manifest,
    VERSION,
    registerPlugin,
} = requireReleasePlease('release-please');
const { ManifestPlugin } = requireReleasePlease('release-please/build/src/plugin');
const { buildStrategy } = requireReleasePlease('release-please/build/src/factory');
const { parseConventionalCommits } = requireReleasePlease('release-please/build/src/commit');

class LockstepPlugin extends ManifestPlugin {
    async preconfigure(strategiesByPath, commitsByPath, releasesByPath) {
        const versions = [];
        const withoutRelease = new Set();
        for (const packagePath of Object.keys(strategiesByPath)) {
            const pullRequest = await strategiesByPath[packagePath].buildReleasePullRequest(
                parseConventionalCommits(commitsByPath[packagePath], this.logger),
                releasesByPath[packagePath],
            );

            if (pullRequest?.version) {
                versions.push(pullRequest.version);
            } else {
                withoutRelease.add(packagePath);
            }
        }

        if (versions.length === 0) {
            return strategiesByPath;
        }

        const version = versions.reduce((max, next) => (max.compare(next) >= 0 ? max : next)).toString();
        this.logger.info(`lockstep: releasing every package as ${version}`);

        const strategies = {};
        for (const packagePath of Object.keys(strategiesByPath)) {
            strategies[packagePath] = await buildStrategy({
                ...this.repositoryConfig[packagePath],
                github: this.github,
                path: packagePath,
                targetBranch: this.targetBranch,
                releaseAs: version,
            });

            if (withoutRelease.has(packagePath)) {
                commitsByPath[packagePath].push({
                    sha: '',
                    message: `chore: synchronize versions\n\nRelease-As: ${version}`,
                });
            }
        }

        return strategies;
    }
}

registerPlugin('lockstep', (options) => new LockstepPlugin(
    options.github,
    options.targetBranch,
    options.repositoryConfig,
));

async function run() {
    const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
    if (!owner || !repo) {
        throw new Error('GITHUB_REPOSITORY must be set to owner/repo.');
    }

    const github = await GitHub.create({ owner, repo, token: process.env.GITHUB_TOKEN });
    const branch = process.env.TARGET_BRANCH || github.repository.defaultBranch;
    console.log(`release-please ${VERSION}, ${owner}/${repo}@${branch}`);

    const config = JSON.parse(fs.readFileSync('release-please-config.json', 'utf8'));
    const manifest = await Manifest.fromManifest(github, branch, undefined, undefined, {
        plugins: [...(config.plugins || []), { type: 'lockstep' }],
    });

    if (process.env.DRY_RUN === 'true') {
        const pullRequests = await manifest.buildPullRequests();
        if (pullRequests.length === 0) {
            console.log('Nothing to release.');
        }

        for (const pullRequest of pullRequests) {
            const versions = pullRequest.body.releaseData.map((release) => String(release.version));
            console.log(`Would open "${pullRequest.title.toString()}": ${versions.length} releases at ${[...new Set(versions)].join(', ')}.`);
        }
        return;
    }

    const pullRequests = await manifest.createPullRequests();
    for (const pullRequest of pullRequests) {
        if (pullRequest) {
            console.log(`Opened or updated #${pullRequest.number}.`);
        }
    }
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
