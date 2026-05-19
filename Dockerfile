FROM python:3.10-slim

WORKDIR /app

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

CMD ["python", "-m", "uvicorn", "backend.api:app", "--host", "0.0.0.0", "--port", "8000"]


