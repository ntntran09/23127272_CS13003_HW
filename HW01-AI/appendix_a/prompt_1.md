> From: https://gemini.google.com/app/e24d1b19fc2721f6

# you asked

message time: 2026-05-27 18:51:40

Search for 20 recent software defect (between 2022-2026), in which at least 5 of which is caused by AI. Cite articles in which the defect is mentioned. For each defect, include source link, description, severity, consequences, solution.

---

# gemini response

Here is a comprehensive list of 20 recent software defects between 2022 and 2026. The first six are explicitly caused by Artificial Intelligence (AI) failures, hallucinations, or algorithmic defects. 

---

## AI-Caused Software Defects

### 1. Air Canada Chatbot Hallucination (2023)
* **Source:** [BBC News](https://www.bbc.com/news/world-us-canada-68322204)
* **Description:** An AI-powered customer service chatbot on Air Canada's website hallucinated a fake bereavement fare refund policy that directly contradicted the airline's actual terms of service.
* **Severity:** Low operational impact, High legal/reputational impact.
* **Consequences:** A grieving passenger relied on the AI's advice, booked a flight, and was subsequently denied the refund. Air Canada was sued for breach of contract and lost.
* **Solution:** Air Canada immediately disabled the chatbot. The Civil Resolution Tribunal ordered the airline to pay damages and honor the refund the AI had promised.

### 2. ChatGPT Hallucination in *Mata v. Avianca* (2023)
* **Source:** [Reuters](https://www.reuters.com/legal/new-york-lawyers-sanctioned-using-fake-chatgpt-cases-legal-brief-2023-06-22/)
* **Description:** A lawyer used OpenAI's ChatGPT to draft a legal brief. The AI hallucinated several non-existent judicial opinions and fabricated quotes to support the legal arguments.
* **Severity:** High professional and legal impact.
* **Consequences:** The opposing counsel and the judge were unable to locate the cited cases. The lawyers involved were sanctioned, fined **$5,000**, and publicly reprimanded for failing to verify the AI's outputs.
* **Solution:** The judge struck the fake citations from the record. This case prompted several federal judges to issue standing orders requiring lawyers to disclose and verify the use of generative AI in court filings.

### 3. NEDA "Tessa" Chatbot Harmful Advice (2023)
* **Source:** [NPR](https://www.npr.org/2023/06/08/1181130635/eating-disorder-helpline-takes-down-ai-chatbot-after-it-gave-weight-loss-advice)
* **Description:** The National Eating Disorders Association (NEDA) replaced its human helpline with a wellness chatbot named "Tessa." Due to an algorithmic flaw, the AI began providing weight-loss advice and calorie-counting tips—highly dangerous recommendations for users with eating disorders.
* **Severity:** High health and safety risk.
* **Consequences:** Severe backlash from the medical community and patients, putting vulnerable individuals at immediate mental and physical risk.
* **Solution:** NEDA immediately took the chatbot offline and suspended the program indefinitely.

### 4. DPD Chatbot Swearing and Criticism (2024)
* **Source:** [BBC News](https://www.bbc.com/news/technology-68025677)
* **Description:** Following a system update, the AI chatbot for the European delivery firm DPD bypassed its guardrails. When prompted by a frustrated customer, the bot began swearing and composed a poem describing how "terrible" the company's customer service was.
* **Severity:** Low operational impact, Moderate reputational impact.
* **Consequences:** Screenshots of the interaction went viral on social media, causing significant public embarrassment for the logistics company.
* **Solution:** DPD disabled the AI component of the chatbot, reverting to human support and standard menus while they updated the system's guardrails.

### 5. NYC MyCity Business Chatbot Illegal Advice (2024)
* **Source:** [The Markup](https://themarkup.org/artificial-intelligence/2024/03/29/nycs-ai-chatbot-tells-businesses-to-break-the-law)
* **Description:** New York City launched an AI chatbot to help entrepreneurs navigate city bureaucracy. The generative AI model hallucinated and began advising business owners to violate the law (e.g., suggesting they could steal employees' tips and ignore minimum wage requirements).
* **Severity:** High legal and compliance risk.
* **Consequences:** The city faced heavy criticism from labor rights groups and tech watchdogs for distributing dangerous, illegal advice via an official government portal.
* **Solution:** NYC authorities left the chatbot online but added heavy disclaimers warning users not to trust the bot's legal advice, while engineers worked to retrain the model.

### 6. Google Gemini Historical Inaccuracies (2024)
* **Source:** [The Verge](https://www.theverge.com/2024/2/22/24080182/google-gemini-generative-ai-people-generation-halted)
* **Description:** Google's Gemini image generation model severely over-corrected for diversity, leading it to generate historically inaccurate images, such as racially diverse 1940s Nazi soldiers and Native American US Founding Fathers.
* **Severity:** Moderate reputational impact.
* **Consequences:** Widespread social media backlash and criticism regarding AI bias and the "erasure" of historical facts, causing Google's stock to briefly dip.
* **Solution:** Google temporarily paused the model's ability to generate images of people altogether while they recalibrated the underlying safety protocols.

---

## General Software Defects

### 7. CrowdStrike Falcon System Crash (2024)
* **Source:** [CNBC](https://www.cnbc.com/2024/07/19/latest-live-updates-on-a-major-it-outage-spreading-worldwide.html)
* **Description:** A faulty logic configuration in a standard sensor update (`Channel File 291`) pushed by cybersecurity firm CrowdStrike caused millions of Windows PCs and servers to crash into continuous "Blue Screen of Death" (BSOD) loops.
* **Severity:** Critical global impact.
* **Consequences:** Disrupted over 8.5 million devices globally, grounding thousands of flights, halting hospital surgeries, and taking down financial services and emergency dispatch centers. 
* **Solution:** CrowdStrike rolled back the update. However, because the machines were locked in boot loops, IT administrators had to manually boot millions of computers into Safe Mode to delete the corrupted `.sys` file.

### 8. FAA NOTAM Outage (2023)
* **Source:** [CNN](https://edition.cnn.com/2023/01/19/business/faa-notam-outage/index.html)
* **Description:** The Federal Aviation Administration's Notice to Air Missions (NOTAM) system failed because a contractor accidentally deleted files while working to synchronize a primary database with a backup database.
* **Severity:** Critical operational impact.
* **Consequences:** The FAA was forced to issue a nationwide ground stop, delaying or canceling over **11,000 flights** across the United States. 
* **Solution:** The system was completely rebooted, and corrupted files were restored from unaffected backups.

### 9. Southwest Airlines "SkySolver" Meltdown (2022)
* **Source:** [CNN](https://www.cnn.com/2022/12/31/business/southwest-airlines-meltdown-explained/index.html)
* **Description:** During a severe winter storm, Southwest's legacy crew-scheduling software, "SkySolver," became overwhelmed by the sheer volume of cancellations and lost track of where pilots and flight attendants were located.
* **Severity:** Critical operational impact.
* **Consequences:** The airline had to cancel over **16,700 flights** during the holiday season, stranding millions of passengers and costing the airline roughly **$800 million**. 
* **Solution:** Schedulers had to manually process crew assignments using pen and paper. Southwest later committed over $1 billion to overhaul its IT infrastructure.

### 10. Toyota Production Database Disk Full (2023)
* **Source:** [Reuters](https://www.reuters.com/business/autos-transportation/toyota-says-japan-production-halt-was-due-lack-disk-space-2023-09-06/)
* **Description:** An error occurred during routine database maintenance when data was deleted and reorganized. The database server ran out of disk space, causing the primary system to fail. Because the backup system was on the same network with the same capacity, it failed as well.
* **Severity:** High financial and operational impact.
* **Consequences:** Toyota had to halt operations at all 14 of its assembly plants in Japan for an entire day, severely delaying vehicle production.
* **Solution:** Engineers migrated the production data to a server with a larger storage capacity, restoring functionality. 

### 11. UK NATS Air Traffic Control Failure (2023)
* **Source:** [BBC News](https://www.bbc.com/news/business-66734796)
* **Description:** The UK's National Air Traffic Services (NATS) flight planning system encountered an anomalous piece of data in a flight plan submitted by a French airline. The software could not process the anomaly and, to prioritize safety, shut itself down.
* **Severity:** High operational impact.
* **Consequences:** Over **2,000 flights** were canceled and delayed, disrupting travel for hundreds of thousands of passengers across Europe over a busy bank holiday weekend.
* **Solution:** NATS switched to manual processing while the software vendor issued a patch to prevent the system from crashing when encountering similar formatting anomalies.

### 12. AT&T Network Cellular Outage (2024)
* **Source:** [CNN](https://www.cnn.com/2024/02/22/tech/att-cell-service-outage/index.html)
* **Description:** An error during a routine software update caused a catastrophic misconfiguration on the AT&T network, preventing cellular towers from authenticating devices.
* **Severity:** High infrastructure impact.
* **Consequences:** Tens of thousands of Americans lost cellular service and mobile internet, leaving many unable to make 911 emergency calls for several hours.
* **Solution:** AT&T engineers isolated the faulty code and successfully rolled back the network update to restore service.

### 13. NYSE CTA SIP Pricing Glitch (2024)
* **Source:** [CNBC](https://www.cnbc.com/2024/06/03/nyse-technical-issue-impacting-some-stock-prices-showing-berkshire-hathaway-down-99percent.html)
* **Description:** A software bug in the Consolidated Tape Association (CTA) system, triggered by a new software release, caused incorrect price bands to be published for several stocks.
* **Severity:** High financial impact.
* **Consequences:** Berkshire Hathaway Class A shares incorrectly plummeted by **99.9%** on the ticker, triggering automatic trading halts on dozens of stocks and causing widespread market panic.
* **Solution:** The NYSE halted trading on the affected symbols, fell back to a secondary data center, and canceled (busted) all trades executed at the erroneous prices.

### 14. McDonald’s Global POS Outage (2024)
* **Source:** [BBC News](https://www.bbc.com/news/business-68575453)
* **Description:** A third-party technology provider made a configuration change to McDonald’s global point-of-sale (POS) and ordering systems, introducing a fatal software error.
* **Severity:** High commercial impact.
* **Consequences:** Thousands of McDonald's restaurants globally (including in the UK, Australia, and Japan) were unable to process orders, forcing them to turn away customers or revert to cash and paper receipts.
* **Solution:** The erroneous configuration change was rolled back to restore the backend IT systems.

### 15. Viasat KA-SAT Malware Attack (2022)
* **Source:** [Reuters](https://www.reuters.com/world/europe/cyberattack-hit-tens-thousands-across-europe-analysts-2022-03-30/)
* **Description:** Threat actors exploited a misconfigured VPN to deploy "AcidRain" wiper malware on Viasat's network. The malware exploited the modems' firmware, wiping the flash memory and rendering the devices inoperable.
* **Severity:** Critical geopolitical/infrastructure impact.
* **Consequences:** Knocked out satellite internet for tens of thousands of users across Europe precisely as Russia invaded Ukraine, notably disabling thousands of wind turbines in Germany.
* **Solution:** Viasat pushed over-the-air firmware updates where possible but ultimately had to physically manufacture and ship tens of thousands of replacement modems to affected customers.

### 16. Optus Routing Software Glitch (2023)
* **Source:** [BBC News](https://www.bbc.com/news/world-australia-67351658)
* **Description:** Changes to routing information from a partner network exceeded the preset safety limits on Optus' core routers. The software failed to handle the overflow, causing the routers to disconnect from the internet.
* **Severity:** Critical national infrastructure impact.
* **Consequences:** More than **10 million Australians** (about 40% of the population) were left without phone or internet service for 12 hours. Train networks were halted, and hospitals could not receive calls.
* **Solution:** Engineers had to manually reboot the core routers and adjust the software routing safeguards to accept the updated data limits.

### 17. Voyager 1 Memory Corruption Glitch (2023-2024)
* **Source:** [NASA](https://www.nasa.gov/solar-system/nasas-voyager-1-resumes-sending-science-data/)
* **Description:** A single corrupted chip within Voyager 1’s Flight Data Subsystem (FDS) broke the software's ability to format telemetry. The 46-year-old probe began transmitting repetitive, unreadable gibberish.
* **Severity:** High scientific impact.
* **Consequences:** NASA lost the ability to read science or engineering data from the farthest human-made object in space for over five months.
* **Solution:** Because physical repair was impossible (the probe is 15 billion miles away), NASA engineers successfully rewrote the flight software to bypass the damaged memory sector and transmitted the patch via the Deep Space Network.

### 18. Square / Block Payment Outage (2023)
* **Source:** [CNBC](https://www.cnbc.com/2023/09/08/square-says-services-are-back-up-after-systems-outage-.html)
* **Description:** A routine software update made to Square's Domain Name System (DNS) configurations prevented servers from successfully communicating with one another.
* **Severity:** High commercial impact.
* **Consequences:** Millions of small business owners and merchants were unable to process credit card payments or access their accounts for nearly a day.
* **Solution:** Engineers reverted the flawed DNS software changes, which slowly propagated through the network and restored connectivity.

### 19. Microsoft Exchange "Y2K22" Bug (2022)
* **Source:** [Bleeping Computer](https://www.bleepingcomputer.com/news/microsoft/microsoft-releases-emergency-fix-for-exchange-year-2022-bug/)
* **Description:** Microsoft's malware scanning engine used a signed 32-bit integer variable to store the date in the format `YYMMDDHHMM`. On January 1, 2022 (`2201010001`), the value exceeded the maximum limit of a 32-bit integer (`2,147,483,647`), causing a massive software crash.
* **Severity:** High operational impact.
* **Consequences:** Email delivery ground to a halt globally for organizations using on-premises Microsoft Exchange Servers as the crashed scanning engine trapped emails in the transport queue.
* **Solution:** Microsoft released an emergency PowerShell script that manually reset the malware engine's signature update to a smaller, functional integer format. 

### 20. Slack Database Scaling Outage (2022)
* **Source:** [TechCrunch](https://techcrunch.com/2022/02/22/slack-is-down-for-some-users-around-the-world/)
* **Description:** A software bug in Slack's database infrastructure failed to properly balance the load during a spike in traffic, overwhelming the system's connection capacity.
* **Severity:** Moderate operational impact.
* **Consequences:** Millions of remote workers experienced a widespread outage, unable to load channels, send messages, or upload files for several hours. 
* **Solution:** Slack engineers intervened to rate-limit database requests, successfully balancing the load and provisioning additional server capacity.