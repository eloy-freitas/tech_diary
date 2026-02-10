# Build & Install dependencies
FROM python:3.11-slim AS build-env

WORKDIR /app

RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"

# Install system dependencies (needed for psycopg2 compilation sometimes, though binary is used)
# and for other potential tools like curl
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Satage final
FROM gcr.io/distroless/python3-debian12:nonroot

WORKDIR /app

COPY --from=build-env /venv /venv
COPY --from=build-env /app /app

ENV PYTHONPATH=/venv/lib/python3.11/site-packages

# Command is overridden in docker-compose for dev, but good default
CMD ["-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
