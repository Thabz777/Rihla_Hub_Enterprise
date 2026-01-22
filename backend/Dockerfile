FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies - Use npm install to tolerate lockfile version mismatch
RUN npm install --only=production

# Copy application code
COPY . .

# Expose the port Cloud Run injects
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Run the MongoDB server
CMD ["node", "server-mongodb.js"]
