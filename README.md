# Sezzle Calculator

A full-stack calculator application composed of a **Go (Gin)** REST API and a **React + TypeScript (Vite)** single-page frontend. The backend performs the arithmetic; the frontend provides the UI and calls the API.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Running the Project](#running-the-project)
  - [Option A — Docker (backend + frontend together)](#option-a--docker-backend--frontend-together)
  - [Option B — Local development](#option-b--local-development)
- [API Reference](#api-reference)
  - [Supported operations](#supported-operations)
  - [Example calls](#example-calls)
- [Testing & Coverage](#testing--coverage)
- [Design Decisions](#design-decisions)

---

## Architecture

```
┌──────────────────────────── Docker container ────────────────────────────┐
│                                                                           │
│  Browser ──HTTP :80──▶  nginx  ──┬── /            → React static files     │
│                                  ├── /calculate   → proxy 127.0.0.1:8080   │
│                                  └── /swagger/     → proxy 127.0.0.1:8080   │
│                                                        │                   │
│                                                   Go / Gin API             │
└───────────────────────────────────────────────────────────────────────────┘
```

- The **backend** exposes a single JSON endpoint, `POST /calculate`, plus interactive Swagger docs at `/swagger/`.
- The **frontend** is a static SPA built with Vite. API calls are made to a **relative** path (`/calculate`), so the same-origin nginx reverse proxy forwards them to the Go service. This avoids hardcoding the backend host in the browser bundle.

---

## Tech Stack

| Layer     | Technology                                             |
| --------- | ------------------------------------------------------ |
| Backend   | Go 1.25, [Gin](https://github.com/gin-gonic/gin), Swagger (swaggo) |
| Frontend  | React 19, TypeScript, Vite, Vitest + Testing Library   |
| Packaging | Multi-stage Docker image, nginx (static server + reverse proxy) |

---

## Project Structure

```
.
├── Dockerfile                 # Multi-stage build for backend + frontend
├── docker/
│   ├── nginx.conf             # Serves the SPA and proxies the API
│   └── entrypoint.sh          # Starts the Go binary + nginx in one container
├── backend/
│   ├── cmd/api/main.go        # Entry point (Gin router, middleware, swagger)
│   ├── internal/
│   │   ├── calculator/
│   │   │   ├── handler/       # HTTP layer (request binding, status codes)
│   │   │   ├── service/       # Business logic (arithmetic, domain errors)
│   │   │   ├── model/         # Request / Response / Operation types
│   │   │   └── routes/        # Route registration
│   │   └── middleware/        # CORS middleware
│   └── docs/                  # Generated Swagger spec
└── frontend/
    └── src/
        └── features/calculator/
            ├── api/           # API client (fetch wrapper)
            ├── components/    # UI components
            ├── hooks/         # useCalculator state hook
            └── utils/         # Operator helpers
```

---

## Running the Project

### Option A — Docker (backend + frontend together)

A single multi-stage image builds both the Go binary and the static frontend, then serves everything through nginx on one port.

```bash
# Build the image
docker build -t sezzle-calculator .

# Run it (host port 8080 → container port 80)
docker run -p 8080:80 sezzle-calculator
```

Then open:

- **App:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger/index.html

### Option B — Local development

Run the two services separately for hot-reload during development.

**Backend** (defaults to `:8080`):

```bash
cd backend
go run ./cmd/api
```

**Frontend** (Vite dev server, defaults to `:5173`):

```bash
cd frontend
npm install
npm run dev
```

The frontend reads the backend URL from `frontend/.env`:

```
VITE_API_URL=http://localhost:8080
```

> In the Docker build this variable is set to an empty string so the browser uses relative URLs and nginx handles the proxying.

**Useful commands:**

```bash
# Backend tests
cd backend && go test ./...

# Frontend tests / build / lint
cd frontend && npm run test
cd frontend && npm run build
cd frontend && npm run lint
```

---

## API Reference

### `POST /calculate`

**Request body**

| Field       | Type     | Description                                                  |
| ----------- | -------- | ------------------------------------------------------------ |
| `operation` | string   | One of the supported operations (see below)                  |
| `operand1`  | number   | First operand                                                |
| `operand2`  | number   | Second operand (ignored by unary operations like `squareRoot`) |

**Responses**

| Status | Body                          | When                                                        |
| ------ | ----------------------------- | ----------------------------------------------------------- |
| `200`  | `{ "result": number }`        | Success                                                     |
| `400`  | `{ "error": string }`         | Invalid payload, invalid operation, division by zero, or square root of a negative number |

### Supported operations

| Operation    | Formula                    | Notes                          |
| ------------ | -------------------------- | ------------------------------ |
| `add`        | `operand1 + operand2`      |                                |
| `subtract`   | `operand1 - operand2`      |                                |
| `multiply`   | `operand1 * operand2`      |                                |
| `divide`     | `operand1 / operand2`      | Error if `operand2 == 0`       |
| `exponent`   | `operand1 ^ operand2`      |                                |
| `squareRoot` | `√operand1`                | Unary; error if `operand1 < 0` |
| `percent`    | `(operand1 / 100) * operand2` | e.g. 50% of 200 = 100       |

### Example calls

**Addition**

```bash
curl -X POST http://localhost:8080/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"add","operand1":2,"operand2":3}'
# → {"result":5}
```

**Division**

```bash
curl -X POST http://localhost:8080/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"divide","operand1":10,"operand2":4}'
# → {"result":2.5}
```

**Square root (unary — only `operand1` is used)**

```bash
curl -X POST http://localhost:8080/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"squareRoot","operand1":9,"operand2":0}'
# → {"result":3}
```

**Percent (50% of 200)**

```bash
curl -X POST http://localhost:8080/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"percent","operand1":50,"operand2":200}'
# → {"result":100}
```

**Error — division by zero**

```bash
curl -X POST http://localhost:8080/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"divide","operand1":1,"operand2":0}'
# → 400 {"error":"division by zero"}
```

---

## Testing & Coverage

Both sides ship unit tests. The backend uses Go's built-in `testing` package with
table-driven tests; the frontend uses **Vitest** + **React Testing Library**, with
the API layer mocked so no running backend is required.

### Backend

```bash
cd backend

# Run all tests
go test ./...

# Run with a coverage summary
go test ./... -cover

# Generate a coverage profile and a per-function breakdown
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out

# Open an HTML coverage report
go tool cover -html=coverage.out -o coverage.html
```

**What's covered:** the service (all arithmetic paths and every domain error),
the HTTP handler (success, validation, malformed JSON), the CORS middleware
(headers + preflight), and route registration. All application logic is at
**100%**; the only uncovered code is the `main` entry point and generated Swagger
docs, so the overall statement coverage is ~86%.

### Frontend

```bash
cd frontend

# Run all tests
npm run test

# Run with a coverage report (text + HTML + lcov)
npm run test:coverage
```

The HTML report is written to `frontend/coverage/index.html`.

**What's covered:** the `useCalculator` hook (input, operations, percent logic,
history, keyboard handling, error handling), the HTTP client (`lib/http.ts`),
the API client (`api/calculate.ts`), and UI components. Statement coverage is
~92%, with **100% of functions** exercised. Bootstrap files (`main.tsx`,
`App.tsx`) and type-only modules are excluded from the coverage numbers via
`vite.config.ts`.

---

## Design Decisions

**Layered backend (handler → service → model).**
The HTTP concern (request binding, status codes) lives in the `handler` layer, while the arithmetic and domain rules live in the `service` layer. This keeps business logic framework-agnostic and easy to unit-test without spinning up an HTTP server (see `service/calculator_test.go`).

**Domain errors as sentinel values.**
The service returns typed sentinel errors (`ErrDivisionByZero`, `ErrNegativeRoot`, `ErrInvalidOperation`) instead of raw strings. The handler maps any service error to a `400` with the error message in the body, keeping error semantics centralized and translatable.

**Typed operations.**
`Operation` is a dedicated string type with named constants rather than free-form strings, making the set of valid operations explicit and self-documenting in the Swagger spec.

**Single container via nginx reverse proxy.**
Instead of coupling the two services with a compile-time backend URL baked into the frontend bundle, the frontend issues **relative** API requests and nginx proxies them to the Go process. Benefits:
- One exposed port; the browser never talks to `:8080` directly.
- No CORS concerns in the containerized deployment (same origin).
- The frontend bundle is environment-agnostic — the same build runs anywhere.

**Multi-stage Docker build.**
The image builds the frontend (Node stage) and the Go binary (Go stage) separately, then copies only the artifacts into a slim `nginx:alpine` runtime. The final image ships no Node or Go toolchain — just static assets and a single static binary.

**Feature-based frontend structure.**
Frontend code is organized by feature (`features/calculator/{api,components,hooks,utils}`) rather than by technical type, so everything related to the calculator lives together and the codebase scales by feature.

**API client abstraction.**
A small `lib/http.ts` wrapper centralizes fetch logic, JSON handling, and a typed `HttpError`, so components and hooks don't repeat request boilerplate and error handling stays consistent.
