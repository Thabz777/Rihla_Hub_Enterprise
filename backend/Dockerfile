FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies (npm install is safer than ci when lockfile is missing/mismatched)
RUN npm install --production

# Copy application code
COPY . .

# Expose the standard port
EXPOSE 8080

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Start server
CMD ["node", "server-mongodb.js"]
