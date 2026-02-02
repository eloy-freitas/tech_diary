FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (needed for psycopg2 compilation sometimes, though binary is used)
# and for other potential tools like curl
run apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Command is overridden in docker-compose for dev, but good default
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
