FROM python:3.11-slim

WORKDIR /app

# Create a non-root user
RUN useradd -m appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Change ownership of the app directory to the new user
RUN chown -R appuser:appuser /app

# Switch to the non-root user
USER appuser

CMD ["gunicorn", "app.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
