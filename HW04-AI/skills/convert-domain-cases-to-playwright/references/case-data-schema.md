# Case data schema

Each JSON file is an array with one object per automated test case. A case holds
the behaviour under test; the values that vary between runs of that behaviour
live in its `datasets` array. This keeps one named test per dataset while the
spec stays a single loop.

## Case fields

| Field | Required | Purpose |
| --- | --- | --- |
| `id` | yes | Stable unique automation case ID |
| `title` | yes | Human-readable behaviour under test |
| `action` | yes | Dispatch key the spec switches on; every value must have a matching branch |
| `requirementIds` | yes | Non-empty array of requirement IDs |
| `sourceCases` | yes | Non-empty array of the original manual/domain case IDs this case converts |
| `datasets` | yes | Non-empty array of dataset objects |

## Dataset fields

| Field | Required | Purpose |
| --- | --- | --- |
| `id` | yes | Unique, and prefixed with the owning case ID so a failure names its case |
| `title` | yes | What distinguishes this dataset from its siblings |
| `input` | yes | Inputs and precondition data; an empty object is allowed |
| `expected` | yes | Requirement-based oracle in plain language |

Any further dataset field is a per-dataset expected value the spec dereferences,
for example a formatted total or a translated label. Keep those in the data
file, never inline in the spec.

## Rules the validator enforces

- Every required field above is present and non-empty.
- Case IDs and dataset IDs are unique, and each dataset ID starts with its case ID.
- `sourceCases` is non-empty, so coverage against the original case set is
  computed from the data rather than claimed in prose.
- At least one case runs more than one dataset, otherwise the file is a flat
  list wearing a data-driven shape.

## Notes

`sourceCases` is what makes the "which cases were not automated" question
answerable: subtract the union of `sourceCases` from the original case list.

Do not store secrets. Read credentials and environment URLs from environment
variables when they are not public demo values.
