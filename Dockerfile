# ---- Base Image ----
# Use an official Node.js runtime as a parent image.
# This image also includes Python, which is convenient for our multi-language setup.
FROM node:18-bullseye

# Set the working directory in the container
WORKDIR /app

# ---- Dependencies ----
# Copy package.json and package-lock.json first to leverage Docker layer caching
COPY package*.json ./
# Install Node.js dependencies
RUN npm install

# Install Python dependencies for the backend service
COPY myaimediamgr_project/myaimediamgr-backend/requirements.txt ./myaimediamgr_project/myaimediamgr-backend/requirements.txt
RUN pip install --no-cache-dir -r myaimediamgr_project/myaimediamgr-backend/requirements.txt

# ---- Source Code ----
# Copy the rest of the application's source code
COPY . .

# ---- Build Frontend ----
# Build the React client for production
RUN npm run build

# ---- Expose Ports ----
# Expose the port the Node.js server will run on
# The Python server will also run, but we'll route to it internally or expose another port.
EXPOSE 8080

# ---- Start Command ----
# Use the start script to run both the Node.js and Python servers
CMD ["./start.sh"]