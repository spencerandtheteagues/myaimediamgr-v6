# Railway Deployment Guide

This guide will walk you through the process of deploying your project to Railway.

## 1. Create a New Project on Railway

1.  Go to your Railway dashboard and click "New Project".
2.  Select "Deploy from GitHub repo" and choose your repository.

## 2. Configure the Services

You will need to create three services in your Railway project:

### Frontend

*   **Name**: `frontend`
*   **Root Directory**: `/`
*   **Build Command**: `npm run build`
*   **Start Command**: `npm start`

### Backend (Node.js)

*   **Name**: `backend-node`
*   **Root Directory**: `server`
*   **Build Command**: `esbuild index.ts --platform=node --bundle --format=cjs --outfile=dist/index.cjs`
*   **Start Command**: `node dist/index.cjs`

### Backend (Python)

*   **Name**: `backend-python`
*   **Root Directory**: `myaimediamgr_project/myaimediamgr-backend`
*   **Build Command**: (leave blank, Railway will use the Dockerfile)
*   **Start Command**: `gunicorn -b 0.0.0.0:80 src.main:app`

## 3. Set Environment Variables

Go to the "Variables" tab for each service and add the necessary environment variables from your `.env.example` file.

## 4. Deploy

Once you've configured all the services, Railway will automatically deploy your application. You can monitor the deployment process in the "Deployments" tab for each service.
