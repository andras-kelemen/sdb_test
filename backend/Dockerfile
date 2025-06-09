# backend/Dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Intalling basic dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Installing Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

ENV PATH="/root/.local/bin:$PATH"

# Configuring Poetry
RUN poetry config virtualenvs.create false

# Installing project dependencies
COPY backend/pyproject.toml backend/poetry.lock* /app/
RUN poetry install --no-root --no-interaction --no-ansi

# Copying the application code
COPY backend/ /app/

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]