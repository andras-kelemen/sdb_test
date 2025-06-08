# Project README

This project is a full-stack application built with **Django** on the backend and a modern frontend (React or similar). It uses **Docker Compose** to orchestrate backend and frontend services.

---

## Prerequisites

- Docker & Docker Compose installed on your machine  
- (Optional) Python 3.8+ installed locally if running Django commands outside Docker  
- Node.js installed locally if running frontend commands outside Docker  

---

## Quickstart

Start the entire application stack with Docker Compose:

```bash
make up
```

Stop all running containers:

```bash
make down
```

Restart the containers (stop and start):

```bash
make restart
```

---

## Backend (Django)

Run Django migrations:

```bash
make migrate
```

Create new migrations after model changes:

```bash
make makemigrations
```

Create a Django superuser (inside backend container):

```bash
make createsuperuser
```

Open Django shell inside backend container:

```bash
make shell
```

Run backend tests (pytest):

```bash
make be-test
```

Format backend Python code using Black and Ruff:

```bash
make be-format
```

Check backend linting (Black and Ruff):

```bash
make be-lint
```

---

## Frontend

Run frontend tests:

```bash
make fe-test
```

Format frontend code using Prettier:

```bash
make fe-format
```

Check frontend linting (Prettier and ESLint):

```bash
make fe-lint
```

---

## Notes

- The backend service runs in the `backend` container.  
- The frontend service runs in the `frontend` container.  
- All commands above run inside the respective containers via Docker Compose.  
- Use `make help` to see all available commands.  

---

## Troubleshooting

- If port conflicts occur (e.g. port 5000 already in use), check your system processes or services like macOS Control Center / AirPlay Receiver.  
- For Django validation errors, use `make shell` to interactively debug.  

---

## Time Log
### 2025-06-06
- FE development: ~6 hours
- BE development: ~1 hour

### 2025-06-07
- FE development: ~4 hours
- BE development: ~1 hours
- Tests: ~1 hour
- Lint & Format: ~1 hours
- Docker: ~1 hours

### 2025-06-08
- FE development: ~1 hours
- BE development: ~1 hour
- Tests: ~1 hour
- Lint & Format: ~1 hour
- Docker: ~1 hour

---

### Summary:
- Frontend total: ~11 hours
- Backend total: ~3 hours
- Tests total: ~2.5 hours
- Lint & Format total: ~2 hours
- Docker total: ~2 hours