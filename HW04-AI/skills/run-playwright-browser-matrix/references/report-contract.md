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
