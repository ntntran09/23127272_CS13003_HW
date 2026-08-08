# EShop Playwright Automation

Data-driven browser automation for FR-03, FR-11, and FR-14. The EShop SUT must be running on ports 3000, 5173, and 5174.

## Commands

```powershell
npm install
npx playwright install
npm run validate:data
npm test
npm run test:matrix
npm run validate:reports
```

`npm run test:matrix` creates nine independent HTML reports for Chromium, Google Chrome, and Microsoft Edge under `reports/<feature>/<browser>/`. Every report title includes `Run by: 23127272` and an ISO timestamp.

Expected product defects are asserted against the published requirements. A failing test is not automatically a confirmed bug; reproduce it and review the trace/screenshot before reporting it.
