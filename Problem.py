#!/usr/bin/env python3
"""
Backend Engineering Problems Search
Search through 150 backend engineering problems and their algorithm solutions.
"""

import re
import sys
import os

# ── Raw problem data ──────────────────────────────────────────────────────────
PROBLEMS_MD = r"""
### 1. Slow database queries degrading response times
**Algorithm:** Query Optimization + B-Tree Index
B-Tree indexes let the database locate rows in O(log n) instead of O(n) full scans. Analyze query plans with `EXPLAIN`, add composite indexes on high-cardinality columns, and avoid `SELECT *`. Never index low-cardinality columns like booleans — the planner will skip them anyway.
**Category:** Performance

### 2. N+1 query problem causing excessive DB calls
**Algorithm:** Eager Loading (JOIN / DataLoader Batching)
Instead of one query per related row, batch all IDs and fetch with a single JOIN or `IN` clause. GraphQL uses the DataLoader pattern to deduplicate and batch within a single request tick. Detecting N+1 requires query-count logging in development.
**Category:** Performance

### 3. Unoptimized full-text search returning slow results
**Algorithm:** Inverted Index (Elasticsearch / Trie)
An inverted index maps each token to the list of documents containing it, enabling O(1) term lookup. Trie structures accelerate prefix searches. Deploy Elasticsearch or PostgreSQL's `tsvector` for production search. Never use `LIKE '%query%'` on large tables — it disables index usage.
**Category:** Performance

### 4. Memory leaks crashing services over time
**Algorithm:** Mark-and-Sweep Garbage Collection + Profiling
Mark-and-sweep traverses object graphs, marking reachable nodes and sweeping unreachable ones. Use heap profilers (`node --inspect`, Java Flight Recorder) to identify retained references and fix circular dependencies. Common culprits: event listener accumulation, unclosed streams, and static caches with no eviction.
**Category:** Performance

### 5. Slow image and asset delivery to users
**Algorithm:** Content Delivery Network + LRU Cache
CDNs place assets on edge nodes close to users. The Least Recently Used (LRU) eviction policy — implemented as a hash map + doubly linked list (O(1) get/put) — keeps hot assets warm and evicts cold ones. Always set `Cache-Control: immutable` on content-addressed assets.
**Category:** Performance

### 6. High CPU usage during peak traffic
**Algorithm:** Load Shedding + Token Bucket
When CPU exceeds a threshold, the token bucket algorithm drops or queues excess requests at a controlled rate (tokens refill at rate r, burst capacity b), preventing cascade failures. Combine with a priority queue to shed lowest-priority requests first.
**Category:** Performance

### 7. Inefficient in-memory sorting of large datasets
**Algorithm:** Merge Sort / External Merge Sort
Merge sort is stable and O(n log n) in all cases. For datasets larger than RAM, external merge sort splits data into sorted runs on disk and merges them with a min-heap priority queue. Avoid quicksort for datasets with high duplication — use introsort (hybrid) instead.
**Category:** Performance

### 8. Repeated expensive computation on every request
**Algorithm:** Memoization + Cache-Aside Pattern
Store function results keyed by inputs in a fast store (Redis). On a cache miss, compute and store; on a hit, return immediately. Reduces repeated computation from O(n) to O(1) amortized. Always set a TTL to prevent stale data accumulation.
**Category:** Performance

### 9. Blocking synchronous calls in async code paths
**Algorithm:** Event Loop + Promise Pipelining
Move I/O-bound work off the main thread using non-blocking I/O. Chain Promises or use `async/await` to pipeline requests. CPU-bound work goes into worker threads to avoid starving the event loop. In Node.js, even a 100ms CPU loop blocks all concurrent requests.
**Category:** Performance

### 10. Slow startup time for large monolithic applications
**Algorithm:** Lazy Loading + Dependency Graph Topological Sort
Topological sort (Kahn's algorithm) finds a valid initialization order for modules. Lazy-load modules only when first needed, reducing cold-start time for rarely-used code paths. Measure startup with flamegraphs to identify the heaviest initializers.
**Category:** Performance

### 11. Slow response from third-party payment gateways
**Algorithm:** Async Processing + Circuit Breaker
Offload payment calls to async workers. A circuit breaker monitors failure rate; if the gateway degrades, the circuit opens and queues payments for later replay, keeping the checkout flow responsive to users. Never make synchronous payment calls in the request path with no timeout.
**Category:** Performance

### 12. Slow report generation blocking the web server
**Algorithm:** Offline Processing + Pre-aggregation with Materialized Views
Move report generation to background workers triggered by user request. Pre-aggregate common metrics into materialized views refreshed on a schedule. Serve cached reports instantly; mark them with a last-updated timestamp. Email delivery or webhooks notify users when reports are ready.
**Category:** Performance

### 13. Excessive garbage collection pauses causing latency spikes
**Algorithm:** Generational GC Tuning + Off-Heap Memory (Netty / Arrow)
Generational GC separates short-lived and long-lived objects, reducing full GC frequency. For latency-sensitive services, move large buffers off-heap (JVM: `DirectByteBuffer`, Netty `PooledByteBufAllocator`), which GC never touches. Monitor GC pause time as a key SLI alongside p99 latency.
**Category:** Performance

### 14. Cold starts degrading serverless function latency
**Algorithm:** Provisioned Concurrency + Warm Pool Pre-warming
Provisioned concurrency keeps a configurable number of Lambda/Cloud Function instances initialized and ready. For bursty workloads, a warm pool pre-initializes instances asynchronously during low-traffic periods, eliminating cold start latency at peak. Minimize package size to reduce initialization time.
**Category:** Performance

### 15. Database connection overhead in serverless environments
**Algorithm:** Connection Proxy (RDS Proxy / PgBouncer) + Pool Multiplexing
Serverless functions create a new DB connection per invocation. A connection proxy (RDS Proxy, PgBouncer) maintains a persistent pool and multiplexes many function connections onto a small set of DB connections, staying within DB connection limits. This is non-negotiable at scale.
**Category:** Performance

### 16. Autocomplete search latency frustrating users
**Algorithm:** Ternary Search Trie + Ranked Prefix Cache
A Ternary Search Trie stores the suggestion corpus with O(m) lookup where m is the prefix length. Pre-rank suggestions by frequency/relevance. Cache top-k results for the most common prefixes in Redis for sub-millisecond response. Target < 50ms end-to-end for autocomplete to feel instant.
**Category:** Performance

### 17. Real-time leaderboard updates causing DB contention
**Algorithm:** Redis Sorted Set (ZADD/ZRANK) + Batched Score Updates
Redis Sorted Sets store member-score pairs in a skip list, providing O(log n) `ZADD`, `ZRANK`, and range queries. Batch score updates into pipeline commands and flush every 100ms to avoid per-event DB writes at high throughput. Never use a relational DB for real-time ranking.
**Category:** Performance

### 18. Slow geospatial queries for location-based features
**Algorithm:** Geohash Indexing + R-Tree Spatial Index
Geohash encodes lat/lon into a hierarchical string; nearby points share a common prefix, enabling prefix-indexed DB queries. R-Trees (used in PostGIS) index minimum bounding rectangles, supporting efficient k-nearest-neighbor searches. Use `ST_DWithin` with a spatial index, not `ST_Distance` in a WHERE clause.
**Category:** Performance

### 19. Object serialization too slow for high-throughput APIs
**Algorithm:** Zero-Copy Serialization (FlatBuffers / Cap'n Proto)
FlatBuffers and Cap'n Proto encode data in a format that can be read directly from the network buffer without parsing or memory allocation (zero-copy). This reduces serialization overhead by 5–20x compared to Protocol Buffers for read-heavy workloads. Best suited for internal service communication.
**Category:** Performance

### 20. Repeated full-page server-side renders degrading throughput
**Algorithm:** Fragment Caching + Edge-Side Includes (ESI)
Break pages into independently cacheable fragments. Cache slow-changing fragments (navigation, product descriptions) at the CDN edge. ESI assembles fragments at the edge without hitting the origin. Only dynamic, user-specific fragments reach the application server.
**Category:** Performance

### 21. Single server becoming a bottleneck under load
**Algorithm:** Horizontal Scaling + Consistent Hashing
Consistent hashing maps requests to servers on a virtual ring. Adding or removing a server only remaps 1/n of keys, minimizing cache churn while distributing load evenly across nodes. Use a stateless application tier so any node can handle any request.
**Category:** Scalability

### 22. Database becoming a write bottleneck
**Algorithm:** Write-Ahead Log + CQRS with Event Sourcing
WAL appends mutations sequentially (fast I/O), and CQRS separates write (command) and read (query) models. Event sourcing rebuilds state from an ordered event log, enabling independent scaling of reads and writes. The event log also serves as a complete audit trail.
**Category:** Scalability

### 23. Session state preventing stateless scaling
**Algorithm:** JWT + Distributed Session Store (Redis Cluster)
JWTs encode session state as a signed token, eliminating server-side session lookup. When state is required server-side, Redis Cluster with consistent hashing provides O(1) distributed session access. Keep JWT payloads small — they're sent on every request.
**Category:** Scalability

### 24. Hot partition in distributed databases
**Algorithm:** Virtual Nodes + Consistent Hashing
Virtual nodes (vnodes) assign each physical server multiple positions on the hash ring, spreading hot keys across more machines and balancing load even when data is not uniformly distributed. Monitor partition heat with per-shard metrics.
**Category:** Scalability

### 25. Message queue becoming a single point of failure
**Algorithm:** Replication + Raft Consensus
Raft elects a leader that replicates log entries to a majority quorum before committing. If the leader fails, a new election completes in milliseconds, ensuring queue durability without data loss. Kafka's replication factor of 3 with `min.insync.replicas=2` implements this pattern.
**Category:** Scalability

### 26. Microservices failing to discover each other dynamically
**Algorithm:** Service Registry + Gossip Protocol
Gossip (epidemic) protocol disseminates health and address information in O(log n) rounds. Each node periodically exchanges state with random peers, providing eventual consistency without a central coordinator. Consul and etcd are the standard implementations.
**Category:** Scalability

### 27. Thundering herd on cache expiry
**Algorithm:** Probabilistic Early Expiration + Mutex Lock
PER algorithm recomputes a cache entry slightly before expiry (probability increases as TTL approaches zero), preventing all servers from simultaneously computing the same expensive value on expiry. A distributed mutex (Redlock) ensures only one worker recomputes at a time.
**Category:** Scalability

### 28. Fan-out bottleneck in social feed generation
**Algorithm:** Hybrid Push-Pull Fan-out with Priority Queue
For low-follower accounts, push posts to follower timelines at write time. For celebrities, use pull fan-out at read time. A priority queue (heap) merges sorted post streams in O(k log k) where k is feed sources. Twitter uses this hybrid approach for its timeline.
**Category:** Scalability

### 29. Connection pool exhaustion under high concurrency
**Algorithm:** Leaky Bucket + Semaphore
A semaphore limits concurrent DB connections. Excess requests enter a leaky bucket queue draining at a fixed rate, smoothing spikes. Requests exceeding bucket capacity receive a 503, protecting the DB from connection storm. Always set a maximum queue timeout.
**Category:** Scalability

### 30. Uneven load distribution across microservices
**Algorithm:** Weighted Round Robin + Least Connections
Least Connections routing always directs new requests to the backend with the fewest active connections, balancing heterogeneous workloads better than simple round robin when request durations vary significantly.
**Category:** Scalability

### 31. Monolith deployment blocking individual feature releases
**Algorithm:** Strangler Fig Pattern + Feature Toggles
Strangler Fig incrementally extracts functionality into microservices, routing traffic at the API gateway. Feature toggles let teams deploy code dark (off) and enable it independently of the release cycle. This de-risks large migrations by allowing parallel running of old and new code.
**Category:** Scalability

### 32. Search indexes becoming stale in high-write environments
**Algorithm:** Near-Real-Time Indexing + Change Data Capture
CDC captures row-level changes from the WAL and streams them to the search index (Elasticsearch) via Kafka. Near-real-time refresh (NRT) makes indexed documents searchable within ~1 second of commit, balancing freshness and throughput.
**Category:** Scalability

### 33. Event-driven system losing messages during consumer downtime
**Algorithm:** Durable Message Queue + At-Least-Once Delivery with Dead Letter Queue
Persist messages to disk (Kafka log, SQS). Consumers acknowledge messages only after successful processing; unacknowledged messages are redelivered. After N retries, route to a Dead Letter Queue for inspection and manual replay. Monitor DLQ depth as an operational metric.
**Category:** Scalability

### 34. Multi-tenant system leaking data between tenants
**Algorithm:** Row-Level Security (RLS) + Tenant-Aware Connection Pool
PostgreSQL RLS attaches a `tenant_id` predicate to every query automatically, making cross-tenant leaks impossible even with application bugs. A tenant-aware connection pool sets the session's tenant context before handing the connection to application code.
**Category:** Scalability

### 35. Rate limit bypass via distributed client IPs
**Algorithm:** Sliding Window Counter + Distributed Counter (Redis + Lua)
A Lua script in Redis atomically increments a per-key sliding window counter and checks the limit in a single round trip, preventing race conditions. Distribute the counter across Redis Cluster shards for throughput scaling. Combine user ID and IP for layered protection.
**Category:** Scalability

### 36. Database read replicas lagging too far behind primary
**Algorithm:** Semi-Synchronous Replication + Read-Your-Writes Routing
Semi-synchronous replication waits for at least one replica to acknowledge before the primary commits, bounding replication lag. Route read-after-write queries for a session to the primary (or a sufficiently caught-up replica) using lag-aware middleware.
**Category:** Scalability

### 37. Overwhelming downstream services during batch processing
**Algorithm:** Token Bucket Rate Limiter + Adaptive Throttling
Apply a token bucket at the batch producer to cap outbound RPS to downstream services. Adaptive throttling (Google's client-side throttling) automatically backs off when downstream error rates rise, without central coordination. Batch jobs should never run at full speed against production APIs.
**Category:** Scalability

### 38. Cascading failures across microservices
**Algorithm:** Circuit Breaker (Hystrix / Resilience4j)
The circuit breaker tracks failure rates over a sliding window. When failures exceed a threshold, the circuit opens and fails fast (no network call), giving downstream services time to recover before retrying. The half-open state tests recovery with a single probe request.
**Category:** Reliability

### 39. Data loss during server crashes
**Algorithm:** Write-Ahead Logging (WAL) + Checkpointing
Every mutation is appended to the WAL before being applied. On crash recovery, the system replays uncommitted WAL entries, restoring the exact pre-crash state. Periodic checkpoints bound recovery time by limiting how far back the log must be replayed.
**Category:** Reliability

### 40. Partial failures leaving data in inconsistent state
**Algorithm:** Two-Phase Commit (2PC) / Saga Pattern
2PC uses a coordinator to lock resources and commit only when all participants agree. For long-lived transactions across services, the Saga pattern executes a sequence of local transactions with compensating rollbacks on failure. 2PC is synchronous and blocking; Saga is asynchronous and choreography-based.
**Category:** Reliability

### 41. Retries causing duplicate operations
**Algorithm:** Idempotency Keys + Exactly-Once Semantics
Assign a unique idempotency key to each operation. Before executing, check a deduplication store (Redis `SET NX`). If the key exists, return the cached response. Guarantees at-most-once side effects even when the network delivers a request multiple times.
**Category:** Reliability

### 42. Flaky third-party API integrations
**Algorithm:** Exponential Backoff with Jitter + Retry Budget
Exponential backoff waits `2^n * base_delay` between retries. Adding random jitter (full or decorrelated) desynchronizes retry storms. A retry budget caps total retries per time window to prevent resource exhaustion during extended outages.
**Category:** Reliability

### 43. Silent data corruption going undetected
**Algorithm:** Checksums + Merkle Trees
Merkle trees hash data blocks bottom-up; the root hash represents the entire dataset. Comparing roots instantly detects any corruption. Only differing subtrees need transfer during replication verification. Amazon S3 uses this for end-to-end integrity checks.
**Category:** Reliability

### 44. Zero-downtime deployments failing mid-rollout
**Algorithm:** Blue-Green Deployment + Feature Flags
Blue-green maintains two identical environments. Traffic switches atomically at the load balancer. Feature flags (evaluated server-side) allow percentage rollouts and instant kill-switches without redeployment. Database migrations must be backward-compatible before any traffic switch.
**Category:** Reliability

### 45. Timeout misconfiguration causing user-facing errors
**Algorithm:** Adaptive Timeout + Deadline Propagation
Propagate a request deadline (remaining time) through all service calls via headers. Each service deducts its processing time and sets its downstream timeout accordingly, preventing wasted work on already-expired requests. Never use the same timeout for all downstream calls.
**Category:** Reliability

### 46. Health checks not reflecting true service readiness
**Algorithm:** Readiness vs Liveness Probes + Dependency Graph
Liveness probes restart crashed processes. Readiness probes prevent traffic until all dependencies (DB, cache, downstream services) are reachable. Map dependencies as a DAG and check only critical-path nodes. Deep health checks that query the DB are better than shallow TCP checks.
**Category:** Reliability

### 47. Runaway background jobs consuming all resources
**Algorithm:** Work-Stealing Scheduler + Priority Queue
A work-stealing thread pool lets idle workers steal tasks from busy workers' deques, maximizing CPU utilization. A priority heap ensures high-priority jobs preempt background tasks under resource pressure. Always set CPU and memory limits on background job workers.
**Category:** Reliability

### 48. Logs not captured during container crashes
**Algorithm:** Sidecar Log Aggregation + Structured Logging
A sidecar container (Fluentd/Filebeat) tails stdout/stderr and ships logs to a central store before crash. Structured JSON logs with correlation IDs enable distributed tracing across services using tools like Jaeger or Zipkin.
**Category:** Reliability

### 49. Alert fatigue from too many false-positive monitors
**Algorithm:** Anomaly Detection + Composite Alerting (Sliding Window)
Replace threshold alerts with statistical anomaly detection (Z-score, CUSUM) that adapts to seasonal patterns. Composite alerts require multiple signals (latency AND error rate) to fire together, dramatically reducing false positives.
**Category:** Reliability

### 50. Configuration drift between environments causing prod-only bugs
**Algorithm:** Infrastructure as Code + Immutable Deployments
IaC (Terraform, Pulumi) version-controls all environment config. Immutable deployments build new server images for each release rather than mutating existing ones, eliminating configuration drift and making rollback instantaneous.
**Category:** Reliability

### 51. SQL injection attacks compromising the database
**Algorithm:** Parameterized Queries + Input Sanitization
Parameterized queries separate code from data at the protocol level; user input is never interpolated into SQL. Input sanitization using allowlists (regex) provides defense-in-depth against unexpected characters. ORMs don't eliminate injection risk if raw query methods are used carelessly.
**Category:** Security

### 52. Brute force attacks on authentication endpoints
**Algorithm:** Rate Limiting + Exponential Lockout (Token Bucket)
Track failed attempts per IP and account using a sliding window counter. After N failures, apply exponential lockout. A token bucket at the API gateway globally rate-limits the login endpoint regardless of attacker IP rotation.
**Category:** Security

### 53. Session hijacking via stolen tokens
**Algorithm:** HMAC Token Signing + Token Rotation
HMAC (keyed hash) signs tokens with a server-side secret, making forgery computationally infeasible. Rotate refresh tokens on each use (rotation + invalidation of old token) to detect and terminate stolen sessions immediately.
**Category:** Security

### 54. Man-in-the-middle attacks on API traffic
**Algorithm:** TLS 1.3 + Certificate Pinning
TLS 1.3 reduces handshake to one round trip and removes weak cipher suites. Certificate pinning embeds the expected certificate hash in the client, preventing interception even with a rogue CA. Pin the public key, not the leaf certificate, to survive certificate renewal.
**Category:** Security

### 55. Secrets and credentials leaked in logs or repos
**Algorithm:** Secret Management + HashiCorp Vault Dynamic Secrets
Vault generates short-lived, auto-rotating credentials on demand. Services authenticate to Vault via identity (IAM role, k8s service account) and receive credentials that expire automatically, limiting exposure windows. Run `git-secrets` or `trufflehog` in CI to catch accidental commits.
**Category:** Security

### 56. IDOR allowing access to other users' data
**Algorithm:** Attribute-Based Access Control (ABAC)
ABAC evaluates policies based on user attributes, resource attributes, and environment. Resource IDs are validated against ownership tables before access, eliminating predictable ID enumeration attacks. Never expose sequential integer IDs; use UUIDs or opaque tokens.
**Category:** Security

### 57. DDoS attacks overwhelming the API gateway
**Algorithm:** Anycast Routing + Rate Limiting with Sliding Window
Anycast routes attack traffic to the nearest scrubbing center. Sliding window counters (per IP, per endpoint) enforce per-second limits. SYN cookies prevent TCP connection exhaustion without allocating server state. A WAF provides application-layer filtering on top.
**Category:** Security

### 58. Insecure deserialization executing arbitrary code
**Algorithm:** Schema Validation + Allowlist Deserialization
Validate all incoming payloads against strict JSON Schema before deserialization. Use allowlists of permitted types. Disable polymorphic deserialization in frameworks (e.g., Jackson default typing) entirely. Never deserialize untrusted data into generic `Object` types.
**Category:** Security

### 59. Weak password storage enabling credential dumping
**Algorithm:** Bcrypt / Argon2 Adaptive Hashing
Argon2id is memory-hard and time-hard, making GPU-based cracking expensive. The cost factor is tunable as hardware improves. Never use MD5/SHA1 for passwords; always use a purpose-built password hashing algorithm. Include a server-side pepper for an additional layer.
**Category:** Security

### 60. Overly permissive CORS allowing data exfiltration
**Algorithm:** Origin Allowlist + Preflight Validation
Maintain a server-side allowlist of permitted origins. Validate the `Origin` header on every cross-origin request, including preflight `OPTIONS`. Wildcard (`*`) CORS is never acceptable for authenticated endpoints. Set `Vary: Origin` to prevent cache poisoning.
**Category:** Security

### 61. Exposed internal stack traces in error responses
**Algorithm:** Exception Shielding + Correlation ID Logging
Catch all unhandled exceptions at the API boundary and return a generic error with a correlation ID. Log the full stack trace server-side, keyed by the correlation ID. The client gets enough to report the issue without seeing internals or file paths.
**Category:** Security

### 62. Unvalidated redirects enabling phishing attacks
**Algorithm:** Redirect Allowlist + HMAC-Signed Redirect Tokens
Maintain a server-side allowlist of permitted redirect destinations. For dynamic redirects, sign the destination URL with HMAC; the server verifies the signature before redirecting, preventing open redirect manipulation.
**Category:** Security

### 63. JWT tokens not expiring after logout
**Algorithm:** Token Denylist + Short-Lived Tokens + Refresh Rotation
Short access token TTLs (5–15 min) limit exposure. On logout, add the token's `jti` claim to a Redis denylist checked on every request. Refresh token rotation issues a new refresh token and invalidates the old one on each use.
**Category:** Security

### 64. Sensitive PII appearing in application logs
**Algorithm:** Log Scrubbing + Field-Level Encryption
A log scrubbing middleware applies regex/pattern matching to redact PII (emails, SSNs, credit card numbers) before the log is written. Field-level encryption at the DB layer ensures PII is unreadable even in raw storage dumps.
**Category:** Security

### 65. Supply chain attacks via compromised npm/pip packages
**Algorithm:** Dependency Pinning + Lockfile Integrity Verification
Pin all dependencies to exact versions in lockfiles (`package-lock.json`, `poetry.lock`). Verify lockfile integrity hashes in CI. Use private registries (Artifactory, AWS CodeArtifact) as a mirror to quarantine new packages for scanning before they reach production.
**Category:** Security

### 66. Privilege escalation through misconfigured IAM roles
**Algorithm:** Principle of Least Privilege + Permission Boundary Policies
Permission boundaries cap the maximum permissions an IAM role can grant, even if the role's policy is overly broad. Use policy analyzers (AWS IAM Access Analyzer) to detect overprivileged policies and enforce least-privilege automatically.
**Category:** Security

### 67. Insufficient audit trail for compliance requirements
**Algorithm:** Append-Only Audit Log + Merkle Chain of Custody
Audit events are written to an append-only log (no `UPDATE`/`DELETE`). Each log entry includes a hash of the previous entry, forming a Merkle chain. Any tampering breaks the chain, providing cryptographic proof of log integrity for SOC 2, HIPAA, and GDPR compliance.
**Category:** Security

### 68. Database schema migrations breaking production
**Algorithm:** Expand-Contract Pattern + Online Schema Change
Expand: add new columns/tables without removing old ones. Migrate data in batches (`pt-online-schema-change`). Contract: remove old schema once all code references are removed. Zero downtime at each step. Never `DROP COLUMN` in the same deploy that removes the code reference.
**Category:** Data

### 69. Unbounded data growth exhausting storage
**Algorithm:** Time-to-Live (TTL) + Log-Structured Merge Tree
LSM trees (used in Cassandra, RocksDB) batch writes into sorted immutable SSTables and compact them in the background. TTL tombstones expire old records during compaction, automatically reclaiming space. Monitor compaction lag as a leading indicator of write amplification.
**Category:** Data

### 70. Stale cache serving outdated data
**Algorithm:** Cache Invalidation + Write-Through Caching
Write-through updates the cache and database atomically on every write, ensuring cache coherence. For complex invalidation, use event-driven invalidation: publish a cache-bust event on data mutation. "Cache invalidation is one of the two hard things in computer science."
**Category:** Data

### 71. Slow analytics queries on transactional database
**Algorithm:** OLAP Columnar Storage + Materialized Views
Columnar stores (Parquet, Redshift) read only queried columns, dramatically reducing I/O for aggregations. Materialized views precompute expensive aggregations and refresh incrementally using delta processing. Never run heavy analytics on your OLTP database.
**Category:** Data

### 72. Race conditions in concurrent data updates
**Algorithm:** Optimistic Concurrency Control + MVCC
MVCC (PostgreSQL, MySQL InnoDB) maintains multiple row versions. Readers never block writers. Optimistic concurrency validates that the row version hasn't changed before committing, rolling back on conflict. Ideal for read-heavy workloads where conflicts are rare.
**Category:** Data

### 73. Data skew causing uneven partition processing
**Algorithm:** Salting + Partition Pruning
Append a random salt to hot keys before hashing, distributing them across multiple partitions. At read time, query all salt partitions and aggregate results. Partition pruning eliminates irrelevant partitions at plan time, recovering the performance lost to salting.
**Category:** Data

### 74. Loss of event ordering in distributed streams
**Algorithm:** Lamport Timestamps / Vector Clocks
Lamport timestamps assign a monotonically increasing logical clock to each event. Vector clocks extend this to track causality between events across nodes, enabling correct total ordering even without synchronized clocks. Critical for financial event logs and audit trails.
**Category:** Data

### 75. Inefficient pagination on large tables
**Algorithm:** Keyset Pagination (Seek Method)
Instead of `OFFSET` (which scans and discards rows), keyset pagination uses `WHERE id > last_seen_id ORDER BY id LIMIT n`. This is O(log n) with an index and performs identically on page 1 and page 10,000. Offset pagination degrades linearly — page 500 scans 500 * page_size rows.
**Category:** Data

### 76. Cross-service data inconsistency in microservices
**Algorithm:** Outbox Pattern + Change Data Capture
The Outbox pattern writes events to an outbox table in the same DB transaction as the business operation. CDC (Debezium) streams committed changes from the WAL to message brokers, guaranteeing at-least-once delivery without two-phase commit across systems.
**Category:** Data

### 77. Inefficient graph traversal for relationship queries
**Algorithm:** BFS / Dijkstra's Algorithm on Graph DB
For friend-of-friend or shortest-path queries, store data in a graph DB (Neo4j). Dijkstra's algorithm finds shortest weighted paths in O((V+E) log V) using a min-heap, far faster than recursive relational `JOIN` chains that explode combinatorially.
**Category:** Data

### 78. Time zone handling bugs corrupting timestamp data
**Algorithm:** UTC Normalization + Zoned DateTime (ISO 8601)
Always store timestamps as UTC in the database. Convert to local time only at the presentation layer using IANA tz database identifiers. Use ISO 8601 format in APIs to avoid ambiguous locale-dependent date strings. Never store timezone-naive datetimes in a multi-region system.
**Category:** Data

### 79. Schema drift between services breaking integrations
**Algorithm:** Schema Registry + Avro / Protobuf Compatibility Checks
A schema registry enforces compatibility rules (backward, forward, full) on every schema publish. Producers and consumers negotiate the schema version at runtime. Avro/Protobuf support optional fields to handle evolution gracefully.
**Category:** Data

### 80. Duplicate records being inserted under concurrent writes
**Algorithm:** Unique Constraint + Upsert (INSERT ON CONFLICT)
A DB-level unique constraint is the last line of defense against duplicates. Use `INSERT ... ON CONFLICT DO UPDATE` (PostgreSQL) or `INSERT IGNORE` (MySQL) to atomically insert or update without a separate `SELECT + INSERT` race condition.
**Category:** Data

### 81. Float precision errors causing incorrect financial calculations
**Algorithm:** Arbitrary Precision Arithmetic (Decimal / BigDecimal)
IEEE 754 floats cannot represent most decimal fractions exactly. Use a fixed-point `Decimal` type (Python `Decimal`, Java `BigDecimal`, Postgres `NUMERIC`) for all monetary values. Store amounts as integer cents to eliminate floating-point arithmetic entirely.
**Category:** Data

### 82. Slow bulk data imports degrading production DB performance
**Algorithm:** Bulk Load (COPY) + Staging Table + Batch Upsert
PostgreSQL `COPY` loads CSV data 10–50x faster than row-by-row `INSERT` by bypassing per-row overhead. Load into a staging table first, then apply a single `MERGE`/`UPSERT` to the production table during a low-traffic window. Disable indexes during bulk load, then rebuild.
**Category:** Data

### 83. Uncontrolled table bloat from soft-deleted rows
**Algorithm:** Partial Index + Partitioned Archival Table
A partial index (`WHERE deleted_at IS NULL`) serves active-record queries without indexing deleted rows, keeping index size small. Partition the table by date; detach and archive old partitions without expensive `DELETE` operations or `VACUUM`. This keeps index bloat bounded permanently.
**Category:** Data

### 84. GDPR right-to-erasure requests difficult to fulfill
**Algorithm:** Data Segregation + Crypto-Shredding
Encrypt each user's PII with a unique per-user key stored in a key management service. On erasure request, delete the key — all encrypted data becomes permanently unreadable without touching backup tapes or data warehouse rows. This is the only scalable erasure strategy.
**Category:** Data

### 85. Backup and restore too slow for acceptable RPO/RTO
**Algorithm:** Incremental Backup + Parallel Restore with WAL Replay
Incremental backups capture only changed blocks since the last full backup (file-level or block-level diff). Parallel restore spreads data across multiple workers. WAL replay catches up changes that occurred during restore. Test restores regularly — untested backups are not backups.
**Category:** Data

### 86. Deadlocks freezing database transactions
**Algorithm:** Wait-For Graph + Lock Ordering
Deadlock detection builds a wait-for graph; a cycle means deadlock. Prevention enforces consistent lock acquisition order across all transactions, making cycles impossible. The DB's deadlock detector breaks ties by killing the youngest transaction. Consistent ordering is the most reliable prevention strategy.
**Category:** Concurrency

### 87. Race conditions in shared memory across threads
**Algorithm:** Mutex / Read-Write Lock + Lock-Free CAS
Read-write locks allow concurrent reads but exclusive writes. For high-contention counters, lock-free Compare-And-Swap (CAS) atomically updates a value only if it matches the expected state, avoiding mutex overhead entirely. Profile before optimizing — mutex overhead is often negligible.
**Category:** Concurrency

### 88. Thread pool starvation under bursty load
**Algorithm:** Bulkhead Pattern + Dynamic Thread Pool Sizing
Bulkheads isolate thread pools by resource type (DB, HTTP, CPU). Each pool has its own queue and concurrency limit. Dynamic sizing adjusts pool size based on queue depth and latency metrics at runtime. Without bulkheads, one slow downstream service starves all others.
**Category:** Concurrency

### 89. Spinning on locks wasting CPU cycles
**Algorithm:** Adaptive Mutex (Spin then Sleep)
Adaptive mutexes spin briefly (checking if the lock owner is running) before yielding the CPU to the OS scheduler. This avoids context switch overhead for short critical sections while not wasting CPU on long waits. Linux `futex` implements this behavior natively.
**Category:** Concurrency

### 90. ABA problem in lock-free data structures
**Algorithm:** Tagged Pointer + Hazard Pointers
The ABA problem occurs when a value changes A→B→A between CAS checks. Tagged pointers append a version counter to each pointer; the counter increment detects the intermediate change. Hazard pointers prevent premature memory reclamation in concurrent linked structures.
**Category:** Concurrency

### 91. Goroutine / thread leaks consuming resources
**Algorithm:** Context Cancellation + Bounded Worker Pool
Go contexts propagate cancellation signals down the call chain. Worker pools with a fixed goroutine count and a buffered channel queue prevent unbounded goroutine spawning. Always defer cleanup in spawned goroutines. Leak detection: `runtime.NumGoroutine()` trending upward is the signal.
**Category:** Concurrency

### 92. Phantom reads causing incorrect business logic
**Algorithm:** Serializable Snapshot Isolation (SSI)
SSI detects read-write conflicts between concurrent transactions (dangerous structures) and aborts one. It provides serializable correctness with the performance of snapshot isolation, avoiding full table locking. PostgreSQL implements SSI natively at the `SERIALIZABLE` isolation level.
**Category:** Concurrency

### 93. Priority inversion blocking high-priority tasks
**Algorithm:** Priority Inheritance Protocol
When a low-priority thread holds a lock needed by a high-priority thread, priority inheritance temporarily elevates the lock holder's priority to that of the waiter, preventing medium-priority threads from preempting it. This is implemented in POSIX mutexes with `PTHREAD_PRIO_INHERIT`.
**Category:** Concurrency

### 94. Unsafe lazy initialization in multi-threaded code
**Algorithm:** Double-Checked Locking + Memory Barrier
Double-checked locking checks the initialized flag before and after acquiring the lock. A memory barrier (`volatile` in Java, `atomic` in C++) ensures the write to the instance is visible to all threads before the flag is set. Without the memory barrier, partially-constructed objects can be observed.
**Category:** Concurrency

### 95. Event loop blocking on CPU-intensive operations
**Algorithm:** Worker Threads + Task Decomposition
Offload CPU-bound tasks (image processing, crypto) to worker threads or processes (`Node.js worker_threads`, Python `ProcessPoolExecutor`). Decompose large tasks into smaller chunks using a work queue to maintain responsiveness. Even a 50ms CPU block degrades all concurrent WebSocket clients.
**Category:** Concurrency

### 96. Distributed cron jobs running multiple times
**Algorithm:** Distributed Lock (Redlock) + Leader Election
Redlock acquires a lock across N Redis nodes (majority quorum) with a TTL. Only the lock holder runs the job. For long-running jobs, extend the lock before TTL expiry. Leader election (Zookeeper/etcd) provides a more robust alternative for mission-critical scheduled tasks.
**Category:** Concurrency

### 97. Long database transactions blocking other queries
**Algorithm:** Short Transaction Idiom + Optimistic Offline Lock
Keep transactions as short as possible by doing all reads and computations before opening the transaction. Use optimistic offline locking (version column check) for multi-step workflows spanning multiple requests, avoiding DB-level locks entirely.
**Category:** Concurrency

### 98. Race condition between checking and using a resource
**Algorithm:** Compare-And-Swap (CAS) + Atomic Conditional Write
A conditional write (`UPDATE ... WHERE version = expected`; check rows affected) atomically reads-checks-writes without a lock. If another writer updated the row first, the rows-affected count is 0, signaling a conflict for retry. This is the foundation of optimistic concurrency.
**Category:** Concurrency

### 99. Inconsistent read results in eventually consistent stores
**Algorithm:** Read Repair + Quorum Reads (Dynamo-style)
Quorum reads (R + W > N) guarantee seeing the latest write by reading from a majority of replicas. Read repair detects stale replicas during a read and asynchronously updates them, converging to consistency without a coordinator.
**Category:** Concurrency

### 100. Task queue jobs silently failing without retry
**Algorithm:** At-Least-Once Delivery + Idempotent Job Handler
Workers acknowledge jobs only after successful completion. On crash, the broker redelivers the job. The handler must be idempotent (same result on repeated execution), achieved via a deduplication key checked before processing. Log every job attempt with its outcome.
**Category:** Concurrency

### 101. Slow consumer causing unbounded queue growth
**Algorithm:** Backpressure + Flow Control (TCP-style)
Backpressure signals to the producer to slow down when the consumer queue depth exceeds a threshold. Reactive Streams (Java) and Go channels implement cooperative flow control, preventing memory exhaustion from unbounded queue accumulation. Monitor queue depth as a primary operational metric.
**Category:** Concurrency

### 102. High latency due to chatty microservice communication
**Algorithm:** Request Coalescing + Protocol Buffers (gRPC)
gRPC uses HTTP/2 multiplexing and Protocol Buffers (binary serialization, ~3–10x smaller than JSON), reducing per-request overhead. Request coalescing batches multiple small calls into one network round trip. Aggregate multiple fields in a single RPC call rather than making sequential calls.
**Category:** Networking

### 103. TCP connection overhead on frequent short requests
**Algorithm:** Connection Pooling + HTTP/2 Multiplexing
HTTP/2 multiplexes many logical streams over one TCP connection, eliminating per-request TLS + TCP handshake overhead. Connection pools reuse established connections, reducing latency from O(RTT × handshakes) to O(RTT × 1).
**Category:** Networking

### 104. DNS lookup latency on every external call
**Algorithm:** DNS Caching + Negative Caching
Cache DNS responses up to their TTL in a local resolver. Negative caching stores `NXDOMAIN` results to avoid repeated lookups for non-existent hosts. Use long TTLs for stable services, short TTLs for services that failover. Never skip the OS DNS cache in containerized environments.
**Category:** Networking

### 105. Packet loss causing retransmissions and jitter
**Algorithm:** BBR Congestion Control + FEC
BBR (Bottleneck Bandwidth and RTT) estimates the true network bottleneck instead of inferring from packet loss, achieving higher throughput at lower latency. Forward Error Correction adds redundant data to recover lost packets without retransmission. Use for video streaming and real-time audio.
**Category:** Networking

### 106. Slow WebSocket connection handling at scale
**Algorithm:** Actor Model + Non-Blocking I/O (epoll/kqueue)
The actor model assigns each WebSocket connection to a lightweight actor (Erlang process, Akka actor). Non-blocking I/O via `epoll` (Linux) or `kqueue` (BSD) allows a single thread to manage thousands of connections with minimal overhead. Erlang/OTP was designed for exactly this problem.
**Category:** Networking

### 107. API gateway timeouts cascading into failures
**Algorithm:** Deadline Propagation + Hedged Requests
Hedged requests send a duplicate request to a second replica after a brief delay (p95 latency) and use whichever responds first. This reduces tail latency without doubling load, as most hedged requests are cancelled early. Used extensively in Google's internal infrastructure.
**Category:** Networking

### 108. Inefficient data transfer due to large payloads
**Algorithm:** Content Compression + Brotli / gzip
Brotli achieves 15–25% better compression than gzip for text content. Apply compression server-side for responses > 1KB. For structured data, use Protocol Buffers or MessagePack instead of JSON to reduce payload size fundamentally. Compress at the origin, cache compressed at the CDN.
**Category:** Networking

### 109. IP blocking insufficient for bot prevention
**Algorithm:** Device Fingerprinting + CAPTCHA Challenge
Device fingerprinting combines browser attributes (canvas, fonts, WebGL) into a probabilistic identity hash. Rate limit by fingerprint, not just IP. Apply CAPTCHA challenges only when risk score (ML classifier) exceeds a threshold, minimizing friction for legitimate users.
**Category:** Networking

### 110. Service mesh overhead slowing inter-service calls
**Algorithm:** eBPF Sidecar-less Networking (Cilium)
eBPF programs run in the Linux kernel, implementing load balancing, policy enforcement, and observability without sidecar proxies. Eliminating the sidecar removes one TCP hop per call, reducing latency and CPU overhead. Cilium is the leading eBPF-based CNI for Kubernetes.
**Category:** Networking

### 111. Load balancer not accounting for server response time
**Algorithm:** Least Response Time + Power of Two Choices
Power of Two Choices picks two random backends and routes to the one with fewer active requests. This approaches optimal load balancing with O(1) overhead, outperforming round robin and least-connections for variable workloads. Envoy and NGINX Plus both support this algorithm.
**Category:** Networking

### 112. Tracing requests across distributed systems
**Algorithm:** Distributed Tracing + W3C TraceContext
Inject a trace ID and span ID into every outbound request header (W3C TraceContext standard). Each service records its span with timing and tags. A trace aggregator (Jaeger, Zipkin) reconstructs the full request DAG for analysis.
**Category:** Networking

### 113. mTLS certificate rotation causing service outages
**Algorithm:** Rolling Certificate Rotation + Dual-Stack Validation
During rotation, configure each service to trust both the old and new CA certificates simultaneously (dual-stack). Issue new leaf certs signed by the new CA. Only after all services have new leaf certs, remove the old CA from trust stores. Never rotate all certificates simultaneously.
**Category:** Networking

### 114. IPv4 exhaustion blocking new server provisioning
**Algorithm:** IPv6 Dual-Stack + NAT64/DNS64 Translation
Deploy services on IPv6-native infrastructure. Use NAT64 to translate outbound IPv6 traffic to IPv4 for legacy dependencies. DNS64 synthesizes `AAAA` records for IPv4-only destinations, enabling full IPv6 clients to reach legacy services during transition.
**Category:** Networking

### 115. Proxy misconfiguration hiding real client IPs
**Algorithm:** X-Forwarded-For Header Chain + Trusted Proxy Allowlist
Only trust `X-Forwarded-For` headers from known proxy IP ranges (allowlist). Parse the header right-to-left and take the first untrusted IP. Configuring leftmost-trusted-IP is a common mistake that allows clients to spoof their IP by prepending values.
**Category:** Networking

### 116. gRPC streaming connections dropped by load balancers
**Algorithm:** HTTP/2 PING Keepalive + L7 Load Balancing
L4 load balancers see gRPC streams as a single long-lived TCP connection and route all messages to one backend. Move to L7 (application-layer) load balancing to route individual RPCs. Configure HTTP/2 PING keepalives to prevent idle-timeout drops from intermediate proxies.
**Category:** Networking

### 117. QUIC/HTTP3 not supported, leaving latency on the table
**Algorithm:** QUIC 0-RTT Handshake + Connection Migration
QUIC establishes encrypted connections in 0–1 RTT (vs TLS 1.3's 1 RTT over TCP). Connection migration allows sessions to survive IP changes (mobile network handoff) without reconnecting. Deploy at the CDN/edge layer for immediate gains with no application changes.
**Category:** Networking

### 118. API versioning breaking existing client integrations
**Algorithm:** Semantic Versioning + Consumer-Driven Contract Testing
Consumer-Driven Contracts (Pact) let consumers define expected API behavior. CI verifies providers against all consumer contracts before deployment, catching breaking changes before they reach production. Never remove or rename fields in a minor version.
**Category:** API

### 119. Overfetching and underfetching in REST APIs
**Algorithm:** GraphQL + DataLoader Batching
GraphQL lets clients specify exactly the fields they need. DataLoader batches all field-level DB requests within a single request tick into minimal queries, solving the N+1 problem inherent in naive GraphQL resolvers.
**Category:** API

### 120. API rate limiting poorly communicated to clients
**Algorithm:** Token Bucket + RFC 7807 Problem Details
Expose rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`) on every response. Return RFC 7807 Problem Details JSON on 429 with exact retry timing. Token bucket gives clients a predictable burst window.
**Category:** API

### 121. Large file uploads timing out and failing
**Algorithm:** Multipart Upload + Resumable Upload Protocol (TUS)
TUS protocol splits files into chunks and uploads each with an offset header. On network failure, the client queries the server for the current offset and resumes from there. Chunks are assembled server-side into the final file. Amazon S3's multipart upload follows this same model.
**Category:** API

### 122. Missing or incorrect API documentation
**Algorithm:** OpenAPI Spec Generation + Contract-First Design
Contract-first design writes the OpenAPI spec before code, enabling auto-generated client SDKs and server stubs. Tools like Spectral lint specs for completeness. Documentation stays synchronized because it is the source of truth. Code-first generation often produces incomplete specs.
**Category:** API

### 123. Webhook delivery failures leaving events unprocessed
**Algorithm:** Outbox Pattern + Exponential Backoff Retry Queue
Store webhook payloads in an outbox table. A background worker delivers them with exponential backoff, retrying for up to 72 hours. Expose a delivery log endpoint so consumers can inspect and manually replay failed events. Sign payloads with HMAC for receiver verification.
**Category:** API

### 124. Inconsistent error responses across endpoints
**Algorithm:** Centralized Error Handler + Error Code Taxonomy
A centralized exception filter maps internal exceptions to a consistent error schema (RFC 7807). An error code taxonomy (`DOMAIN_SUBDOMAIN_REASON`) provides machine-readable codes clients can handle programmatically.
**Category:** API

### 125. Long-running API requests blocking the client
**Algorithm:** Async Job Pattern + Polling / Webhooks
Return `202 Accepted` immediately with a job ID. The client polls `GET /jobs/{id}` or receives a webhook on completion. This decouples client timeout constraints from actual processing time, enabling arbitrarily long operations.
**Category:** API

### 126. API responses not cacheable, causing redundant calls
**Algorithm:** HTTP Cache-Control + ETags + Conditional Requests
Set `Cache-Control: max-age` and `ETag` (content hash) headers. Clients send `If-None-Match` on subsequent requests. A `304 Not Modified` response transfers zero body bytes, reducing bandwidth and server load. Use `Vary` headers carefully to avoid cache fragmentation.
**Category:** API

### 127. Uncontrolled API sprawl across microservices
**Algorithm:** API Gateway + Backend for Frontend (BFF) Pattern
An API gateway handles cross-cutting concerns (auth, rate limiting, routing). BFF creates a dedicated aggregation layer per client type (mobile, web), reducing chattiness and preventing leaking of internal service topology to clients.
**Category:** API

### 128. API clients retrying too aggressively under load
**Algorithm:** Retry-After Header + Client-Side Jitter
Return a `Retry-After` header indicating the exact time or seconds until retry is permitted. Client libraries apply random jitter to retry intervals, desynchronizing retry storms that would otherwise correlate and overwhelm recovering services.
**Category:** API

### 129. GraphQL queries allowing denial-of-service via deep nesting
**Algorithm:** Query Depth Limiting + Query Complexity Analysis
Assign a complexity cost to each field and resolver. Reject queries whose total cost exceeds a threshold before execution. Depth limiting prevents deeply nested queries that cause exponential resolver fan-out, protecting the DB from unbounded joins.
**Category:** API

### 130. Breaking change accidentally deployed to stable API version
**Algorithm:** API Linting + Diff-Based Breaking Change Detection (openapi-diff)
In CI, run `openapi-diff` against the previous spec version. Any detected breaking change (removed field, changed type, new required param) fails the pipeline. Only additive changes are permitted without a major version bump.
**Category:** API

### 131. Streaming API responses causing memory issues
**Algorithm:** Server-Sent Events / Chunked Transfer + Backpressure
Use HTTP chunked transfer encoding or SSE to stream large responses incrementally. Apply backpressure by pausing the data source when the client's TCP receive buffer is full, preventing the server from buffering the entire response in memory.
**Category:** API

### 132. Third-party OAuth tokens not refreshed proactively
**Algorithm:** Proactive Token Refresh + Sliding Window Expiry Check
Check the token's expiry on every API call. If the remaining TTL is below a threshold (e.g., 20% of original TTL), refresh proactively in the background before the current token expires. Use a distributed lock to prevent concurrent refreshes for the same user.
**Category:** API

### 133. API consumers not notified of deprecation before removal
**Algorithm:** Sunset Header (RFC 8594) + Deprecation Header
Set `Sunset` and `Deprecation` response headers on deprecated endpoints. API monitoring tools and client libraries parse these headers and surface warnings to developers. Maintain deprecated endpoints for a minimum sunset period before removal. Communicate via developer newsletters as well.
**Category:** API

### 134. No visibility into what caused a production outage
**Algorithm:** Distributed Tracing + Causality Graphs (DAG)
Model service dependencies as a DAG. Distributed traces attach span timings to each node. Post-incident, traverse the graph from the anomalous leaf back to the root cause using topological sort, isolating the origin in minutes instead of hours.
**Category:** Observability

### 135. Metrics not correlating with user-perceived latency
**Algorithm:** RED Method + Percentile Histograms (p99)
The RED method (Rate, Errors, Duration) focuses on user-facing signals. Store latency as histograms (Prometheus) rather than averages; p99 captures tail latency that averages hide, revealing real user pain during traffic spikes. Always expose p50, p95, p99, and p999.
**Category:** Observability

### 136. Log volume too high to be actionable
**Algorithm:** Log Sampling + Bloom Filter Deduplication
Head-based and tail-based sampling reduce volume while preserving interesting traces. A Bloom filter (probabilistic set membership) detects duplicate log events in O(1) space and suppresses repeated noise without storing full messages. Sample 100% of errors, 1% of successful requests.
**Category:** Observability

### 137. Dashboards showing vanity metrics instead of actionable ones
**Algorithm:** SLI/SLO Framework + Error Budget Burn Rate Alerts
Define SLIs (latency < 200ms for 99% of requests). SLOs set the target (99.9% availability). Error budget burn rate alerts fire when the 30-day budget is consumed faster than sustainable, prompting action before the SLO is breached. This is the Google SRE model.
**Category:** Observability

### 138. Inability to reproduce intermittent production bugs
**Algorithm:** Deterministic Replay + Event Sourcing Log
Store all inputs and state transitions as an ordered event log. Replay the log deterministically in a sandbox environment to reproduce any past state. Chaos engineering tools can inject faults at replay time to validate fixes.
**Category:** Observability

### 139. No alerting on abnormal business metric changes
**Algorithm:** Changepoint Detection (CUSUM / PELT)
CUSUM (Cumulative Sum) detects small persistent shifts in metrics (e.g., checkout conversion rate dropping 2%). PELT (Pruned Exact Linear Time) finds multiple changepoints in time series at O(n) cost, enabling automatic anomaly detection on business KPIs. Alert on business metrics, not just infrastructure.
**Category:** Observability

### 140. Slow CI/CD pipelines blocking developer velocity
**Algorithm:** Dependency-Aware Test Parallelization + Incremental Build Cache
Represent the build graph as a DAG. Run independent test suites in parallel (topological order). Incremental build caches (Bazel, Nx) skip re-building unchanged modules by hashing inputs, reducing pipeline time by 60–90%. Failing fast on the most likely-to-fail tests reduces wasted time.
**Category:** DevOps

### 141. Kubernetes pod evictions during traffic spikes
**Algorithm:** Vertical Pod Autoscaler + Resource Quotas + QoS Classes
Assign pods a QoS class (Guaranteed > Burstable > BestEffort) by setting `requests == limits` for critical pods. VPA auto-tunes CPU/memory requests based on actual usage history, preventing OOMKills and evictions. Never deploy critical services without resource requests set.
**Category:** DevOps

### 142. Container image vulnerabilities reaching production
**Algorithm:** Software Bill of Materials (SBOM) + Shift-Left Scanning
Generate an SBOM (Syft) for every image. Scan dependencies against CVE databases (Grype, Trivy) in CI before push. Block images exceeding a severity threshold. Sign images with Cosign (sigstore) for supply-chain integrity. Rebuild base images weekly to pick up OS patches.
**Category:** DevOps

### 143. Rollback taking too long after a bad deployment
**Algorithm:** Canary Release + Automated Rollback on SLO Breach
A canary release routes 1–5% of traffic to the new version. Automated rollback triggers when the canary's error budget burn rate exceeds the baseline, reverting the load balancer weights within seconds without human intervention. Define rollback SLOs before deploying.
**Category:** DevOps

### 144. Infrastructure costs spiraling out of control
**Algorithm:** Bin Packing Algorithm + Spot Instance Scheduling
Bin packing (first-fit decreasing) maximizes node utilization by scheduling pods onto the fewest nodes. Spot/preemptible instances reduce compute costs 60–80%. Use a priority queue to preempt low-priority batch jobs when spot nodes are reclaimed. Tag all resources for cost attribution.
**Category:** DevOps

### 145. Secrets hardcoded in environment variables in k8s manifests
**Algorithm:** External Secrets Operator + Secret Injection at Runtime
External Secrets Operator syncs secrets from Vault/AWS Secrets Manager into k8s Secrets automatically. Inject secrets as environment variables or mounted files at pod startup. Manifests stored in Git contain only references, never actual values. Rotate secrets without redeployment.
**Category:** DevOps

### 146. Database migrations running without a safety net
**Algorithm:** Forward-Only Migrations + Shadow Table Testing
Apply all migrations against a shadow copy of the production schema in CI (`gh-ost --test-on-replica` mode). Run the migration dry-run to detect lock contention and estimate duration before touching production. Never allow destructive rollback scripts — write forward-only fixes instead.
**Category:** DevOps

### 147. On-call engineers unable to diagnose issues without tribal knowledge
**Algorithm:** Runbook Automation + Decision Tree (DAG-based Playbooks)
Model incident response as a decision tree (DAG). Each node is a diagnostic step with automated data collection (run query, fetch metric). Engineers follow the tree, with the system auto-populating results, reducing mean time to diagnosis without domain expertise.
**Category:** DevOps

### 148. No repeatable disaster recovery process
**Algorithm:** Chaos Engineering + Game Day Exercises (Chaos Monkey)
Chaos engineering deliberately injects failures (kill pods, saturate network, corrupt data) in production to validate recovery procedures. Game days run full disaster recovery exercises quarterly. The only way to know your recovery works is to practice it regularly.
**Category:** DevOps

### 149. Dependency on a single cloud region causing global outages
**Algorithm:** Active-Active Multi-Region + Global Load Balancing (GeoDNS)
GeoDNS routes users to the nearest healthy region. Active-active replication serves writes from multiple regions using conflict-free replicated data types (CRDTs) or last-write-wins with vector clocks. Define your RTO and RPO before designing the architecture.
**Category:** DevOps

### 150. Manual toil consuming engineering capacity
**Algorithm:** Toil Budgeting + SRE Automation Threshold
SRE practice caps operational toil at 50% of engineer time. Anything above that threshold triggers an automation investment. Model toil using `effort × frequency` to prioritize what to automate first. Automate ticket triage, scaling responses, and certificate renewals as first targets.
**Category:** DevOps
"""

