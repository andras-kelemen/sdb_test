# Python code formatters
.PHONY: format check-lint

# Show help
.PHONY: help

help:
	@echo "Available commands:"
	@echo ""
	@echo "  make up                # Start Docker containers"
	@echo "  make down              # Stop containers"
	@echo "  make restart           # Restart containers"
	@echo ""
	@echo "  make migrate           # Run Django migrations inside container"
	@echo "  make makemigrations    # Run makemigrations inside container"
	@echo "  make createsuperuser   # Create Django superuser inside container"
	@echo "  make shell             # Open Django shell inside container"
	@echo "  make be-test              # Run Django tests"
	@echo "  make fe-test              # Run frontend tests"
	@echo ""
	@echo "  make be-format            # Format backend code using Black and Ruff"
	@echo "  make be-lint        # Check linting (Black --check + Ruff)"
	@echo "  make fe-format            # Format frontend code using Prettier"
	@echo "  make fe-lint        # Check linting (Prettier --check + ESLint)"

# Docker Compose
COMPOSE=docker compose
BACKEND_SERVICE=backend
FRONTEND_SERVICE=frontend

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) down && $(COMPOSE) up -d

# Django commands
migrate:
	$(COMPOSE) exec $(BACKEND_SERVICE) python manage.py migrate

makemigrations:
	$(COMPOSE) exec $(BACKEND_SERVICE) python manage.py makemigrations

createsuperuser:
	$(COMPOSE) exec $(BACKEND_SERVICE) python manage.py createsuperuser

shell:
	$(COMPOSE) exec $(BACKEND_SERVICE) python manage.py shell

be-test:
	$(COMPOSE) exec $(BACKEND_SERVICE) pytest

be-format:
	$(COMPOSE) exec $(BACKEND_SERVICE) black .
	$(COMPOSE) exec $(BACKEND_SERVICE) ruff --fix

be-lint:
	$(COMPOSE) exec $(BACKEND_SERVICE) ruff check .
	$(COMPOSE) exec $(BACKEND_SERVICE) black --check .


fe-test:
	$(COMPOSE) exec $(FRONTEND_SERVICE) npm run test

fe-format:
	$(COMPOSE) exec $(FRONTEND_SERVICE) npm run format

fe-lint:
	$(COMPOSE) exec $(FRONTEND_SERVICE) npm run lint