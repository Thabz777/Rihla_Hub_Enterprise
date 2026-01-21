# Node.js Dockerfile for Rihla Backend (Cloud Run)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json to install dependencies first (caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the API Port
EXPOSE 5000

# Start command
CMD ["npm", "start"]
