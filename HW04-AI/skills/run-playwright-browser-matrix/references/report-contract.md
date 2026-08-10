# HTML report contract

Each feature-browser invocation must create a distinct directory:

```text
reports/<feature>/<browser>/index.html
```

Required Playwright configuration values:

```js
metadata: {
  'Run by': process.env.STUDENT_ID,
  'Run timestamp': process.env.RUN_TIMESTAMP,
  Feature: process.env.FEATURE,
  Browser: process.env.BROWSER,
}
```

The HTML reporter `title` must repeat the runner ID and timestamp so they are visible when the report is opened. Use a fresh `new Date().toISOString()` for each invocation.

Keep failure screenshots, videos, and traces in the configured output directory. Treat those as execution evidence, not as substitutes for a bug report.

## Engine coverage

Record which rendering engines the matrix covered, not only how many browser projects ran. Chromium, Chrome, and Edge all report as separate projects while sharing one renderer. State the engine set in the report so a reader can tell whether a defect reproducing "on all browsers" means three engines or one.

## Keeping the evidence referenceable

If the output directory is gitignored — Playwright's `test-results/` usually is — then screenshots referenced from a bug report do not exist for anyone who clones the repository. Reference the attachments the HTML report itself keeps, which live beside `index.html`, or commit the evidence deliberately. Check this before citing a path as evidence.