# ── ANSI color codes ──────────────────────────────────────────────────────────
RESET   = "\033[0m"
BOLD    = "\033[1m"
DIM     = "\033[2m"
RED     = "\033[91m"
GREEN   = "\033[92m"
YELLOW  = "\033[93m"
BLUE    = "\033[94m"
MAGENTA = "\033[95m"
CYAN    = "\033[96m"
WHITE   = "\033[97m"
BG_DARK = "\033[40m"

CATEGORY_COLORS = {
    "Performance":   "\033[93m",   # yellow
    "Scalability":   "\033[96m",   # cyan
    "Reliability":   "\033[92m",   # green
    "Security":      "\033[91m",   # red
    "Data":          "\033[94m",   # blue
    "Concurrency":   "\033[95m",   # magenta
    "Networking":    "\033[36m",   # dark cyan
    "API":           "\033[33m",   # dark yellow
    "Observability": "\033[32m",   # dark green
    "DevOps":        "\033[35m",   # dark magenta
}

# ── Parse problems ────────────────────────────────────────────────────────────
def parse_problems(text: str) -> list[dict]:
    problems = []
    blocks = re.split(r'\n(?=### \d+\.)', text.strip())
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        m_title = re.match(r'### (\d+)\. (.+)', block)
        m_algo  = re.search(r'\*\*Algorithm:\*\* (.+)', block)
        m_cat   = re.search(r'\*\*Category:\*\* (.+)', block)
        if not (m_title and m_algo and m_cat):
            continue
        num   = int(m_title.group(1))
        title = m_title.group(2).strip()
        algo  = m_algo.group(1).strip()
        cat   = m_cat.group(1).strip()
        # description: everything between algo line and category line
        lines = block.split('\n')
        desc_lines = []
        in_desc = False
        for line in lines:
            if '**Algorithm:**' in line:
                in_desc = True
                continue
            if '**Category:**' in line:
                break
            if in_desc and line.strip():
                desc_lines.append(line.strip())
        description = ' '.join(desc_lines)
        problems.append({
            'num': num,
            'title': title,
            'algorithm': algo,
            'category': cat,
            'description': description,
        })
    return problems


