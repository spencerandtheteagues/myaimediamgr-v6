#!/usr/bin/env bash
set -e
export PYTHONPATH="/app/src:${PYTHONPATH}"

echo "[START] Listing frontend dist:"
ls -lah /app/frontend/dist || true
ls -lah /app/frontend/dist/assets || true

echo "[START] Booting Gunicorn…"
exec gunicorn -w 1 -k gthread -b 0.0.0.0:8080 src.main:app
