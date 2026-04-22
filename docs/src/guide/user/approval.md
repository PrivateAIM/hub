# Project & Analysis Approval

Hub supports administrator approval workflows for projects and analyses. These ensure that federated computations are reviewed before execution.

## Project Approval

Projects represent collaborative research efforts. When a user creates a project:

1. The project enters a **pending** state
2. An administrator reviews the project details (description, risk assessment, data requirements, selected nodes)
3. The administrator **approves** or **rejects** the project
4. Only approved projects can have analyses created

![Project approval](/images/hub_proposal_approve.png)

## Analysis Approval

Analyses are distributed computations within a project. When a user submits an analysis for execution:

1. The analysis enters a **pending** state
2. An administrator reviews the analysis configuration (code, selected nodes, master image)
3. The administrator **approves** or **rejects** the analysis
4. Approved analyses are queued for execution by the worker service

![Analysis review](/images/hub_analysis_review.png)

## Analysis Execution Flow

Once approved, an analysis goes through:

1. **Build** — the worker builds a Docker image from the analysis code and master image
2. **Configure** — storage buckets are provisioned, configuration is locked
3. **Distribute** — the container image is pushed to target node registries
4. **Execute** — nodes pull and run the container against their local data
5. **Complete** — results are collected and stored

## Skipping Approval (Development)

For development and testing, approval workflows can be disabled via environment variables on the [Core API](/reference/core/):

```bash
SKIP_PROJECT_APPROVAL=true
SKIP_ANALYSIS_APPROVAL=true
```

::: warning
Never disable approval workflows in production environments.
:::
