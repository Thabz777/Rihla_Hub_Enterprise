# 🐳 Docker Deployment Guide

## Quick Start with Docker

### Prerequisites
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)

### Option 1: Run Everything Locally with Docker Compose

This will run MongoDB, Backend, and Frontend all in containers:

```bash
# Navigate to project directory
cd "D:\Antigravity Workspace\Rihla_Hub"

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

**Access the application**:
- Frontend: http://localhost
- Backend API: http://localhost:8000
- MongoDB: localhost:27017

### Option 2: Build Individual Containers

**Backend Only**:
```bash
cd backend
docker build -t rihla-backend .
docker run -p 8000:8000 \
  -e MONGO_URL="your-mongodb-url" \
  -e DB_NAME="rihla_enterprise" \
  -e SECRET_KEY="your-secret-key" \
  rihla-backend
```

**Frontend Only**:
```bash
cd frontend
docker build -t rihla-frontend .
docker run -p 80:80 rihla-frontend
```

## Deploy to Cloud with Docker

### AWS ECS (Elastic Container Service)

1. **Push images to ECR**:
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag images
docker tag rihla-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rihla-backend:latest
docker tag rihla-frontend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rihla-frontend:latest

# Push images
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rihla-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/rihla-frontend:latest
```

2. **Create ECS Task Definitions** for backend and frontend
3. **Create ECS Service** and deploy

### Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/rihla-backend ./backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/rihla-frontend ./frontend

# Deploy to Cloud Run
gcloud run deploy rihla-backend \
  --image gcr.io/YOUR_PROJECT_ID/rihla-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy rihla-frontend \
  --image gcr.io/YOUR_PROJECT_ID/rihla-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Container Instances

```bash
# Login to Azure
az login

# Create resource group
az group create --name rihla-rg --location eastus

# Create container registry
az acr create --resource-group rihla-rg --name rihlaregistry --sku Basic

# Build and push images
az acr build --registry rihlaregistry --image rihla-backend:latest ./backend
az acr build --registry rihlaregistry --image rihla-frontend:latest ./frontend

# Deploy containers
az container create \
  --resource-group rihla-rg \
  --name rihla-backend \
  --image rihlaregistry.azurecr.io/rihla-backend:latest \
  --dns-name-label rihla-backend \
  --ports 8000

az container create \
  --resource-group rihla-rg \
  --name rihla-frontend \
  --image rihlaregistry.azurecr.io/rihla-frontend:latest \
  --dns-name-label rihla-frontend \
  --ports 80
```

### DigitalOcean App Platform

1. Push code to GitHub
2. Go to DigitalOcean App Platform
3. Create new app from GitHub repository
4. Select "Dockerfile" as build method
5. Configure environment variables
6. Deploy

## Production Best Practices

### 1. Use Multi-Stage Builds
Already implemented in the Dockerfiles to minimize image size.

### 2. Security Scanning
```bash
# Scan images for vulnerabilities
docker scan rihla-backend
docker scan rihla-frontend
```

### 3. Health Checks
Already configured in docker-compose.yml

### 4. Resource Limits
Add to docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 5. Logging
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Export logs
docker-compose logs > deployment.log
```

## Kubernetes Deployment (Advanced)

See `kubernetes/` directory for:
- Deployment manifests
- Service definitions
- Ingress configuration
- ConfigMaps and Secrets

```bash
# Apply Kubernetes configurations
kubectl apply -f kubernetes/
```

## Troubleshooting

**Container won't start**:
```bash
docker-compose logs backend
docker-compose logs frontend
```

**Network issues**:
```bash
docker network ls
docker network inspect rihla_rihla-network
```

**Database connection fails**:
- Ensure MongoDB container is running
- Check connection string format
- Verify network connectivity

**Rebuild after changes**:
```bash
docker-compose up -d --build
```

## Monitoring

Use Docker stats to monitor resource usage:
```bash
docker stats
```

Or integrate with monitoring tools:
- Prometheus + Grafana
- Datadog
- New Relic
- AWS CloudWatch

---

**For production deployments, always use managed databases (MongoDB Atlas) instead of containerized MongoDB.**
