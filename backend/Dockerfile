FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies WITHOUT lockfile (Ensures build succeeds even if lockfile is broken)
# We strictly exclude package-lock.json from being used here
RUN npm install --omit=dev --no-package-lock

# Copy application code
COPY . .

# Expose the port Cloud Run injects
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Run the MongoDB server
CMD ["node", "server-mongodb.js"]
