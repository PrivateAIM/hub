# Migration — camelCase fields

Hub's HTTP API, domain types and npm packages moved every field name from
`snake_case` to `camelCase`. Database column names did **not** change.

This is a breaking change. There are **no** `snake_case` aliases and no
deprecation window: a request using the old names is rejected by the query
parser or silently ignored by the validator, depending on where the name
appears.

Tracks [#1501](https://github.com/PrivateAIM/hub/issues/1501).

## What changed

`realm_id` → `realmId`, `created_at` → `createdAt`, `display_name` →
`displayName`, and so on for every multi-word field. The rename applies
uniformly to:

- **Response bodies** — every entity field, in both the `{ data, meta }` record
  envelope and collections.
- **Request bodies** — `POST` / `PATCH` payloads for every entity.
- **Query parameters** — the rapiq vocabulary: `fields`, `filter`, `sort`,
  `include`. Relation names move too (`include=master_image` →
  `include=masterImage`).
- **`meta.schema`** — the published allow-lists now list camelCase keys.
- **Telemetry log labels** — `ref_type` / `ref_id` are now `refType` / `refId`.
- **The npm packages** — `@privateaim/core-kit`, `core-http-kit`, `storage-kit`,
  `telemetry-kit`, `messenger-kit`, `messenger-http-kit`, `client-vue`.

### Before / after

```http
GET /nodes?filter[realm_id]=<id>&sort=-created_at&fields=%2Bexternal_name&include=registry_project
```

```http
GET /nodes?filter[realmId]=<id>&sort=-createdAt&fields=%2BexternalName&include=registryProject
```

```jsonc
// before
{ "data": { "id": "…", "display_name": "Node A", "realm_id": "…", "created_at": "…" }, "meta": {} }

// after
{ "data": { "id": "…", "displayName": "Node A", "realmId": "…", "createdAt": "…" }, "meta": {} }
```

## What did NOT change

| Surface | Still `snake_case` |
|---|---|
| Database columns | `realm_id`, `created_at`, … — pinned per column, unchanged |
| Permission names | `analysis_create`, `node_update`, `registry_manage`, … |
| OAuth2 / OIDC parameters | `client_id`, `client_secret`, `grant_type`, `redirect_uri`, `code_verifier` |
| Token introspection payloads | `realm_id`, `sub_kind`, `sub_name`, … |
| Environment variables | `DB_TYPE`, `AUTHUP_URL`, `MINIO_*`, … |
| Table names | `analysis_nodes`, `registry_projects`, … |

Permission names are unchanged because they are stored in Authup, so nothing has
to be re-provisioned.

## Upgrading

### API and npm consumers

Rename the fields you send and read. `meta.schema` on any query-capable `GET` is
the authoritative list of accepted `fields` / `filter` / `sort` / `include` keys
for that endpoint — query it if you are unsure:

```http
GET /nodes?pagination[limit]=1
```

Failure modes to expect while migrating:

- An unknown **filter or sort** key is rejected — `strict` schemas answer with
  `The key <name> is not permitted`.
- An unknown **request-body** key is dropped by the validator, so a write appears
  to succeed while leaving the field unset. Check the response body.
- An unknown **`fields`** entry does not error; the field is simply absent from
  the response.

### Database

No action. No migration ships with this change: every renamed property carries an
explicit column name, so the physical schema is byte-identical. A run → revert →
run round-trip over the existing migrations is unaffected.

### Telemetry / logs

Log lines written **before** the upgrade carry `ref_type` / `ref_id` labels and
are not selectable under the new `refType` / `refId` names — VictoriaLogs stores
label keys verbatim. Entity views (the analysis log panel) will therefore show
only post-upgrade lines. Existing rows are not rewritten; they age out with your
retention policy. Query old lines directly by their old label names if you need
them.

Anything outside Hub that writes logs (node-side components posting to
`/logs` or `/analysis-node-logs`) must switch label names in lockstep.

### Node-side components

These flat, non-envelope endpoints changed field names and need coordinated node
updates:

- `POST /analysis-node-logs` — body keys `analysis_id`, `node_id`,
  `node_realm_id`, `analysis_realm_id` → camelCase.
- `GET /nodes/:id/client/credentials` — `display_name` → `displayName`.
- `GET /nodes/:id/registry/credentials` — `account_name`, `account_secret`,
  `external_name` → camelCase.
- The messenger broker surface (`POST /messages`, pull, ack) — `sender_type`,
  `sender_id`, `recipient_type`, `recipient_id`, `created_at` → camelCase.

### Stored URLs

Bookmarked or emailed links carrying `?filter[realm_id]=…`-style query strings
stop filtering as intended (the key is rejected). Re-create them.

### Audit event diffs

Telemetry `events.data.diff` records which entity fields changed, keyed by field
name. Rows written before the upgrade keep their `snake_case` keys. They are
rendered as-is and never matched by name, so they are left untouched rather than
rewritten.
