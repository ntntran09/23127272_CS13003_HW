# Product dataset source

- Source: Bright Data Walmart product sample
- Repository: https://github.com/luminati-io/Walmart-dataset-samples
- Raw CSV: https://raw.githubusercontent.com/luminati-io/Walmart-dataset-samples/main/walmart-products.csv
- Retrieved: 2026-08-17
- Raw rows: 1,000
- Raw SHA-256: `D664235C533674547E462C60CD65700D3BA85D5DBDD732843BD9A6EBAF1A6EA6`
- Normalized file: `products.csv`
- Normalized SHA-256: `522BE1B855A2B6B6A1537167308FD54E9A6638A93A01469A3BD15CA833F3C16D`

## Normalization

- `product_name` -> `name`
- `final_price` in USD -> integer `price` in VND using a fixed test-fixture rate of 25,000 VND/USD
- `description` -> `description`
- `main_image` -> `imageUrl`
- Rows are distributed deterministically across the SUT's existing category IDs 1, 2, and 3
- Commas, quotes, tabs, and embedded newlines are removed or replaced because the current admin UI parses CSV fields with a simple comma split
- The normalized CSV is UTF-8 without BOM and is stored locally so performance runs do not depend on network access

This is a deterministic performance-test fixture. The category assignment and currency conversion are normalization rules, not claims about the source catalog.
