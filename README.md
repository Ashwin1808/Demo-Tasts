# Task Manager — Simple Monolith for DevOps/DevSecOps

Small, production-structured **Task Manager** app designed as a stable base for a full DevOps/DevSecOps pipeline (Git → GitHub → Maven → Tests → SonarQube → Trivy → Docker → Registry → K8s/Helm → GitHub Actions → Argo CD → Terraform → AWS/EKS/RDS → Prometheus/Grafana).

No auth, no microservices, no queues — just a reliable monolith that containerizes cleanly.

## What it does

- Create / view / update / delete tasks
- Mark tasks as `PENDING` or `COMPLETED`
- Dashboard shows total / completed / pending counts
- Health check endpoint for liveness

Task fields: `id`, `title`, `description`, `status`, `createdAt`, `updatedAt`.

## Architecture

```
Browser (React + Vite)  -->  Spring Boot REST API  -->  PostgreSQL
        :3000 (nginx)              :8080                     :5432
```

- **Frontend**: React 18 + Vite, plain fetch, no UI framework bloat. Built to static files served by Nginx.
- **Backend**: Java 21, Spring Boot 3.2, Spring Data JPA, Validation, PostgreSQL driver. Single jar.
- **DB**: PostgreSQL 16, schema auto-managed by Hibernate `ddl-auto=update` (table `tasks`).

```
task-manager/
├── frontend/               # Vite + React
│   ├── src/                # App.jsx, api.js, index.css, main.jsx
│   ├── Dockerfile          # multi-stage node → nginx
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
├── backend/                # Spring Boot (Maven)
│   ├── src/main/java/com/taskmanager/
│   │   ├── controller/     # TaskController, HealthController
│   │   ├── service/        # TaskService
│   │   ├── repository/     # TaskRepository (JpaRepository)
│   │   ├── model/          # Task (JPA entity)
│   │   ├── dto/            # TaskRequest
│   │   └── config/         # WebConfig (CORS)
│   ├── src/main/resources/application.properties
│   ├── src/test/java/...   # Integration tests (H2)
│   ├── Dockerfile          # multi-stage maven → jre
│   └── pom.xml
├── docker-compose.yml      # frontend + backend + postgres
├── .env.example
├── .gitignore
└── README.md
```

## Prerequisites

- Java 21, Maven 3.9+
- Node 20+, npm
- Docker & Docker Compose v2
- (Optional) PostgreSQL 16 if running backend natively

## Run locally (without Docker)

1. Start PostgreSQL locally and set env or edit `.env`:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=taskdb
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
createdb taskdb   # if needed
```

2. Backend:

```bash
cd backend
mvn test
mvn spring-boot:run
# or: mvn package && java -jar target/task-manager-1.0.0.jar
# API at http://localhost:8080/api/health
```

3. Frontend:

```bash
cd frontend
npm install
# point to backend (defaults to http://localhost:8080)
echo "VITE_API_URL=http://localhost:8080" > .env
npm run dev   # http://localhost:5173  (proxies /api to 8080)
```

## Run with Docker Compose (recommended)

```bash
cp .env.example .env   # adjust if needed
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:8080/api/health
- Postgres: localhost:5432 (taskdb / postgres / postgres)

Stop: `docker compose down` — add `-v` to wipe DB volume.

Frontend build arg: `VITE_API_URL` is baked at build time (Dockerfile `ARG`). Compose uses default `http://localhost:8080` which works locally; for remote deploy set `VITE_API_URL` accordingly and rebuild.

## API Endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | `{ "status": "UP" }` |
| GET | `/api/tasks` | — | List all tasks |
| GET | `/api/tasks/{id}` | — | Get one task (404 if missing) |
| POST | `/api/tasks` | `{ title*, description, status }` | Create; status defaults to PENDING |
| PUT | `/api/tasks/{id}` | `{ title, description, status }` | Partial update; status must be PENDING/COMPLETED |
| DELETE | `/api/tasks/{id}` | — | Delete (204) |

Example:

```bash
curl http://localhost:8080/api/health
curl http://localhost:8080/api/tasks
curl -X POST http://localhost:8080/api/tasks -H 'Content-Type: application/json' -d '{"title":"Buy milk"}'
curl -X PUT http://localhost:8080/api/tasks/1 -H 'Content-Type: application/json' -d '{"status":"COMPLETED"}'
curl -X DELETE http://localhost:8080/api/tasks/1
```

## Environment Variables

Backend (`application.properties` reads these with defaults shown):

| Var | Default | Description |
|-----|---------|-------------|
| `DB_HOST` | `localhost` | Postgres host |
| `DB_PORT` | `5432` | Postgres port |
| `DB_NAME` | `taskdb` | Database name |
| `DB_USERNAME` | `postgres` | DB user |
| `DB_PASSWORD` | `postgres` | DB password |
| `SERVER_PORT` | `8080` | Backend port |

Frontend build-time:

| Var | Default | Description |
|-----|---------|-------------|
| `VITE_API_URL` | `http://localhost:8080` | Backend base URL baked into `dist/` |

`docker-compose.yml` wires `backend.DB_HOST=postgres` (service name) automatically.

## How the database works

- Table `tasks` (JPA `@Entity`, `@Table(name="tasks")`) created by Hibernate `ddl-auto=update`.
- Columns: `id` (BIGSERIAL PK), `title` (NOT NULL), `description` (TEXT), `status` (VARCHAR 20, `PENDING`/`COMPLETED`), `created_at`, `updated_at` (managed by `@CreationTimestamp`/`@UpdateTimestamp`).
- No migrations needed for this stage; later pipeline can introduce Flyway/Liquibase if desired.
- Tests use H2 in-memory (`create-drop`) so no external DB required for `mvn test`.

## Testing

```bash
cd backend
mvn test
```

Covers: context load, health endpoint, create→get→list→update→delete lifecycle, validation (missing title → 400).

## Next steps (pipeline)

This monolith is intentionally ready for: Maven build, JUnit, SonarQube, Trivy image scan, Docker Hub/ECR push, K8s manifests/Helm, GitHub Actions, Argo CD GitOps, Terraform (VPC/EKS/RDS), Prometheus/Grafana.

