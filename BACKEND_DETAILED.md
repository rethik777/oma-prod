# Backend — Detailed Technical Documentation

**Overview:**
- **Stack:** Spring Boot (Java 21), Spring Data JPA (Hibernate), Flyway for migrations, PostgreSQL, JWT-based auth, Bucket4j for rate limiting.
- **Project root:** `OMA V1/` (Maven project). See [OMA V1/pom.xml](OMA%20V1/pom.xml#L1-L200) for dependencies.

Key configuration files
- [OMA V1/pom.xml](OMA%20V1/pom.xml#L1-L200) — build, dependencies (Flyway, JPA, Bucket4j, jjwt, PostgreSQL driver).
- [OMA V1/target/classes/application.properties](OMA%20V1/target/classes/application.properties#L1-L200) — runtime settings used here (DB connection via environment vars, Flyway, JPA, JWT, CORS, recaptcha, cache).

API Endpoints and responsibilities
- This section lists the main backend endpoints and a two‑line summary of what each one does.
- Use it as a contract reference when changing controllers, security rules or wiring new frontend features.

**Credential / authentication (`/api/credential/...`)**
- `POST /api/credential/login` — implemented in `CredentialController.login` ([link](OMA%20V1/src/main/java/com/example/OMA/Controller/CredentialController.java#L72-L132)).
	- Validates username/password, enforces per‑IP rate limiting, then issues a JWT as an httpOnly cookie for the frontend to use.
- `POST /api/credential/logout` — implemented in `CredentialController.logout` ([link](OMA%20V1/src/main/java/com/example/OMA/Controller/CredentialController.java#L134-L199)).
	- Clears the JWT cookie and returns a small JSON response, effectively ending the authenticated session.
- `GET /api/credential/check` — implemented in `CredentialController.checkAuth` ([link](OMA%20V1/src/main/java/com/example/OMA/Controller/CredentialController.java#L201-L250)).
	- Reads JWT from cookies, validates via `JwtUtil` and replies 200 or 401; this powers “am I logged in?” checks from the SPA.
- `GET /api/credential/health` — implemented in `CredentialController.health` ([link](OMA%20V1/src/main/java/com/example/OMA/Controller/CredentialController.java#L252-L302)).
	- Pings the local BERT model server and reports `status`/`maintenance` flags without ever returning 5xx, so UIs can gracefully degrade.
- `POST /api/credential/register` — implemented in `CredentialController.register` ([link](OMA%20V1/src/main/java/com/example/OMA/Controller/CredentialController.java#L40-L47)).
	- Simple user creation endpoint wired to `CredentialService`; typically used for seeding or admin flows.

Database & Migrations (Flyway)
- Flyway is enabled (`spring.flyway.enabled=true`) and configured to load migrations from `classpath:db/migrations`.
- Properties found in [OMA V1/target/classes/application.properties](OMA%20V1/target/classes/application.properties#L1-L200):
+  - `spring.flyway.baseline-on-migrate=true` — supports pre-existing schemas.
+  - `spring.flyway.out-of-order=true` — permits applying older-numbered migrations that arrive later.
+  - `spring.flyway.validate-on-migrate=true` — validates checksums to catch drift.
- Migrations should live in `src/main/resources/db/migrations` using Flyway naming (`V1__init.sql`, `V2__add_table.sql`, etc.).
- Running migrations:
	- Automatically: Flyway runs on Spring Boot startup.
	- Manually: `mvn flyway:migrate` (requires proper Maven config and environment variables for DB connection).

Hibernate / JPA
- Hibernate is present via `spring-boot-starter-data-jpa` and the dialect is set to `org.hibernate.dialect.PostgreSQLDialect`.
- `spring.jpa.hibernate.ddl-auto=none` to delegate schema changes to Flyway (prevents Hibernate from creating/dropping tables automatically).
- `spring.jpa.show-sql` can be toggled for debugging.

Security & Auth
- JWT components are included (`jjwt-api`, `jjwt-impl`, `jjwt-jackson`). JWT settings are read from environment variables (`jwt.secret`, `jwt.expiration`) as set in `application.properties`.
- Auth cookie behavior: frontend expects httpOnly cookies; server must set cookies with `HttpOnly` and (in production) `Secure` and `SameSite` as appropriate.
- CORS is controlled via `app.cors.allowed-origins` environment variable.

**Survey structure & questions (`/api/category/...`)**
- `GET /api/category/allquestion` — implemented in `CategoryController.getAllQuestions` ([link](OMA%20V1/src/main/java/com/example/OMA/Controller/CategoryController.java#L18-L28)).
	- Returns the fully nested survey hierarchy via `CategoryService.getSurveyStructure`, backed by an in‑memory cache warmed at startup.

**Survey session, autosave, submission & GDPR (`/api/survey/...`)**
- `POST /api/survey/verify-session` — implemented in `SurveyController.verifySession` ([link](OMA%20V1/src/main/java/com/example/OMA/Controller/SurveyController.java#L55-L99)).
	- Verifies the reCAPTCHA v3 token and enforces the configured score threshold before a user may enter the live survey.
- `POST /api/survey/save-progress` — implemented in `SurveyController.saveProgress` ([link](OMA%20V1/src/main/java/com/example/OMA/Controller/SurveyController.java#L41-L54)).
	- Performs an idempotent full‑state save of the survey `responses` map and GDPR consent flags for a session.
- `POST /api/survey/save-answer` — implemented in `SurveyController.saveAnswer` ([link](OMA%20V1/src/main/java/com/example/OMA/Controller/SurveyController.java#L29-L40)).
	- Saves or replaces the answer for a single main question; kept for incremental flows but not currently used by the React client.
- `POST /api/survey/submit` — implemented in `SurveyController.submitSurvey` ([link](OMA%20V1/src/main/java/com/example/OMA/Controller/SurveyController.java#L101-L137)).
	- Rebuilds the canonical set of response rows, stamps `submittedAt` and finalises consent for the survey session.
- `GET /api/survey/session/{sessionId}/responses` — implemented in `SurveyController.getSessionResponses` ([link](OMA%20V1/src/main/java/com/example/OMA/Controller/SurveyController.java#L139-L158)).
	- Reconstructs the frontend‑style responses map, enforcing the submitted flag so completed sessions cannot be silently re‑opened.
- `GET /api/survey/survey_score` — implemented in `SurveyController.getScore` ([link](OMA%20V1/src/main/java/com/example/OMA/Controller/SurveyController.java#L160-L165)).
	- Aggregates structured scores and BERT‑derived free‑text scores into per‑category averages for the analytics dashboard.
- `GET /api/survey/session/{sessionId}/export` — implemented in `SurveyController.exportSessionData` ([link](OMA%20V1/src/main/java/com/example/OMA/Controller/SurveyController.java#L167-L195)).
	- Returns a portable JSON export of all data tied to a session ID to satisfy GDPR data access/portability rights.
- `DELETE /api/survey/session/{sessionId}/data` — implemented in `SurveyController.deleteSessionData` ([link](OMA%20V1/src/main/java/com/example/OMA/Controller/SurveyController.java#L197-L227)).
	- Calls `SurveyService.anonymizeSessionData` to irreversibly scrub session identifiers, timestamps and free‑text while preserving aggregate metrics.

Rate limiting, Abuse mitigation & Edge-case handling
- Rate limiting: `Bucket4j` dependency included for token-bucket rate limiting at controller/filter level (protects endpoints from abuse).
- reCAPTCHA v3: configured; score threshold is set via `recaptcha.score.threshold` and monitored in services.
- Flyway validation and `validate-on-migrate` reduce schema drift edge cases.
- Important production safeguards in `application.properties`:
+  - `cookie.secure` should be true in HTTPS environments.
+  - `jwt.secret` must be set as env var (no default) to avoid predictable tokens.
+  - `ALLOWED_ORIGINS` must be set to prevent open CORS.

Architecture & runtime workflow
- Startup sequence:
+ 1. Spring Boot app boots.
+ 2. Flyway migrations run (apply/validate as configured).
+ 3. Application context fully initializes: JPA repositories, controllers, scheduled tasks.
+ 4. App begins accepting requests; cookies and JWTs used for auth flows.
- Typical request flow:
	1. Browser sends request (frontend uses `credentials: 'include'`).
	2. Web filter chain runs: security filters, rate-limiter, CORS handling.
	3. Controller handles request using service layer; services use JPA repositories for DB access.
	4. Responses return JSON; authentication endpoints may set `Set-Cookie` headers for httpOnly JWT.

Edge cases & resolution strategies
- Schema drift / migration failure:
+  - Flyway `validate-on-migrate` fails early; use `baseline-on-migrate` for existing schemas.
+  - Keep migrations immutable and use checksum validation; revert bad migrations by writing corrective migrations (never alter applied migration files in VCS).
- Partial writes & transactions:
+  - Use Spring `@Transactional` on service methods to ensure ACID semantics for multi-step DB updates.
- Race conditions / duplicate submissions:
+  - Use DB unique constraints + idempotency keys in endpoints where duplicate submissions are possible.
- Long-running operations / timeouts:
+  - Offload to async worker or scheduled tasks; persist job state in DB and provide status endpoints.
- Rate limiting & DoS:
+  - Bucket4j throttles abusive clients; combine with API gateway or CloudFront WAF for additional protection.
- Invalid recaptcha / suspected bot behavior:
+  - Log incidents and escalate (e.g., temporarily ban IPs, require additional verification).

Dev / Local run notes
- Required env vars (examples in `application.properties` comments): `DB_URL`, `DB_USER`, `DB_PASS`, `JWT_SECRET`, `ALLOWED_ORIGINS`.
- To run locally in dev:
	1. Start Postgres and set env vars.
	2. `mvn spring-boot:run` (Flyway will migrate at startup).

Observability & logging
- Flyway logs at DEBUG level when configured in `application.properties`.
- App logging levels are controlled via env variables (`LOG_LEVEL_*`).

Where to find code for endpoints and services
- Controllers and services: `OMA V1/src/main/java/com/.../controller` and `.../service`.
- Entities and repositories: `OMA V1/src/main/java/com/.../domain` and `.../repository` (common conventions; path may vary).

End-to-end backend workflow (high level)
- Startup: validate env vars → run Flyway migrations → warm survey cache → expose `/api/...` with JWT+reCAPTCHA protections and CORS configured from `ALLOWED_ORIGINS`.
- Runtime: handle survey traffic (verify session → save progress → submit), serve analytics to authenticated dashboards, and continuously enforce GDPR via export/anonymise endpoints and the nightly retention job.

*** End of document