PROBLEMS = parse_problems(PROBLEMS_MD)

# ── Terminal width ────────────────────────────────────────────────────────────
def term_width() -> int:
    try:
        return os.get_terminal_size().columns
    except OSError:
        return 100


def hr(char='─', color=DIM):
    return f"{color}{char * term_width()}{RESET}"


def wrap(text: str, indent: int = 4, width: int = None) -> str:
    """Wrap text to terminal width with indent."""
    if width is None:
        width = term_width() - indent - 2
    words = text.split()
    lines, line = [], []
    length = 0
    for word in words:
        if length + len(word) + 1 > width:
            lines.append(' '.join(line))
            line, length = [word], len(word)
        else:
            line.append(word)
            length += len(word) + 1
    if line:
        lines.append(' '.join(line))
    pad = ' ' * indent
    return ('\n' + pad).join(lines)


# ── Highlight match in string ─────────────────────────────────────────────────
def highlight(text: str, query: str) -> str:
    if not query:
        return text
    pattern = re.compile(re.escape(query), re.IGNORECASE)
    return pattern.sub(lambda m: f"{BOLD}{YELLOW}{m.group()}{RESET}", text)


# ── Search logic ──────────────────────────────────────────────────────────────
def search(query: str, category_filter: str = None) -> list[dict]:
    q = query.lower().strip()
    results = []
    for p in PROBLEMS:
        if category_filter and p['category'].lower() != category_filter.lower():
            continue
        haystack = f"{p['title']} {p['algorithm']} {p['description']} {p['category']}".lower()
        if not q or q in haystack:
            score = 0
            if q in p['title'].lower():       score += 3
            if q in p['algorithm'].lower():    score += 2
            if q in p['description'].lower():  score += 1
            results.append((score, p))
    results.sort(key=lambda x: (-x[0], x[1]['num']))
    return [p for _, p in results]


