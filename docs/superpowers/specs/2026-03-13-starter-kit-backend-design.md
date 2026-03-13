# Starter Kit Backend — Design Spec

## Overview

A **Spring Boot + PostgreSQL backend** that serves as the real integration target for the React Native Expo Starter Kit. Every starter kit feature that needs server-side support gets a corresponding backend module with full CRUD endpoints, proper auth, and consistent error handling.

**Architecture:** Modular monolith — single Spring Boot app with self-contained modules designed for future extraction into independent services.

**Repo:** `D:\revocare\repository\react-native-expo-starter-kit-backend\` (sibling to the mobile project)

## Tech Stack

- Java 17
- Spring Boot 3.3+
- Maven
- PostgreSQL 16
- Spring Security (OAuth2 Resource Server + Cognito JWT)
- Spring Data JPA (Hibernate)
- Flyway (database migrations)
- Docker Compose (PostgreSQL + Spring Boot + LocalStack)
- Springdoc OpenAPI (Swagger UI)
- Spring Actuator (health checks)
- SLF4J + Logback (logging)

## Infrastructure

### Docker Compose

Three services:

| Service | Image | Purpose |
|---|---|---|
| `db` | `postgres:16` | PostgreSQL database |
| `app` | Spring Boot (Dockerfile) | Backend application |
| `localstack` | `localstack/localstack` | Local AWS emulation (Cognito, SNS) |

Single command startup: `docker compose up`

### Database

- PostgreSQL 16
- Flyway manages all schema migrations in `src/main/resources/db/migration/`
- Seed data via Flyway: default translations (en/es), LocalStack Cognito setup script

## Package Structure

```
com.revocare.starterkit
├── config/                    # Security, CORS, OpenAPI, exception handling
│   ├── SecurityConfig.java
│   ├── CorsConfig.java
│   ├── OpenApiConfig.java
│   └── GlobalExceptionHandler.java
├── common/                    # Shared types
│   ├── dto/
│   │   ├── ApiErrorResponse.java
│   │   └── PagedResponse.java
│   ├── entity/
│   │   └── BaseEntity.java
│   └── exception/
│       ├── ResourceNotFoundException.java
│       └── ForbiddenException.java
├── modules/
│   ├── auth/                  # Authentication (Cognito)
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── dto/
│   │   └── entity/
│   ├── analytics/             # Analytics event ingestion
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── dto/
│   │   └── entity/
│   ├── crashreporting/        # Crash report ingestion
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── dto/
│   │   └── entity/
│   ├── notifications/         # Push notifications
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── dto/
│   │   └── entity/
│   ├── resources/             # Sample CRUD (Tasks)
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── dto/
│   │   └── entity/
│   ├── i18n/                  # Translation strings
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── dto/
│   │   └── entity/
│   └── sync/                  # Offline storage sync
│       ├── controller/
│       ├── service/
│       ├── repository/
│       ├── dto/
│       └── entity/
```

Each module follows: `controller → service → repository → dto → entity`

Modules communicate only through service interfaces — no cross-module repository access. This enables future extraction into standalone services.

---

## Module 1: Auth

### Cognito Integration

- **Local dev:** LocalStack Cognito emulation
- **Production:** Real AWS Cognito
- Spring Boot acts as both:
  - **Resource server:** Validates Cognito JWT tokens on protected endpoints
  - **Auth proxy:** Proxies auth calls (register, login, etc.) to Cognito

### Cognito Resources

- User Pool with email/password sign-up
- App Client (no secret, for mobile apps)
- Identity Pool for AWS credentials

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register user (Cognito + DB profile) |
| POST | `/api/auth/login` | Public | Authenticate, return JWT tokens |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| POST | `/api/auth/forgot-password` | Public | Initiate password reset |
| POST | `/api/auth/confirm-reset` | Public | Confirm password reset with code |
| POST | `/api/auth/verify-email` | Public | Verify email with confirmation code |
| POST | `/api/auth/logout` | Protected | Revoke refresh token (Cognito GlobalSignOut) |
| GET | `/api/auth/me` | Protected | Get current user profile |
| PUT | `/api/auth/me` | Protected | Update user profile |
| DELETE | `/api/auth/me` | Protected | Delete account (Cognito + DB) |

### Database

**Table: `users`**

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK, auto-generated |
| `cognito_sub` | VARCHAR(255) | UNIQUE, NOT NULL — Cognito's unique user ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL |
| `display_name` | VARCHAR(255) | |
| `avatar_url` | VARCHAR(500) | |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### Spring Security Config

- JWT validation against Cognito JWKS endpoint
- Public paths: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/forgot-password`, `/api/auth/confirm-reset`, `/api/auth/verify-email`, `/swagger-ui/**`, `/v3/api-docs/**`, `/actuator/health`
- All other `/api/**` paths require valid Bearer token
- CORS: allow all origins in dev, configurable for production

