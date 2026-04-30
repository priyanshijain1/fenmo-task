FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy application code
COPY backend/ ./backend

EXPOSE 8000

CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "backend.main:app", "-c", "backend/gunicorn_config.py"]
