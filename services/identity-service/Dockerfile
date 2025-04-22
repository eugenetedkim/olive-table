# services/identity-service/Dockerfile

# ------------------------------------------------------------------------
# Base Image Selection
# ------------------------------------------------------------------------

FROM node:16-alpine
# Uses the official Node.js 16 Alpine Linux image as the base
# Alpine Linux provides a minimal footprint while still supporting Node.js
# This reduces the overall container size and potential attack surface

# ------------------------------------------------------------------------
# Working Directory Setup
# ------------------------------------------------------------------------

WORKDIR /app
# Sets the working directory inside the container to /app
# All subsequent commands will be executed relative to this directory
# This creates a dedicated space for the application code

# ------------------------------------------------------------------------
# Dependency Installation (Optimized for Caching)
# ------------------------------------------------------------------------

COPY package*.json ./
# Copies package.json and package-lock.json (if it exists) to the working directory
# This step is separated from copying the entire codebase to leverage Docker's layer caching
# If dependencies don't change, this layer can be reused in subsequent builds

RUN npm install
# Installs all dependencies defined in package.json
# Creates a node_modules directory with all required packages
# Using a separate step means this only needs to be rebuilt if dependencies change

# ------------------------------------------------------------------------
# Application Code Copy
# ------------------------------------------------------------------------

COPY . .
# Copies the entire application codebase into the container
# This includes source code, configuration files, and any other project files
# Performed after dependency installation to ensure better layer caching

# ------------------------------------------------------------------------
# Port Configuration
# ------------------------------------------------------------------------

EXPOSE 3001
# Documents that the container listens on port 3001 at runtime
# This matches the default port used by the identity service
# Note: This is documentation-only and doesn't actually publish the port

# ------------------------------------------------------------------------
# Application Startup Command
# ------------------------------------------------------------------------

CMD ["node", "src/index.js"]
# Defines the command to run when the container starts
# Directly starts the Node.js application using the entry point file
# No build step is needed as this is a JavaScript application, not TypeScript