---

## Module 2: Analytics

### Purpose

Receive and store analytics events from the mobile app (screen views, user actions, custom events).

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/analytics/events` | Protected | Submit single event |
| POST | `/api/analytics/events/batch` | Protected | Submit batch of events |
| GET | `/api/analytics/events` | Protected | Query own events (demo/debug, not for production dashboards) |

### Database

**Table: `analytics_events`**

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users, NOT NULL |
| `event_name` | VARCHAR(255) | NOT NULL |
| `event_category` | VARCHAR(100) | |
| `properties` | JSONB | Flexible key-value pairs |
| `screen_name` | VARCHAR(255) | |
| `session_id` | VARCHAR(255) | |
| `device_info` | JSONB | Platform, OS, app version |
| `timestamp` | TIMESTAMP | NOT NULL |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### Query Filters

- `eventName` — filter by event name
- `category` — filter by event category
- `startDate`, `endDate` — date range
- Pagination: `page`, `size`
- All events scoped to authenticated user

---

## Module 3: Crash Reporting

### Purpose

Receive and store crash reports and error logs from the mobile app.

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/crash-reports` | Protected | Submit crash report |
| GET | `/api/crash-reports` | Protected | List own crash reports |
| GET | `/api/crash-reports/{id}` | Protected | Get crash report detail |

### Database

**Table: `crash_reports`**

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users, NOT NULL |
| `error_message` | VARCHAR(1000) | NOT NULL |
| `stack_trace` | TEXT | |
| `breadcrumbs` | JSONB | Ordered list of actions before crash |
| `context` | JSONB | Arbitrary state/metadata |
| `severity` | VARCHAR(20) | `fatal`, `error`, `warning` |
| `app_version` | VARCHAR(50) | |
| `device_info` | JSONB | OS, device model, app version |
| `timestamp` | TIMESTAMP | NOT NULL |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |

---

## Module 4: Notifications

### Purpose

Manage push notification tokens and trigger notifications from the backend.

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/notifications/tokens` | Protected | Register device push token |
| DELETE | `/api/notifications/tokens/{token}` | Protected | Unregister token |
| POST | `/api/notifications/send` | Protected | Send notification to self (dev/testing only, rate-limited: 10/min) |
| GET | `/api/notifications/history` | Protected | List notification history |

### Database

**Table: `device_tokens`**

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users, NOT NULL |
| `token` | VARCHAR(500) | NOT NULL |
| `platform` | VARCHAR(20) | `ios`, `android`, `web` |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |

UNIQUE constraint on `(user_id, token)`.

**Table: `notification_history`**

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users, NOT NULL |
| `title` | VARCHAR(255) | NOT NULL |
| `body` | TEXT | |
| `data` | JSONB | Custom payload |
| `status` | VARCHAR(20) | `pending`, `sent`, `failed`, `delivered` |
| `sent_at` | TIMESTAMP | |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### Implementation

- Uses LocalStack SNS in dev, real SNS/Expo Push API in production
- Send endpoint looks up user's registered tokens and dispatches
- Send endpoint is rate-limited (10 requests/minute per user) and restricted to sending to own tokens only
- Token re-registration updates `updated_at` timestamp (upsert on unique constraint)

---

## Module 5: Resources (Tasks CRUD)

### Purpose

Sample CRUD resource to test form submissions, validation, and data flow end-to-end.

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/tasks` | Protected | List tasks (paginated, filterable) |
| POST | `/api/tasks` | Protected | Create task |
| GET | `/api/tasks/{id}` | Protected | Get task detail |
| PUT | `/api/tasks/{id}` | Protected | Update task |
| DELETE | `/api/tasks/{id}` | Protected | Delete task |

