# Stage 1: Build & Dependencies
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Set Vite environment variables at BUILD TIME (Essential for production build)
ARG VITE_NASA_API_KEY
ARG VITE_NASA_BASE_URL
ARG VITE_API_BASE_URL

ENV VITE_NASA_API_KEY=$VITE_NASA_API_KEY
ENV VITE_NASA_BASE_URL=$VITE_NASA_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build Vite application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:stable-alpine

# Set working directory to Nginx html directory
WORKDIR /usr/share/nginx/html

# Copy built assets
COPY --from=build /app/dist .

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