# ── Display functions ─────────────────────────────────────────────────────────
def print_header():
    w = term_width()
    print()
    print(f"{BOLD}{CYAN}{'─' * w}{RESET}")
    title = "  BACKEND ENGINEERING PROBLEMS  ·  150 Problems & Algorithm Solutions"
    print(f"{BOLD}{CYAN}{title.center(w)}{RESET}")
    subtitle = "Search by keyword, problem number, algorithm, or category"
    print(f"{DIM}{subtitle.center(w)}{RESET}")
    print(f"{BOLD}{CYAN}{'─' * w}{RESET}")
    print()


def print_categories():
    cats = sorted(set(p['category'] for p in PROBLEMS))
    counts = {c: sum(1 for p in PROBLEMS if p['category'] == c) for c in cats}
    print(f"  {BOLD}Categories:{RESET}", end="")
    for cat in cats:
        color = CATEGORY_COLORS.get(cat, WHITE)
        print(f"  {color}[{cat} ·{counts[cat]}]{RESET}", end="")
    print("\n")


def print_result(p: dict, query: str = ""):
    w = term_width()
    cat_color = CATEGORY_COLORS.get(p['category'], WHITE)
    badge = f"{cat_color}[{p['category']}]{RESET}"
    num_str = f"{BOLD}{WHITE}#{p['num']:>3}{RESET}"
    title_str = highlight(f"{BOLD}{p['title']}{RESET}", query)
    print(f"  {num_str}  {title_str}  {badge}")
    algo_str = highlight(p['algorithm'], query)
    print(f"       {DIM}Algorithm:{RESET} {GREEN}{algo_str}{RESET}")
    desc_hi = highlight(p['description'], query)
    desc_wrapped = wrap(desc_hi, indent=7)
    print(f"       {DIM}{desc_wrapped}{RESET}")
    print(f"  {DIM}{'·' * (w - 4)}{RESET}")


