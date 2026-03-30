# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies if needed, but not here)
# npm ci is faster and more reliable in CI
RUN npm ci

# Stage 2: Runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Copy source code
COPY server.js ./
COPY src ./src
# Copy cleanup scripts if needed for production maintenance
COPY cleanup-orphaned.js ./
COPY check-orphaned.js ./

# Set Environment Variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/status || exit 1

# Start the application
CMD ["node", "server.js"]
