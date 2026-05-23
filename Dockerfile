FROM python:3.10-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    OMP_NUM_THREADS=1 \
    MKL_NUM_THREADS=1 \
    OPENBLAS_NUM_THREADS=1 \
    NUMEXPR_NUM_THREADS=1 \
    MALLOC_TRIM_THRESHOLD_=65536

# System deps (often required for opencv) + curl for Node setup
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 gcc curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ---- Install Node.js (for building the React frontend) ----
# Using Debian/Ubuntu repositories via Nodesource
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# ---- Copy code ----
COPY backend/ /app/backend/
COPY frontend/ /app/frontend/
COPY . /app

# ---- Install python deps ----
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# ---- Build React and place into backend/dist ----
# Ensures backend.api serves the UI from backend/dist
RUN cd /app/frontend \
    && npm ci \
    && npm run build \
    && rm -rf /app/backend/dist \
    && cp -r /app/frontend/dist /app/backend/dist

EXPOSE 8000

# Run from backend/ so imports like `from pipeline...` resolve correctly
WORKDIR /app/backend

CMD ["sh", "-c", "python -m uvicorn api:app --host 0.0.0.0 --port ${PORT:-8000}"]



