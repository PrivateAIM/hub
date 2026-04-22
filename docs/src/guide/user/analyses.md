# Analyses

Analyses are distributed computations within a [project](/guide/user/projects). They define the code, configuration, and target nodes for a federated computation.

## Creating an Analysis

![Add analysis from project](/images/hub_add_analysis_from_proposal.png)

An analysis requires:
- A parent **project** (must be approved)
- A **master image** — the base Docker image for execution
- **Analysis code** — uploaded to a storage bucket and built into a container

## Execution Flow

Once [approved](/guide/user/approval), an analysis goes through:

1. **Configuration** — storage buckets are provisioned, configuration is locked
2. **Build** — the worker builds a Docker image from the analysis code and master image
3. **Distribute** — the container image is pushed to target node registries
4. **Execute** — nodes pull and run the container against their local data
5. **Complete** — results are collected and stored

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/analyses` | List analyses |
| `POST` | `/analyses` | Create analysis |
| `GET` | `/analyses/:id` | Get analysis details |
| `PUT` | `/analyses/:id` | Update analysis |
| `DELETE` | `/analyses/:id` | Delete analysis |
| `GET` | `/analysis-buckets` | List analysis storage buckets |
| `GET` | `/analysis-bucket-files` | List analysis bucket files |

## Analysis Buckets

Each analysis can have associated storage buckets for input data, code, and results. Buckets are managed by the [Storage service](/reference/storage/) and provisioned automatically during the configuration phase.
