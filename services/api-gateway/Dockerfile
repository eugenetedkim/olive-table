# services/api-gateway/Dockerfile

# Use a lightweight Node.js image for smaller final build size
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies (use `npm ci` for faster, clean installs in production)
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose port 3000 (same as the one used in Express app)
EXPOSE 3000

# Start the app
CMD ["node", "src/index.js"]
