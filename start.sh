#!/usr/bin/env bash
set -e

# Make /app/src your import root so "import models" works
export PYTHONPATH="/app/src:${PYTHONPATH}"

echo "[START] Listing frontend dist:"
ls -lah /app/frontend/dist || true
ls -lah /app/frontend/dist/assets || true

echo "[START] Booting Gunicorn…"
# point to your Flask app object location (main.py has `app = Flask(__name__)`)
exec gunicorn -w 1 -k gthread -b 0.0.0.0:8080 src.main:app