def print_no_results(query: str):
    print(f"\n  {YELLOW}No results for {BOLD}\"{query}\"{RESET}{YELLOW}.{RESET}")
    print(f"  {DIM}Try: a keyword, #number, category name, or algorithm name.{RESET}\n")


def print_summary(results: list[dict], query: str, cat_filter: str):
    total = len(results)
    q_disp = f'"{query}"' if query else "(all)"
    cat_disp = f' in [{cat_filter}]' if cat_filter else ""
    print(f"  {DIM}Found {BOLD}{RESET}{BOLD}{total}{RESET}{DIM} result(s) for {q_disp}{cat_disp}{RESET}\n")


def print_help():
    print(f"""
  {BOLD}Commands:{RESET}
    {CYAN}<keyword>{RESET}          — search by any term in title, algorithm, or description
    {CYAN}#<number>{RESET}          — jump to a specific problem (e.g. #42)
    {CYAN}cat:<name>{RESET}         — filter by category (e.g. cat:security)
    {CYAN}<kw> cat:<name>{RESET}    — combined search + filter
    {CYAN}list{RESET}               — list all 150 problems (titles only)
    {CYAN}cats{RESET}               — show all categories
    {CYAN}help{RESET}               — show this help
    {CYAN}quit / exit / q{RESET}    — exit
""")


