---
name: design-api-performance-suite
description: Design a family of load, stress, and spike test plans that drive one realistic end-to-end API workflow, parameterised from external CSV data, with justified think time, ramp-up, and concurrency. Use when an agent must turn an API specification into runnable JMeter or k6 performance plans and needs the workload model, data files, assertions, listener choices, and naming to be reviewable rather than guessed.
---

# Design API Performance Suite

Build a workload model that a reader can defend. Do not invent numbers the system under test has not been measured at, and do not let a plan pass review because it runs without errors.

## Preconditions

1. Read the API specification and the server source for every endpoint the workflow touches. Concurrency behaviour lives in the implementation, not the specification: in-memory state, missing indexes, string-concatenated queries, unbounded collections, and lockout counters all change what a plan must do.
2. Record the baseline the plans will be compared against: a single-user pass over the whole workflow, one iteration, no concurrency. Every later threshold refers to this.
3. Confirm the workload covers each endpoint class the assignment or the service owner named — typically a read-heavy class, an authentication class, and a transactional write class. One plan family, one workflow, all classes.

## Workflow

1. Write the end-to-end workflow as an ordered list of business steps before writing any tool file. Each step names its endpoint, its method, the value it extracts for later steps, and the assertion that proves it actually succeeded.
2. Derive the workload parameters one at a time and record the reasoning for each. Never accept a full parameter set from a single generic prompt:
   - **Think time** — from how long a human spends on the screen that triggers each call, not a uniform constant. Reading a product list is not the same pause as submitting a payment.
   - **Ramp-up** — long enough that thread start-up is not itself the load event, except in a spike plan where the abrupt arrival *is* the thing under test.
   - **Concurrency** — anchored to a stated expected user population and its arrival rate, then scaled per scenario type.
   - **Duration** — long enough that each thread completes several full workflow iterations, otherwise the run measures ramp-up.
3. Differentiate the three scenario types by intent, not only by thread count:
   - **Load** — the anticipated workload. Answers "does it meet its criteria in normal operation".
   - **Stress** — pushed past the anticipated workload until it degrades. Answers "where is the breaking point, and how does it break". A stress plan that never produces errors or latency growth has not stressed anything.
   - **Spike** — a steady baseline plus a sudden arrival of a large cohort, then withdrawal. Answers "does it survive the surge and does it recover afterwards". Model recovery explicitly: the plan must keep sampling after the spike leaves.
4. Externalise every variable value into CSV. Credentials, entity identifiers, search terms, and order payloads all belong in data files read by a CSV data set element, not inline in the plan. See [references/workload-model.md](references/workload-model.md) for the required columns and the recycle/sharing settings that decide whether threads collide.
5. Seed the system under test with enough distinct rows to feed the CSVs. A plan that reuses one account across hundreds of threads measures a lock, not the endpoint.
6. Assert on content, not only on status. A response that returns 200 with an empty body, an error string, or a missing token must fail the sample. Extract the token, identifier, or total the next step needs, and fail the sample when extraction yields nothing.
7. Give each plan in the family a **different** result view, so the family demonstrates a range of reporting rather than the same table three times. Choose the view that fits the question the scenario asks — a distribution view for load, a breaking-point-over-time view for stress, an arrival-versus-latency time series for spike.
8. Name each plan and each result artefact with the agreed convention so a marker can match plan, log, and report without opening them.

## Validation

```text
node <skill-path>/scripts/validate-test-plan.js <plan.jmx> [more-plans.jmx]
```

The validator exits non-zero when a plan:

- declares no thread group, or a thread group with neither a bounded loop count nor a scheduler duration;
- reads no external data set, or reads one whose file is missing from disk;
- has samplers but no assertion, or no extractor feeding a later step that uses a variable;
- contains no timer, meaning zero think time;
- reuses a listener class already used by another plan passed in the same invocation;
- carries a test-plan name that does not match the configured naming pattern;
- hardcodes a value that also appears as a CSV column, which means the data file is decorative.

Read its JSON output rather than trusting the exit code alone: it reports the parameters it found so they can be checked against the reasoning recorded in step 2.

## Human-review gates

Machine validation cannot see whether a number is realistic. Review each of these and record what was wrong and why it was wrong:

- **Ramp-up that is really a spike, or a spike that is really a ramp.** Check the arrival rate implied by threads divided by ramp seconds against the stated expectation.
- **Think time of zero, or one constant timer everywhere.** Both produce a request rate no user population generates, which inflates throughput and hides the real bottleneck.
- **Thread counts chosen for a round number** rather than from an expected population. Ask what user count the figure represents.
- **Assertions that only check the status code.** Confirm each one would fail if the endpoint returned the wrong body.
- **Authentication lockout ignored.** If the service locks accounts after N failed attempts, a plan that reuses accounts or supplies wrong credentials will lock its own pool partway through and the remaining samples will measure the lockout path. Decide deliberately whether lockout is in scope; if it is not, guarantee valid credentials and a reset procedure between runs, and document that procedure. If it is, isolate it to a dedicated set of accounts so it does not contaminate the rest.
- **State that accumulates across iterations.** Carts, sessions, and uploads that the service never clears will change the measurement over the run. That is a finding to report, not a defect in the plan — but the plan must be built so the two can be told apart.
- **Correlation left unbound.** A token, identifier, or total that was captured once and reused by every thread means the plan is not exercising per-user work.

## Output

Return the plan files, the CSV data files, the seeding steps needed to make the data valid, the validator output, and a table of every workload parameter with the reason it holds that value. State plainly which parameters came from the AI, which the human changed, and what the change was. Never embed assignment names, student identifiers, credentials, or feature-specific data in this skill.
