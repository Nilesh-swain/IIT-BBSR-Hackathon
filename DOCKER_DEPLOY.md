# Docker Deployment Guide - Antariksh Project

This guide explains how to deploy the Antariksh project using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Quick Start

1. **Clone the repository** (if not already done).
2. **Configure Environment Variables**:
   - Ensure `backend/.env` is properly configured with your keys (NASA API, JWT Secret, etc.).
   - The `docker-compose.yml` automatically handles the MongoDB connection within the container network.
3. **Build and Start**:
   ```bash
   docker-compose up -d --build
   ```
4. **Access the application**:
   - Frontend: `http://localhost` (Port 80)
   - Backend API Status: `http://localhost/api/status`

## Container Overview

| Container | Purpose | Port (Internal) | Port (External) |
| :--- | :--- | :--- | :--- |
| `mongo` | MongoDB Database | 27017 | N/A (Internal only) |
| `backend` | Node.js API Server | 5000 | N/A (Proxied via Nginx) |
| `frontend` | React/Vite + Nginx | 80 | 80 |

## Health Checks

All containers are configured with health checks:
- **Mongo**: Pings the database to ensure it's ready.
- **Backend**: Checks the `/status` endpoint.
- **Frontend**: Checks if Nginx is serving the index page.

`docker-compose` will ensure that services start only when their dependencies are healthy.

## Maintenance

- **View Logs**:
  ```bash
  docker-compose logs -f
  ```
- **Stop services**:
  ```bash
  docker-compose down
  ```
- **Prune volumes** (Warning: This deletes database data):
  ```bash
  docker-compose down -v
  ```

## Production Notes

- **CORS**: The backend's `CLIENT_URL` in `.env` should match your production domain.
- **SSL**: For production, it is recommended to put an SSL proxy (like Certbot/Nginx or Cloudflare) in front of the frontend container.
