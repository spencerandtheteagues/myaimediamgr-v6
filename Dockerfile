# ---- Base Image ----
# Use an official Node.js runtime as a parent image.
FROM node:18-bullseye

# Set the working directory in the container
WORKDIR /app

# ---- Install Python ----
# Update package lists and install Python and pip. This is the key fix.
RUN apt-get update && apt-get install -y python3 python3-pip

# ---- Dependencies ----
# Copy package.json and package-lock.json first to leverage Docker layer caching
COPY package*.json ./
# Install Node.js dependencies
RUN npm install

# Install Python dependencies for the backend service
COPY myaimediamgr_project/myaimediamgr-backend/requirements.txt ./myaimediamgr_project/myaimediamgr-backend/requirements.txt
# Use pip3 to be explicit, now that it's installed.
RUN pip3 install --no-cache-dir -r myaimediamgr_project/myaimediamgr-backend/requirements.txt

# ---- Source Code ----
# Copy the rest of the application's source code
COPY . .

# ---- Build Frontend ----
# Build the React client for production
RUN npm run build

# ---- Expose Ports ----
# Expose the port the Node.js server will run on
EXPOSE 8080