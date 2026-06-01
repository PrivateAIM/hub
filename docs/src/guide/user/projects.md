# Projects

Projects are collaborative research units in PrivateAIM Hub. They group analyses, nodes, and data requirements into a single organizational context.

## Overview

![Projects overview](/images/hub_proposal.png)

## Creating a Project

![Create project](/images/hub_proposal_create.png)

A project defines:
- **Name** and description
- **Selected nodes** — the institutions participating in the analysis
- **Risk assessment** — evaluation of data sensitivity and privacy requirements

### Naming

Like analyses, projects have two name fields:

- **`name`** — a unique, URL-friendly identifier (lowercase letters, digits and the characters `-`, `_`, `.`; no whitespace). It is **required** and must be unique. If you do not provide one when creating a project, a readable name is **generated automatically** (e.g. `brave-otter-1a2b3c`); the create form also pre-fills an editable suggestion.
- **`display_name`** — an optional, free-form human-readable label. When set, it is shown in the UI in place of the `name`.

Once created, a project enters a pending state and requires [administrator approval](/guide/user/approval) before analyses can be added (unless approval is disabled in development).

## Project Nodes

Nodes are assigned to projects via `ProjectNode` associations. Only nodes assigned to a project can participate in that project's analyses.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects` | List projects |
| `POST` | `/projects` | Create project |
| `GET` | `/projects/:id` | Get project details |
| `PUT` | `/projects/:id` | Update project |
| `DELETE` | `/projects/:id` | Delete project |
| `GET` | `/project-nodes` | List project-node associations |
| `POST` | `/project-nodes` | Assign node to project |
| `DELETE` | `/project-nodes/:id` | Remove node from project |
