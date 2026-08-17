# Hardware and Test Environment

Generated from Windows CIM and the run metadata on 2026-08-17. Visual evidence is attached as `hardware-dxdiag.png` and shows hostname `TRAN`.

| Item | Measured value |
| --- | --- |
| Hostname | `TRAN` |
| Manufacturer / model | ASUSTeK COMPUTER INC. / Vivobook K3405VC |
| CPU | 13th Gen Intel Core i9-13900H, 20 logical processors |
| RAM | 15.68 GiB |
| GPU | Intel Iris Xe; NVIDIA GeForce RTX 3050 4 GB Laptop GPU |
| OS | Windows 11 Home Single Language, 10.0.26200 |
| Java | OpenJDK 21.0.12 LTS |
| Node.js | v24.11.0 |
| JMeter | Apache JMeter 5.6.3 |
| Load generator placement | Same host as SUT |

Because JMeter and EShop share the host, the measured ceiling belongs to the combined test environment, not to an isolated production server.

## Required visual evidence

- [x] Attach `hardware-dxdiag.png` showing hostname `TRAN`.
- [x] Confirm the hostname matches every `*.run.json` file.
- [x] Confirm the screenshot was captured on the test machine rather than substituted from another machine.