### Database

**Table: `tasks`**

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users, NOT NULL |
| `title` | VARCHAR(255) | NOT NULL |
| `description` | TEXT | |
| `status` | VARCHAR(20) | `todo`, `in_progress`, `done` |
| `priority` | VARCHAR(20) | `low`, `medium`, `high` |
| `due_date` | DATE | |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |

### Query Filters

- `status` — filter by task status
- `priority` — filter by priority
- Pagination: `page`, `size`
- All tasks scoped to authenticated user

### Validation

Server-side validation mirrors client Zod schemas:
- `title` — required, max 255 chars
- `status` — must be valid enum value
- `priority` — must be valid enum value
- Returns 422 with field-level error details

---

## Module 6: i18n

### Purpose

Serve translation strings to the mobile app, allowing dynamic translation updates without app releases.

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/i18n/{locale}` | Public | Get all translations for a locale |
| GET | `/api/i18n/locales` | Public | List available locales |

### Database

**Table: `translations`**

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `locale` | VARCHAR(10) | NOT NULL |
| `namespace` | VARCHAR(100) | NOT NULL |
| `key` | VARCHAR(255) | NOT NULL |
| `value` | TEXT | NOT NULL |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |

UNIQUE constraint on `(locale, namespace, key)`.

### Seed Data

Flyway migration seeds `en` and `es` translations matching the mobile app's bundled strings.

---

## Module 7: Sync

### Purpose

Enable offline-first pattern — mobile app stores data locally, syncs with server when online.

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/sync/push` | Protected | Push local changes to server |
| GET | `/api/sync/pull` | Protected | Pull changes since last sync |

### Database

**Table: `sync_records`**

| Column | Type | Constraints |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → users, NOT NULL |
| `store_key` | VARCHAR(255) | NOT NULL |
| `value` | JSONB | |
| `version` | BIGINT | NOT NULL, auto-increment per user |
| `deleted` | BOOLEAN | DEFAULT FALSE |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() |

UNIQUE constraint on `(user_id, store_key)`.

### Sync Strategy

- **Last-write-wins** with version numbers
- `version` is managed at the application layer: each user has a logical clock tracked via `SELECT MAX(version) FROM sync_records WHERE user_id = ?`, incremented on each write. Concurrent writes are serialized via `SELECT ... FOR UPDATE` row-level locking on the affected `(user_id, store_key)` row.
- `push` accepts array of `{ key, value, version }`:
  - For each record, if client `version` >= server `version`, the write is accepted and server increments to `MAX(version) + 1`
  - If client `version` < server `version`, that record is **rejected** (conflict)
  - Batch push uses **partial success**: non-conflicting records are accepted, conflicting records are returned in the response with their current server values
  - Conflict response (HTTP 200 with conflict details, not 409 — since the batch partially succeeded):
    ```json
    {
      "accepted": [{ "key": "k1", "version": 5 }],
      "conflicts": [{ "key": "k2", "serverVersion": 4, "serverValue": {...}, "clientVersion": 2 }]
    }
    ```
- `pull` accepts `?since=<version>` (optional, defaults to `0` for initial sync — returns all records) — returns all records with version > since
- Soft deletes via `deleted` flag

---

## Cross-Cutting Concerns

### BaseEntity

`BaseEntity` is a `@MappedSuperclass` containing:
- `id` (UUID, auto-generated)
- `createdAt` (TIMESTAMP, NOT NULL, set on persist)
- `updatedAt` (TIMESTAMP, NOT NULL, set on persist and update)

**Entities extending BaseEntity:** `User`, `Task`, `Translation`, `SyncRecord`, `DeviceToken`

**Entities NOT extending BaseEntity** (append-only, no `updatedAt`): `AnalyticsEvent`, `CrashReport` — these use `id` + `createdAt` only, defined directly.

