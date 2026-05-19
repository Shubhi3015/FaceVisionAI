FROM python:3.10-slim

WORKDIR /app

# System deps (often required for opencv)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy backend
COPY backend/ /app/backend/

# Copy app root (for completeness; includes backend/models/, pipeline/, etc.)
COPY . /app

# Install python deps
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

EXPOSE 8000

# FastAPI serves React build from backend/dist (build your frontend locally and copy into backend/dist)
CMD ["python", "-m", "uvicorn", "backend.api:app", "--host", "0.0.0.0", "--port", "8000"]

