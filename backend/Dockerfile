# Build & Install dependencies
FROM python:3.11-slim AS build-env

WORKDIR /app

RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"

COPY . .

RUN pip install --upgrade pip &&pip install --no-cache-dir -r requirements.txt

# Stage final
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies (postgresql-client for pg_dump)
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build-env /venv /venv
COPY --from=build-env /app /app

ENV PATH="/venv/bin:$PATH"
ENV PYTHONPATH=/venv/lib/python3.11/site-packages

# Command is overridden in docker-compose for dev, but good default
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