def list_all(cat_filter: str = None):
    w = term_width()
    print()
    for p in PROBLEMS:
        if cat_filter and p['category'].lower() != cat_filter.lower():
            continue
        cat_color = CATEGORY_COLORS.get(p['category'], WHITE)
        badge = f"{cat_color}{p['category'][:4]}{RESET}"
        print(f"  {DIM}#{p['num']:>3}{RESET}  {badge}  {p['title']}")
    print()


# ── Main REPL ─────────────────────────────────────────────────────────────────
def main():
    print_header()
    print_categories()
    print_help()

    while True:
        try:
            raw = input(f"{BOLD}{CYAN}search>{RESET} ").strip()
        except (EOFError, KeyboardInterrupt):
            print(f"\n{DIM}Goodbye.{RESET}\n")
            break

        if not raw:
            continue

        cmd = raw.lower()

        # exit
        if cmd in ('quit', 'exit', 'q'):
            print(f"\n{DIM}Goodbye.{RESET}\n")
            break

        # help
        if cmd == 'help':
            print_help()
            continue

        # cats
        if cmd == 'cats':
            print_categories()
            continue

        # list [cat:X]
        if cmd.startswith('list'):
            rest = cmd[4:].strip()
            cat_f = None
            if rest.startswith('cat:'):
                cat_f = rest[4:].strip()
            list_all(cat_f)
            continue

        # #number
        if raw.startswith('#'):
            try:
                n = int(raw[1:])
                matches = [p for p in PROBLEMS if p['num'] == n]
                if matches:
                    print()
                    print_result(matches[0])
                    print()
                else:
                    print(f"\n  {YELLOW}Problem #{n} not found.{RESET}\n")
            except ValueError:
                print(f"\n  {YELLOW}Invalid number: {raw}{RESET}\n")
            continue

        # parse query + optional cat: filter
        cat_filter = None
        query = raw
        cat_match = re.search(r'\bcat:(\S+)', raw, re.IGNORECASE)
        if cat_match:
            cat_filter = cat_match.group(1)
            query = raw[:cat_match.start()].strip() + raw[cat_match.end():].strip()
            query = query.strip()
            # validate category
            valid_cats = {p['category'].lower() for p in PROBLEMS}
            if cat_filter.lower() not in valid_cats:
                closest = [c for c in valid_cats if cat_filter.lower() in c]
                if closest:
                    cat_filter = next(p['category'] for p in PROBLEMS if p['category'].lower() == closest[0])
                else:
                    print(f"\n  {YELLOW}Unknown category: \"{cat_filter}\". Use cats to see all.{RESET}\n")
                    continue

        results = search(query, cat_filter)
        print()
        print_summary(results, query, cat_filter)

        if not results:
            print_no_results(query)
        else:
            for p in results:
                print_result(p, query)
            print()


if __name__ == '__main__':
    main()