**Special case:** `NotificationHistory` does not extend `BaseEntity` but has an `updated_at` column because its `status` transitions (`pending` → `sent`/`failed`/`delivered`) are in-place updates, not new rows.

### Rate Limiting

Simple in-memory rate limiting via a Spring filter (Bucket4j or custom token bucket):
- `/api/notifications/send` — 10 requests/minute per user
- `/api/analytics/events/batch` — 30 requests/minute per user
- `/api/crash-reports` (POST) — 30 requests/minute per user
- `/api/sync/push` — 30 requests/minute per user
- All other endpoints — 100 requests/minute per user

Rate limit headers returned: `X-RateLimit-Remaining`, `X-RateLimit-Reset`. Returns HTTP 429 when exceeded.

### Database Indexes

Defined in Flyway migrations alongside table creation:
- `analytics_events(user_id, timestamp)` — filtered event queries
- `crash_reports(user_id, created_at)` — listing
- `sync_records(user_id, version)` — pull queries
- `notification_history(user_id, created_at)` — history listing
- `tasks(user_id, status)` — filtered task queries
- `device_tokens(user_id)` — token lookup by user

### Default Sort Orders

- Tasks: `created_at DESC`
- Analytics events: `timestamp DESC`
- Crash reports: `timestamp DESC`
- Notification history: `sent_at DESC NULLS LAST`
- Sync pull: `version ASC`

### LocalStack Limitations

LocalStack Community (free) has limited Cognito support. Known constraints:
- `USER_PASSWORD_AUTH` flow works for basic `InitiateAuth`
- Token refresh via `InitiateAuth` with `REFRESH_TOKEN_AUTH` has partial support
- JWKS endpoint is emulated but tokens may differ slightly from real Cognito
- **Workaround:** For local dev, Spring Security can be configured with a dev profile that uses a simplified JWT validation (symmetric key) instead of JWKS when `spring.profiles.active=dev`. Production profile uses real Cognito JWKS.
- If LocalStack limitations become blocking, consider upgrading to LocalStack Pro or using a real Cognito user pool for dev (free tier covers it).

### Error Handling

Global `@RestControllerAdvice` with consistent response format:

```json
{
  "status": 422,
  "error": "Validation Error",
  "message": "Title is required",
  "timestamp": "2026-03-13T10:00:00Z",
  "path": "/api/tasks",
  "fieldErrors": [
    { "field": "title", "message": "must not be blank" }
  ]
}
```

Status codes:
- 400 — bad request
- 401 — invalid/missing JWT
- 403 — forbidden (accessing another user's resource)
- 404 — resource not found
- 422 — validation error (with field-level detail)
- 429 — rate limit exceeded
- 500 — unexpected server error

### CORS

- Dev: allow all origins (`*`)
- Configurable via `application.yml` for production

### Swagger UI

- Available at `/swagger-ui.html`
- All endpoints documented with request/response schemas
- JWT auth support (paste token to test protected endpoints)

### Health Check

- Spring Actuator at `/actuator/health`
- Checks DB connectivity and app status

### Logging

- SLF4J + Logback
- Request/response logging in dev
- Structured JSON logs in Docker

---

## Mobile App Changes Required

After the backend is built, the starter kit needs updates to connect:

1. **`starterConfig.api.baseUrl`** — point to `http://localhost:8080` (or Docker host IP)
2. **Auth provider** — update Amplify config to point to LocalStack Cognito
3. **Analytics provider** — implement a `backend` provider that POSTs to `/api/analytics/events`
4. **Crash reporting provider** — implement a `backend` provider that POSTs to `/api/crash-reports`
5. **Notifications provider** — update to register tokens with `/api/notifications/tokens`
6. **i18n** — optionally fetch translations from `/api/i18n/{locale}`
7. **Sync** — wire `useStorage` sync to `/api/sync/push` and `/api/sync/pull`
8. **Demo screen** — new tab or screen to exercise all features against the real backend

These mobile changes are **out of scope** for this spec — they will be a separate design cycle after the backend is running.
