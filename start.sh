#!/bin/bash

# Start the Node.js server in the background
echo "Starting Node.js server..."
npm start &

# Start the Python Gunicorn server in the foreground
echo "Starting Python server..."
gunicorn --bind 0.0.0.0:8000 --chdir ./myaimediamgr_project/myaimediamgr-backend/src main:app