<div align="center">

<a href="https://github.com/PrivateAIM/hub"><img src="https://raw.githubusercontent.com/PrivateAIM/hub/v0.20.0/.github/assets/logo.svg" alt="FLAME Hub" height="100" /></a>

<h1>@privateaim/core-kit 🧩</h1>

</div>

[![npm version](https://img.shields.io/npm/v/@privateaim/core-kit)](https://www.npmjs.com/package/@privateaim/core-kit)
[![CI](https://github.com/PrivateAIM/hub/actions/workflows/main.yml/badge.svg)](https://github.com/PrivateAIM/hub/actions/workflows/main.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/PrivateAIM/hub/blob/master/LICENSE)

**Entity types, validators and domain rules of the FLAME Hub core service: analyses, projects, nodes and registries.**

Server and clients share one definition of each entity, its input validation and its command rules, so a UI cannot offer what
the server refuses. Part of the [FLAME Hub](https://github.com/PrivateAIM/hub) monorepo.

[Installation](#installation) · [Usage](#usage) · [Entities](#entities) · [Validators](#validators) · [Analysis commands](#analysis-commands) · [Domain types and channels](#domain-types-and-channels) · [Notes](#notes) · [Documentation](https://hub.docs.privateaim.net/reference/core/core-kit.html)

---

## Installation

```bash
npm install @privateaim/core-kit @privateaim/kit @authup/core-kit
```

The package is ESM only and needs Node.js `>=26.0.0`. `@privateaim/kit` and `@authup/core-kit` are peer dependencies;
`validup`, `@validup/zod` and `zod` come along as dependencies.

## Usage

```typescript
import type { Analysis } from '@privateaim/core-kit';
import { AnalysisValidator } from '@privateaim/core-kit';
import { ValidatorGroup } from '@privateaim/kit';

const validator = new AnalysisValidator();

// Throws a ValidupError on invalid input; resolves to the normalized data.
const data = await validator.run(input, { group: ValidatorGroup.CREATE });

function label(analysis: Analysis) {
    return analysis.displayName ?? analysis.name;
}
```

## Entities

Each entity is a plain TypeScript type that mirrors the JSON the core API returns. Timestamps are ISO strings, and
relations (`analysis.project`, `node.registry`) are present only when the request includes them.

| Type | Describes |
|---|---|
| `Analysis` | A distributed computation: configuration flags, `buildStatus` / `distributionStatus` / `executionStatus`, its master image and its Authup `clientId` |
| `AnalysisBucket` / `AnalysisBucketFile` | The `CODE`, `RESULT` and `TEMP` storage buckets of an analysis and the files linked into them |
| `AnalysisNode` | The assignment of a node to an analysis, with approval and execution state |
| `AnalysisNodeEvent` / `AnalysisNodeLog` / `AnalysisLog` | Events and log lines of an analysis or one of its nodes |
| `AnalysisStorageToken` / `AnalysisStorageTokenCreatePayload` | Response and request body of the storage capability token mint route |
| `Project` / `ProjectNode` | A project grouping nodes and analyses, and a node's membership with its approval status |
| `Node` | A compute node (`type` is `default` or `aggregator`), bound to its Authup client by `clientId` |
| `MasterImage` / `MasterImageGroup` | Base images analyses build on, and their groups |
| `Registry` / `RegistryProject` | A Harbor registry and a project inside it |

The status columns are typed as `` `${ProcessStatus}` `` from `@privateaim/kit`. Enums for the other closed vocabularies are
exported next to their entity:

| Enum | Values |
|---|---|
| `AnalysisBucketType` | `CODE`, `RESULT`, `TEMP` |
| `AnalysisNodeApprovalStatus` / `ProjectNodeApprovalStatus` | `approved`, `rejected` |
| `AnalysisNodeApprovalCommand` / `ProjectNodeApprovalCommand` | `approve`, `reject` |
| `NodeType` | `default`, `aggregator` |
| `MasterImageCommand` / `MasterImageGroupType` | `sync`, `build` / `language`, `default` |
| `RegistryProjectType` | `default`, `aggregator`, `incoming`, `outgoing`, `masterImages`, `node` |

## Validators

Every writable entity has a validator class built on validup and Zod. Server-core runs the same classes on its create and update
routes, so validating in a client gives the same verdict before the request is sent.

| Validator | Validates |
|---|---|
| `AnalysisValidator` | Analysis create/update input, including `imageCommandArguments` |
| `AnalysisBucketValidator` / `AnalysisBucketFileValidator` | Bucket and bucket-file links |
| `AnalysisNodeValidator` / `AnalysisNodeLogValidator` | Node assignment and node log input |
| `AnalysisStorageTokenValidator` | Storage token requests: 1 to `CAPABILITY_MAX_ENTRIES` cap entries, `lifetime` 1 to 3600 seconds |
| `ProjectValidator` / `ProjectNodeValidator` | Project and project membership input |
| `NodeValidator` | Node input |
| `RegistryValidator` / `RegistryProjectValidator` | Registry and registry project input |

```typescript
import { ProjectValidator } from '@privateaim/core-kit';
import { ValidatorGroup } from '@privateaim/kit';
import { isValidupError } from 'validup';

try {
    const project = await new ProjectValidator().run(
        { name: 'Cancer-Cohort', description: 'Survival analysis' },
        { group: ValidatorGroup.CREATE },
    );
    // project.name === 'cancer-cohort'
} catch (e) {
    if (isValidupError(e)) {
        // one issue per invalid field
    }
}
```

- Pass `group: ValidatorGroup.CREATE` or `ValidatorGroup.UPDATE`: some fields (e.g. `projectId` of an analysis) are mounted for the create group only.
- `run()` resolves to the transformed value, not the input. Project and analysis names are trimmed, lower-cased and checked against Authup's name rules.
- `safeRun()` returns a result object instead of throwing.

## Analysis commands

An analysis moves through configuration lock, image build and distribution by commands (`AnalysisCommand`). The checker classes
hold the preconditions of each step and throw an `AnalysisError` when a step is not allowed:

```typescript
import {
    AnalysisBuilderCommandChecker,
    AnalysisCommand,
    AnalysisError,
    getAnalysisCommandPermissionName,
} from '@privateaim/core-kit';

try {
    AnalysisBuilderCommandChecker.canStart(analysis);
} catch (e) {
    if (e instanceof AnalysisError) {
        console.log(e.message); // e.g. 'The analysis configuration is not locked.'
    }
}

// The permission server-core enforces for a command.
const permission = getAnalysisCommandPermissionName(AnalysisCommand.BUILD_START);
```

| Checker | Methods |
|---|---|
| `AnalysisConfiguratorCommandChecker` | `canLock`, `canUnlock` |
| `AnalysisBuilderCommandChecker` | `canStart`, `canCheck` |
| `AnalysisDistributorCommandChecker` | `canStart`, `canCheck` |

`getAnalysisCommandPermissionName()` answers `analysis_execution_start` for `buildStart` and `distributionStart`, and
`analysis_update` for every other command.

## Domain types and channels

`DomainType` names every entity (`'analysis'`, `'projectNode'`, …) and `DomainTypeMap` maps each name to its entity type,
including the `DomainSubType` directions (`projectNodeIn`, `analysisNodeOut`, …). The realtime and HTTP kits key their event
maps and entity registries on it.

| Export | Purpose |
|---|---|
| `DomainEventName` | `created`, `updated`, `deleted` |
| `DomainEventSubscriptionName` | `subscribe`, `unsubscribe` |
| `buildDomainChannelName(type, id?)` | Socket room of an entity type or one record: `analysis` or `analysis/<id>` |
| `buildDomainNamespaceName(id?)` | Socket namespace: `/resources` or `/resources/<realmId>` |
| `buildAnalysisBucketName(type, id)` / `parseAnalysisBucketName(name)` | Storage bucket name of an analysis (`analysis-code-files.<id>`) and its inverse |
| `buildRegistryClientConnectionStringFromRegistry(registry)` | `<account>:<secret>@https://<host>/api/v2.0/` for a Harbor registry |
| `REGISTRY_INCOMING_PROJECT_NAME`, `REGISTRY_OUTGOING_PROJECT_NAME`, `REGISTRY_MASTER_IMAGE_PROJECT_NAME` | Names of the fixed Harbor projects |

## Errors

| Export | Purpose |
|---|---|
| `AnalysisError` | A `HubError` (from `@privateaim/errors`) with named constructors such as `AnalysisError.configurationLocked()` |
| `APIConnectionStringError` | `connectionStringMissing(service?)` / `connectionStringInvalid(service?)` |
| `ErrorCode` | Shared error code enum (`license_agreement`) |

## Notes

- **The types describe responses, not requests.** Relation properties such as `analysis.project` are typed as present but are filled only when the query includes the relation.
- **`parseAnalysisBucketName()` returns `null`** for a name it did not build; it does not throw.
- **`parseSocketRealmNamespaceName()` returns its input unchanged** when the name lacks the `/resources#` prefix, despite the `string | undefined` return type. It belongs to the older `/resources#<realmId>` naming; server-core serves `/resources/<realmId>` (`buildDomainNamespaceName`).

## Contributing

Before starting to work on a pull request, it is important to review the guidelines for
[contributing](https://github.com/PrivateAIM/hub/blob/master/CONTRIBUTING.md) and the
[code of conduct](https://github.com/PrivateAIM/hub/blob/master/CODE_OF_CONDUCT.md).
These guidelines will help to ensure that contributions are made effectively and are accepted.

## License

Made with 💚

Published under [Apache 2.0](https://github.com/PrivateAIM/hub/blob/master/LICENSE).
