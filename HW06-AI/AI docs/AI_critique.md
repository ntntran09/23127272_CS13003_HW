# AI Critique

The AI was effective at expanding a compact specification into systematic domain
partitions, boundary values, security traces (SEC-01-SEC-07), JSON-schema
assertions, and an executable Postman collection for the login, add-to-cart, and
create-product endpoints. Its output was, however, incomplete in two important
ways. First, it organised generation mainly around single request-response pairs
and under-weighted cross-request behaviour. Cases for the fast-advancing
failed-login lockout counter, the cart appending a duplicate row instead of
merging quantity, the cart trusting a client-supplied price and name, and
read-after-write persistence on product creation were only strengthened after I
compared the generated suite against the contract and added student-origin
extensions. These behaviours require reasoning about state across several calls,
which a prompt centred on parameters and status codes tends to miss. Second, the
AI-driven execution harness was initially wrong: the first run used a stale
collection from the wrong working directory against a SUT process on port 3000
that could not be reset, producing misleading failures. I caught this by reading
the full run instead of trusting the failure count, then isolated a clean SUT
instance on port 3001 from the pinned commit and re-ran deterministically, after
which the harness reported zero request or script failures. The AI also asserted
some status expectations more confidently than the specification justified, so I
kept the spec as the oracle and grouped related symptoms into nine genuine bug
groups rather than one bug per failed assertion. My main lesson is that
collaborating with AI needs two independent reviews - of the test oracle and of
the test mechanism. High coverage is not credible when prerequisites, timing,
working directory, or evidence provenance are wrong. AI accelerates enumeration
and automation, but the student must control state, audit assumptions, reproduce
findings, and refuse fabricated evidence.
