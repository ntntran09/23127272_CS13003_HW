# Case data schema

Each JSON file is an array with one object per automated test.

Required fields:

| Field | Purpose |
| --- | --- |
| `id` | Stable unique automation/test-case ID |
| `title` | Human-readable behavior under test |
| `action` | Dispatch key used by the spec or fixture |
| `input` | Inputs and precondition data; an empty object is allowed |
| `expected` | Requirement-based oracle in plain language |
| `requirementIds` | Non-empty array of requirement IDs |

Optional fields include `tags`, `setup`, `cleanup`, `limitations`, and `sourceCaseIds`.

Do not store secrets. Read credentials and environment URLs from environment variables when they are not public demo values.
